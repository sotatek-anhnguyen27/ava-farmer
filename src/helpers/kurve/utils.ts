import {
  Currency,
  CurrencyAmount,
  Fraction,
  JSBI,
  Pair,
  Percent,
  Token,
  TokenAmount,
  Trade,
  TradeType
} from '@/../libs/buni-stable-coins-sdk/src';
import config from '@/config';
import BigNumber from '@/helpers/bignumber';
import { parseUnits } from '@ethersproject/units';
import { Field } from './enum';
import { BasicData } from './interfaces';

export const ZERO_JSBI = JSBI.BigInt(0)

export const BIPS_BASE = JSBI.BigInt(10000);
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW = new Percent(
  JSBI.BigInt(100),
  BIPS_BASE
); // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM = new Percent(
  JSBI.BigInt(300),
  BIPS_BASE
); // 3%
export const ALLOWED_PRICE_IMPACT_HIGH = new Percent(
  JSBI.BigInt(500),
  BIPS_BASE
); // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN = new Percent(
  JSBI.BigInt(1000),
  BIPS_BASE
); // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT = new Percent(
  JSBI.BigInt(1500),
  BIPS_BASE
); // 15%

export function computeFee(pairs?: Array<Pair>): Fraction {
  let realizedLPFee: Fraction = new Fraction(JSBI.BigInt(0));

  // for each hop in our trade, take away the x*y=k price impact from 0.3% fees
  // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1-.03))
  if (pairs) {
    for (let i = 0; i < pairs.length; i++) {
      const fee = pairs[i].fee;
      if (fee) {
        realizedLPFee = realizedLPFee.add(
          new Percent(fee, JSBI.BigInt(1000000000000000000))
        );
      }
    }
  }

  return realizedLPFee;
}

// computes price breakdown for the trade
export function computeTradePriceBreakdown(
  trade?: Trade
): {
  priceImpactWithoutFee?: Percent;
  realizedLPFee?: CurrencyAmount;
  accruedFeePercent: Percent;
} {
  const pairs = trade ? trade.route.pairs : undefined;
  const realizedLPFee: Fraction = computeFee(pairs);
  const accruedFeePercent: Percent = new Percent(
    realizedLPFee.numerator,
    JSBI.BigInt(1000000000000000000)
  );

  // remove lp fees from price impact
  const priceImpactWithoutFeeFraction =
    trade && realizedLPFee
      ? trade.priceImpact.subtract(realizedLPFee)
      : undefined;

  // the x*y=k impact
  const priceImpactWithoutFeePercent = priceImpactWithoutFeeFraction
    ? new Percent(
        priceImpactWithoutFeeFraction?.numerator,
        priceImpactWithoutFeeFraction?.denominator
      )
    : undefined;

  // the amount of the input that accrues to LPs
  const realizedLPFeeAmount =
    realizedLPFee &&
    trade &&
    (trade.inputAmount instanceof TokenAmount
      ? new TokenAmount(
          trade.inputAmount.token,
          realizedLPFee.multiply(trade.inputAmount.raw).quotient
        )
      : CurrencyAmount.ether(
          realizedLPFee.multiply(trade.inputAmount.raw).quotient
        ));

  return {
    priceImpactWithoutFee: priceImpactWithoutFeePercent,
    realizedLPFee: realizedLPFeeAmount,
    accruedFeePercent
  };
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000));
}

// computes the minimum amount out and maximum amount in for a trade given a user specified allowed slippage in bips
export function computeSlippageAdjustedAmounts(
  trade: Trade | undefined,
  allowedSlippage: number
): { [field in Field]?: BigNumber } {
  const pct = basisPointsToPercent(allowedSlippage);
  return {
    [Field.INPUT]: new BigNumber(
      trade?.maximumAmountIn(pct).toSignificant(4) || 0
    ),
    [Field.OUTPUT]: new BigNumber(
      trade?.minimumAmountOut(pct).toSignificant(4) || 0
    )
  };
}

export function tradePriceInfo(tradeInfo: Trade) {
  if (!tradeInfo) {
    return null;
  }
  const price = tradeInfo.executionPrice;
  const show = Boolean(price?.baseCurrency && price?.quoteCurrency);
  if (!show) {
    return null;
  }
  const formattedPrice = price?.toSignificant(6);
  const formattedPriceInverted = price?.invert()?.toSignificant(6);

  const label = `${price?.quoteCurrency?.symbol} per ${price?.baseCurrency?.symbol}`;
  const labelInverted = `${price?.baseCurrency?.symbol} per ${price?.quoteCurrency?.symbol}`;
  return {
    price: `${formattedPrice ?? '-'} ${label}`,
    priceInverted: `${formattedPriceInverted ?? '-'} ${labelInverted}`
  };
}

export function tradeSummaryInfo(tradeInfo: Trade, slippage: number) {
  if (!tradeInfo) {
    return null;
  }
  const isExactIn = tradeInfo.tradeType === TradeType.EXACT_INPUT;
  const {
    priceImpactWithoutFee,
    realizedLPFee,
    accruedFeePercent
  } = computeTradePriceBreakdown(tradeInfo);
  const priceImpact = priceImpactWithoutFee
    ? priceImpactWithoutFee.lessThan(
        new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
      )
      ? '<0.01%'
      : `${priceImpactWithoutFee.toFixed(2)}%`
    : '-';

  // const slippage = parseInt(Storage.getSlippage(), 10) !== 0;
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(
    tradeInfo,
    slippage
  );
  return {
    isExactIn,
    slippageAdjustedAmounts,
    priceImpact,
    realizedLPFee: new BigNumber(realizedLPFee?.toSignificant(4) || 0),
    accruedFeePercent: new BigNumber(accruedFeePercent.toSignificant(2))
  };
}

export function priceImpactSeverityInfo(tradeInfo: Trade) {
  if (!tradeInfo) {
    return 0;
  }
  const { priceImpactWithoutFee } = computeTradePriceBreakdown(tradeInfo);
  if (!priceImpactWithoutFee?.lessThan(BLOCKED_PRICE_IMPACT_NON_EXPERT))
    return 4;
  if (!priceImpactWithoutFee?.lessThan(ALLOWED_PRICE_IMPACT_HIGH)) return 3;
  if (!priceImpactWithoutFee?.lessThan(ALLOWED_PRICE_IMPACT_MEDIUM)) return 2;
  if (!priceImpactWithoutFee?.lessThan(ALLOWED_PRICE_IMPACT_LOW)) return 1;
  return 0;
}

// try to parse a user entered amount for a given token
export function tryParseAmount(
  value?: string,
  currency?: Currency
): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined;
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString();
    if (typedValueParsed !== '0') {
      return currency instanceof Token
        ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
        : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed));
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error);
  }
  // necessary for all paths to return a value
  return undefined;
}

// Override data return from graph - usually because proxy token has changed
// names since entitiy was created in subgraph
// keys are lowercase token addresses <--------
const TOKEN_OVERRIDES: {
  [address: string]: { name: string; symbol: string };
} = {
  [config.addresses.weth.toLowerCase()]: {
    name: 'Ether (Wrapped)',
    symbol: 'ETH'
  }
};

// override tokens with incorrect symbol or names
export function updateNameData(data: BasicData): BasicData | undefined {
  if (
    data?.token0?.id &&
    Object.keys(TOKEN_OVERRIDES).includes(data.token0.id)
  ) {
    data.token0.name = TOKEN_OVERRIDES[data.token0.id].name;
    data.token0.symbol = TOKEN_OVERRIDES[data.token0.id].symbol;
  }

  if (
    data?.token1?.id &&
    Object.keys(TOKEN_OVERRIDES).includes(data.token1.id)
  ) {
    data.token1.name = TOKEN_OVERRIDES[data.token1.id].name;
    data.token1.symbol = TOKEN_OVERRIDES[data.token1.id].symbol;
  }

  return data;
}
