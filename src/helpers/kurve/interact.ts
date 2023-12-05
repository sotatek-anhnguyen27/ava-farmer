import * as _ from 'lodash';
import config from '@/config';
import { splitSignature } from '@ethersproject/bytes';
import { Contract } from '@ethersproject/contracts';

import BuniCornFactoryABI from '@/helpers/abi/BuniCornFactory.json';
import BuniCornRouter02ABI from '@/helpers/abi/BuniCornRouter02.json';
import BuniCornPoolABI from '@/helpers/abi/BuniCornPool.json';
import ERC20ABI from '@/helpers/abi/ERC20.json';
import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import BigNumber from '@/helpers/bignumber';
import isZero, { ApprovalState } from '@/utils';
import { calculateGasMargin } from '@/helpers/utils';
import {
  Token,
  JSBI,
  Percent,
  Router,
  Trade,
  TradeType,
  Pair,
  TokenAmount,
  Route,
  Fetcher
} from '@/../libs/buni-stable-coins-sdk/src';
import {
  EstimatedSwapCall,
  FailedCall,
  PairSwapData,
  SuccessfulCall
} from './interfaces';
import { PairState } from './enum';
import {
  BIPS_BASE,
  priceImpactSeverityInfo,
  tradePriceInfo,
  tradeSummaryInfo,
  tryParseAmount,
  ZERO_JSBI
} from './utils';
import store from '@/store';
import { BNB_KEY } from '@/utils/helpers';

export function wrappedToken(address: string) {
  return address === BNB_KEY ? config.addresses.weth : address;
}

export async function getKurvePoolsByTokens(
  provider: Web3Provider,
  tokenA: string,
  tokenB: string
) {
  console.debug('-------getKurvePoolsByTokens-------inputs', {
    tokenA,
    tokenB
  });
  const contract = new Contract(
    config.kurve.addresses.factory,
    BuniCornFactoryABI.abi,
    provider
  );
  const results: string[] = await contract.getPools(tokenA, tokenB);
  console.debug('-------getKurvePoolsByTokens-------results', results);
  return results;
}

export async function getKurveTradeInfo(
  provider: Web3Provider,
  address: string
) {
  console.debug('-------getKurveTradeInfo-------inputs', { address });
  const contract = new Contract(address, BuniCornPoolABI.abi, provider);
  const result = await contract.getTradeInfo();
  console.debug('-------getKurveTradeInfo-------result', result);
  return result;
}

export async function getKurvePoolAmp(provider: Web3Provider, address: string) {
  console.debug('-------getKurvePoolAmp-------inputs', { address });
  const contract = new Contract(address, BuniCornPoolABI.abi, provider);
  const result = await contract.ampBps();
  console.debug('-------getKurvePoolAmp-------result', result);
  return result;
}

export async function getKurvePoolTotalSupply(
  provider: Web3Provider,
  address: string
) {
  console.debug('-------getKurvePoolTotalSupply-------inputs', { address });
  const contract = new Contract(address, ERC20ABI.abi, provider);
  const result = await contract.totalSupply();
  console.debug('-------getKurvePoolTotalSupply-------result', result);
  return result;
}

export async function getKurvePoolBalanceByAddress(
  provider: Web3Provider,
  pool: string,
  account: string
) {
  console.debug('-------getKurvePoolBalanceByAddress-------inputs', {
    pool,
    account
  });
  if (!account) {
    return new BigNumber(0);
  }
  const contract = new Contract(pool, ERC20ABI.abi, provider);
  const result = await contract.balanceOf(account);
  console.debug('-------getKurvePoolBalanceByAddress-------result', result);
  return result;
}

export async function getKurveAllowances(
  provider: Web3Provider,
  account: string,
  spender: string,
  tokenAddresses: string[],
  tokenInputAmounts: BigNumber[]
) {
  console.debug('-------getKurveAllowances-------inputs', {
    account,
    spender,
    tokenAddresses,
    tokenInputAmounts: tokenInputAmounts.map(inp => inp.toString())
  });
  const tasks = tokenAddresses.map(async (address, index) => {
    if (!account) {
      return {
        address,
        approvalBalance: '0',
        state: ApprovalState.NOT_APPROVED
      };
    }
    const contract = new Contract(address, ERC20ABI.abi, provider);
    const result = await contract.allowance(account, spender);
    return {
      address,
      approvalBalance: result.toString(),
      state:
        result.toString() &&
        new BigNumber(result.toString()).isGreaterThan(
          tokenInputAmounts[index] || 0
        )
          ? ApprovalState.APPROVED
          : ApprovalState.NOT_APPROVED
    };
  });
  const results = await Promise.all(tasks);
  console.debug('-------getKurveAllowances-------results', results);
  return results;
}

export async function kurveRequestSignature(
  provider: Web3Provider,
  account: string,
  pool: string,
  deadline: BigNumber,
  liquidityAmount: BigNumber
) {
  console.debug('-------kurveRequestSignature-------inputs', {
    provider,
    account,
    pool,
    deadline: deadline.toString(),
    liquidityAmount: liquidityAmount.toString()
  });
  const contract = new Contract(
    pool,
    BuniCornPoolABI.abi,
    provider.getSigner()
  );
  const nonce = await contract.nonces(account);
  const EIP712Domain = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' }
  ];
  const domain = {
    name: 'Buni Pool Token',
    version: '1',
    chainId: config.chainId,
    verifyingContract: pool
  };
  const Permit = [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ];
  const message = {
    owner: account,
    spender: config.kurve.addresses.routerV2,
    value: liquidityAmount.toString(),
    nonce: nonce.toString(),
    deadline: deadline.toNumber()
  };
  const data = JSON.stringify({
    types: {
      EIP712Domain,
      Permit
    },
    domain,
    primaryType: 'Permit',
    message
  });
  try {
    const signatureData = await provider.send('eth_signTypedData_v4', [
      account,
      data
    ]);
    const signature = splitSignature(signatureData);
    return {
      v: signature.v,
      r: signature.r,
      s: signature.s,
      deadline: deadline.toNumber()
    };
  } catch (e) {
    return store.dispatch('transactions/handleTransactionError', e);
  }
}

export async function getPairs(
  currencyIn: string,
  currencyOut: string,
  assets: any[],
  provider: Web3Provider
) {
  console.debug('-------getPairs-------inputs', {
    currencyIn,
    currencyOut,
    assets,
    provider
  });
  const bases: Token[] = config.kurve.whitelistTokens.map(token => {
    return new Token(
      config.chainId,
      token,
      assets[token].decimals,
      assets[token].symbol,
      assets[token].name
    );
  });

  const [tokenA, tokenB] =
    config.chainId && currencyIn.toLowerCase() !== currencyOut.toLowerCase()
      ? [currencyIn, currencyOut]
      : [undefined, undefined];

  const basePairs = _.flatMap(bases, (base): [Token, Token][] =>
    bases.map(otherBase => [base, otherBase])
  ).filter(([t0, t1]) => t0.address !== t1.address);

  const allPairCombinations =
    tokenA && tokenB
      ? [
          // the direct pair
          [
            new Token(
              config.chainId,
              tokenA,
              assets[tokenA].decimals,
              assets[tokenA].symbol,
              assets[tokenA].name
            ),
            new Token(
              config.chainId,
              tokenB,
              assets[tokenB].decimals,
              assets[tokenB].symbol,
              assets[tokenB].name
            )
          ],
          // token A against all bases
          ...bases.map((base): [Token, Token] => [
            new Token(
              config.chainId,
              tokenA,
              assets[tokenA].decimals,
              assets[tokenA].symbol,
              assets[tokenA].name
            ),
            base
          ]),
          // token B against all bases
          ...bases.map((base): [Token, Token] => [
            new Token(
              config.chainId,
              tokenB,
              assets[tokenB].decimals,
              assets[tokenB].symbol,
              assets[tokenB].name
            ),
            base
          ]),
          // each base against all bases
          ...basePairs
        ]
          .filter((tokens): tokens is [Token, Token] =>
            Boolean(tokens[0] && tokens[1])
          )
          .filter(([t0, t1]) => t0.address !== t1.address)
      : [];

  const tokens = allPairCombinations.map(([currencyA, currencyB]) => [
    new Token(
      config.chainId,
      currencyA.address,
      assets[currencyA.address].decimals,
      assets[currencyA.address].symbol,
      assets[currencyA.address].name
    ),
    new Token(
      config.chainId,
      currencyB.address,
      assets[currencyB.address].decimals,
      assets[currencyB.address].symbol,
      assets[currencyB.address].name
    )
  ]);

  const contract = new Contract(
    config.kurve.addresses.factory,
    BuniCornFactoryABI.abi,
    provider
  );

  const tasks = _.map(
    tokens.filter(
      ([tokenA, tokenB]) => tokenA && tokenB && !tokenA.equals(tokenB)
    ),
    async ([tokenA, tokenB]) => {
      return await contract.getPools(tokenA?.address, tokenB?.address);
    }
  );
  const allPoolAddresses: string[][] = await Promise.all(tasks);

  const result: any[] = [];
  let start = 0;
  tokens.map(([tokenA, tokenB]) => {
    if (tokenA && tokenB && !tokenA.equals(tokenB)) {
      result.push(allPoolAddresses[start]);
      start += 1;
    } else {
      result.push('');
    }
  });

  const lens = result.map(item => (item ? item.length : 0));
  const pairAddresses = result.reduce((acc: string[], i) => {
    if (i) {
      acc = [...acc, ...i];
    }
    return acc;
  }, []);
  const tradeResultTasks = _.map(pairAddresses, async pairAddress => {
    const pairContract = new Contract(
      pairAddress,
      BuniCornPoolABI.abi,
      provider
    );
    return await pairContract.getTradeInfo();
  });

  const tradeResults: any[] = await Promise.all(tradeResultTasks);

  const ampBpsResultTasks = _.map(pairAddresses, async pairAddress => {
    const pairContract = new Contract(
      pairAddress,
      BuniCornPoolABI.abi,
      provider
    );
    return await pairContract.ampBps();
  });

  const ampBpsResults: any[] = await Promise.all(ampBpsResultTasks);

  const allPairs: any[] = [];
  start = 0;
  lens.forEach((len, index) => {
    allPairs.push([]);
    const tokenA = tokens[index][0];
    const tokenB = tokens[index][1];

    if (len > 0) {
      for (let j = 0; j < len; j++) {
        const reserves = tradeResults[start];
        const {
          _reserve0,
          _reserve1,
          _vReserve0,
          _vReserve1,
          feeInPrecision
        } = reserves;
        const [token0, token1] = tokenA.sortsBefore(tokenB)
          ? [tokenA, tokenB]
          : [tokenB, tokenA];
        allPairs[allPairs.length - 1].push([
          PairState.EXISTS,
          new Pair(
            pairAddresses[start],
            new TokenAmount(token0, _reserve0.toString()),
            new TokenAmount(token1, _reserve1.toString()),
            new TokenAmount(token0, _vReserve0.toString()),
            new TokenAmount(token1, _vReserve1.toString()),
            JSBI.BigInt(feeInPrecision.toString()),
            JSBI.BigInt(ampBpsResults[start].toString())
          )
        ]);
        start += 1;
      }
    }
  });

  const allowedPairs = allPairs.reduce<Pair[][]>(
    (res: Pair[][], poolArray: [PairState, Pair | null][]) => {
      const t = Object.values(
        poolArray
          .filter((result): result is [PairState.EXISTS, Pair] => {
            return Boolean(result[0] === PairState.EXISTS && result[1]);
          })
          .reduce<{ [pairAddress: string]: Pair }>((memo, [, curr]) => {
            memo[curr.liquidityToken.address] =
              memo[curr.liquidityToken.address] ?? curr;
            return memo;
          }, {})
      );
      res.push(t);
      return res;
    },
    []
  );
  console.debug('-------getPairs-------result', allowedPairs);
  return allowedPairs;
}

export async function getPairByAddress(
  currencyIn: string,
  currencyOut: string,
  pairAddress: string,
  assets: any[],
  provider: Web3Provider
) {
  const contract = new Contract(pairAddress, BuniCornPoolABI.abi, provider);

  const [tokenA, tokenB] =
    config.chainId && currencyIn.toLowerCase() !== currencyOut.toLowerCase()
      ? [currencyIn, currencyOut]
      : [undefined, undefined];

  const parseTokenA = tokenA
    ? new Token(
        config.chainId,
        tokenA,
        assets[tokenA].decimals,
        assets[tokenA].symbol,
        assets[tokenA].name
      )
    : undefined;

  const parseTokenB = tokenB
    ? new Token(
        config.chainId,
        tokenB,
        assets[tokenB].decimals,
        assets[tokenB].symbol,
        assets[tokenB].name
      )
    : undefined;

  if (!parseTokenA || !parseTokenB) {
    return;
  }

  const reserves = await contract.getTradeInfo();
  const amp = await contract.ampBps();

  const {
    _reserve0,
    _reserve1,
    _vReserve0,
    _vReserve1,
    feeInPrecision
  } = reserves;
  const [token0, token1] = parseTokenA.sortsBefore(parseTokenB)
    ? [parseTokenA, parseTokenB]
    : [parseTokenB, parseTokenA];

  return new Pair(
    pairAddress,
    new TokenAmount(token0, _reserve0.toString()),
    new TokenAmount(token1, _reserve1.toString()),
    new TokenAmount(token0, _vReserve0.toString()),
    new TokenAmount(token1, _vReserve1.toString()),
    JSBI.BigInt(feeInPrecision.toString()),
    JSBI.BigInt(amp.toString())
  );
}

export async function getV2TradeExactIn(
  currencyIn: string | undefined,
  amountIn: BigNumber | undefined,
  currencyOut: string | undefined,
  assets: any[],
  provider: Web3Provider
) {
  if (!currencyIn || !currencyOut) {
    return null;
  }
  const allowedPairs = await getPairs(
    currencyIn,
    currencyOut,
    assets,
    provider
  );
  const parseCurrencyIn = new Token(
    config.chainId,
    currencyIn,
    assets[currencyIn].decimals,
    assets[currencyIn].symbol,
    assets[currencyIn].name
  );
  const parseCurrencyOut = new Token(
    config.chainId,
    currencyOut,
    assets[currencyOut].decimals,
    assets[currencyOut].symbol,
    assets[currencyOut].name
  );

  const currencyAmountIn = tryParseAmount(
    amountIn?.toString(),
    parseCurrencyIn
  );
  if (!currencyAmountIn) {
    return null;
  }
  const trade = Trade.bestTradeExactIn(
    allowedPairs.filter(pairs => pairs.length !== 0),
    currencyAmountIn,
    parseCurrencyOut,
    { maxHops: 3, maxNumResults: 1 }
  );

  if (!trade || (Array.isArray(trade) && trade.length === 0)) {
    return null;
  }
  return trade;
}

export async function getV2TradeExactOut(
  currencyIn: string | undefined,
  currencyOut: string | undefined,
  amountOut: BigNumber | undefined,
  assets: any[],
  provider: Web3Provider
) {
  if (!currencyIn || !currencyOut) {
    return null;
  }
  const allowedPairs = await getPairs(
    currencyIn,
    currencyOut,
    assets,
    provider
  );
  const parseCurrencyIn = new Token(
    config.chainId,
    currencyIn,
    assets[currencyIn].decimals,
    assets[currencyIn].symbol,
    assets[currencyIn].name
  );
  const parseCurrencyOut = new Token(
    config.chainId,
    currencyOut,
    assets[currencyOut].decimals,
    assets[currencyOut].symbol,
    assets[currencyOut].name
  );
  const currencyAmountOut = tryParseAmount(
    amountOut?.toString(),
    parseCurrencyOut
  );
  if (!currencyAmountOut) {
    return null;
  }
  const trade = Trade.bestTradeExactOut(
    allowedPairs.filter(pairs => pairs.length !== 0),
    parseCurrencyIn,
    currencyAmountOut,
    { maxHops: 3, maxNumResults: 1 }
  );
  if (!trade) {
    return null;
  }
  return trade;
}

export async function getBestTradeInfo(
  isExactIn: boolean,
  currencyIn: string,
  currencyOut: string,
  amountIn: BigNumber,
  amountOut: BigNumber,
  assets: any[],
  provider: Web3Provider,
  slippage: number
) {
  console.debug('-------getBestTradeInfo-------inputs', {
    isExactIn,
    currencyIn,
    currencyOut,
    amountIn: amountIn ? amountIn.toString() : null,
    amountOut: amountOut ? amountOut.toString() : null,
    assets,
    provider,
    slippage
  });
  if ((!currencyIn && !currencyOut) || (!amountIn && !amountOut)) {
    return null;
  }
  const v2TradeExactIn = await getV2TradeExactIn(
    isExactIn ? currencyIn : undefined,
    isExactIn ? new BigNumber(amountIn) : undefined,
    currencyOut || undefined,
    assets,
    provider
  );
  console.debug('-------getBestTradeInfo-------v2TradeExactIn', v2TradeExactIn);
  const v2TradeExactOut = await getV2TradeExactOut(
    currencyIn || undefined,
    !isExactIn ? currencyOut : undefined,
    !isExactIn ? amountOut : undefined,
    assets,
    provider
  );
  console.debug(
    '-------getBestTradeInfo-------getV2TradeExactOut',
    v2TradeExactOut
  );
  const v2Trade = isExactIn ? v2TradeExactIn : v2TradeExactOut;

  let trade: Trade | null = null;
  if (v2Trade && v2Trade.length > 0) {
    trade = v2Trade[0];
  }
  if (!trade) {
    return null;
  }
  const calculatedAmount = isExactIn
    ? new BigNumber(trade.outputAmount.toSignificant(6))
    : new BigNumber(trade.inputAmount.toSignificant(6));
  const tradePrice = tradePriceInfo(trade);
  const tradeSummary = tradeSummaryInfo(trade, slippage);
  const priceImpactSeverity = priceImpactSeverityInfo(trade);

  const tradeInfo = {
    tradeType: trade.tradeType,
    tradePairs: trade.route.pairs.map(pair => {
      return {
        address: pair.address,
        token0: pair.token0,
        reserve0: pair.reserve0.raw.toString(),
        vReserve0: pair.virtualReserve0.raw.toString(),
        token1: pair.token1,
        reserve1: pair.reserve1.raw.toString(),
        vReserve1: pair.virtualReserve1.raw.toString(),
        amp: pair.amp.toString(),
        fee: pair.fee.toString()
      };
    }),
    tradePaths: trade.route.path,
    tradeCurrencyIn: trade.inputAmount.currency,
    tradeAmountIn: trade.inputAmount.raw.toString(),
    tradeCurrencyOut: trade.outputAmount.currency,
    tradeAmountOut: trade.outputAmount.raw.toString(),
    calculatedAmount,
    tradePrice,
    tradeSummary,
    priceImpactSeverity
  };
  console.debug('-------getBestTradeInfo-------result', tradeInfo);
  return tradeInfo;
}

export async function kurveAddLiquidity(
  pool: string,
  tokenA: string,
  tokenB: string,
  amountADesired: BigNumber,
  amountBDesired: BigNumber,
  amountAMin: BigNumber,
  amountBMin: BigNumber,
  to: string,
  deadline: BigNumber,
  slippage: BigNumber,
  assets: any[],
  provider: Web3Provider
) {
  console.debug('-------kurveAddLiquidity-------inputs', {
    pool,
    tokenA,
    tokenB,
    amountADesired: amountADesired.toString(),
    amountBDesired: amountBDesired.toString(),
    amountAMin: amountAMin.toString(),
    amountBMin: amountBMin.toString(),
    to,
    deadline: deadline.toString(),
    slippage: slippage.toString(),
    assets,
    provider
  });

  const pair = await getPairByAddress(tokenA, tokenB, pool, assets, provider);
  if (!pair) {
    return;
  }

  const contract = new Contract(
    config.kurve.addresses.routerV2,
    BuniCornRouter02ABI.abi,
    provider.getSigner()
  );

  const virtualReserveA = pair.virtualReserveOf(
    new Token(
      config.chainId,
      tokenA,
      assets[tokenA].decimals,
      assets[tokenA].symbol,
      assets[tokenA].name
    )
  );

  const virtualReserveB = pair.virtualReserveOf(
    new Token(
      config.chainId,
      tokenB,
      assets[tokenB].decimals,
      assets[tokenB].symbol,
      assets[tokenB].name
    )
  );

  let vReserveRatioBounds: string[] = [
    '0',
    '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
  ];

  if (
    virtualReserveA.greaterThan(ZERO_JSBI) &&
    virtualReserveB.greaterThan(ZERO_JSBI)
  ) {
    const currentRate = JSBI.divide(
      JSBI.multiply(
        virtualReserveB.raw,
        JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(112))
      ),
      virtualReserveA.raw
    );

    const allowedSlippageAmount = JSBI.divide(
      JSBI.multiply(
        currentRate,
        JSBI.BigInt(slippage.multipliedBy(10000).toString())
      ),
      JSBI.BigInt(10000)
    );

    vReserveRatioBounds = [
      JSBI.subtract(currentRate, allowedSlippageAmount).toString(),
      JSBI.add(currentRate, allowedSlippageAmount).toString()
    ];
  }

  const estimate = contract.estimateGas.addLiquidity;
  const method: (...args: any) => Promise<TransactionResponse> =
    contract.addLiquidity;
  const args: Array<string | string[] | number> = [
    tokenA,
    tokenB,
    pool,
    amountADesired.toString(),
    amountBDesired.toString(),
    amountAMin.toString(),
    amountBMin.toString(),
    vReserveRatioBounds,
    to,
    deadline.toString()
  ];
  const value: BigNumber | null = null;

  try {
    const estimatedGas = await estimate(...args, value ? { value } : {});
    return await method(...args, {
      ...(value ? { value } : {}),
      gasLimit: calculateGasMargin(new BigNumber(estimatedGas.toString()))
        .decimalPlaces(0)
        .toString()
    });
  } catch (e) {
    console.log(e);
    return e;
  }
}

export async function kurveRemoveLiquidity(
  tokenA: string,
  tokenB: string,
  pool: string,
  liquidity: BigNumber,
  amountAMin: BigNumber,
  amountBMin: BigNumber,
  to: string,
  provider: Web3Provider,
  // signature?: SignatureData,
  deadline: BigNumber
  // isApproval?: boolean
) {
  console.debug('-------kurveRemoveLiquidity-------inputs', {
    tokenA,
    tokenB,
    pool,
    liquidity: liquidity.toString(),
    amountAMin: amountAMin.toString(),
    amountBMin: amountBMin.toString(),
    to,
    provider,
    // signature,
    deadline,
    // isApproval
  });

  const methodNames: string[] = ['removeLiquidity'];
  const args: string[] = [
    tokenA,
    tokenB,
    pool,
    liquidity.toString(),
    amountAMin.toString(),
    amountBMin.toString(),
    to,
    deadline?.toString()
  ];

  // methodNames = ['removeLiquidityWithPermit'];
  // args = [
  //   tokenA,
  //   tokenB,
  //   pool,
  //   liquidity.toString(),
  //   amountAMin.toString(),
  //   amountBMin.toString(),
  //   to,
  //   signature.deadline,
  //   false,
  //   signature.v,
  //   signature.r,
  //   signature.s
  // ];

  const contract = new Contract(
    config.kurve.addresses.routerV2,
    BuniCornRouter02ABI.abi,
    provider.getSigner()
  );
  const safeGasEstimates: (BigNumber | undefined)[] = await Promise.all(
    methodNames.map(async methodName => {
      try {
        const value = await contract.estimateGas[methodName](...args);
        return calculateGasMargin(new BigNumber(value.toString()));
      } catch (error) {
        console.error(`estimateGas failed`, methodName, args, error);
        return undefined;
      }
    })
  );
  const indexOfSuccessfulEstimation = safeGasEstimates.findIndex(
    safeGasEstimate => BigNumber.isBigNumber(safeGasEstimate)
  );
  if (indexOfSuccessfulEstimation === -1) {
    console.error('This transaction would fail. Please contact support.');
    return null;
  } else {
    const methodName = methodNames[indexOfSuccessfulEstimation];
    const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation];
    try {
      return await contract[methodName](...args, {
        gasLimit: safeGasEstimate?.decimalPlaces(0).toString()
      });
    } catch (e) {
      return store.dispatch('transactions/handleTransactionError', e);
    }
  }
}

export async function kurveSwap(
  pairs: PairSwapData[],
  addressIn: string,
  addressOut: string,
  amountIn: string,
  amountOut: string,
  tradeType: TradeType,
  allowedSlippage: number,
  account: string,
  deadline: BigNumber,
  assets: any[],
  provider: Web3Provider
) {
  console.debug('-------kurveSwap-------inputs', {
    pairs,
    addressIn,
    addressOut,
    amountIn: amountIn ? amountIn.toString() : null,
    amountOut: amountOut ? amountOut.toString() : null,
    tradeType,
    allowedSlippage,
    account,
    deadline: deadline.toString(),
    assets,
    provider
  });
  const currrencyIn = new Token(
    config.chainId,
    addressIn,
    assets[addressIn].decimals,
    assets[addressIn].symbol,
    assets[addressIn].name
  );
  const currrencyOut = new Token(
    config.chainId,
    addressOut,
    assets[addressOut].decimals,
    assets[addressOut].symbol,
    assets[addressOut].name
  );
  const currencyAmount = tryParseAmount(
    tradeType === TradeType.EXACT_INPUT
      ? new BigNumber(amountIn)
          .dividedBy(new BigNumber(10).pow(assets[addressIn].decimals))
          .toString()
      : new BigNumber(amountOut)
          .dividedBy(new BigNumber(10).pow(assets[addressOut].decimals))
          .toString(),
    tradeType === TradeType.EXACT_INPUT ? currrencyIn : currrencyOut
  );
  if (!currencyAmount) {
    return;
  }
  const _pairs = pairs.map(pair => {
    return new Pair(
      pair.address,
      new TokenAmount(pair.token0, JSBI.BigInt(pair.reserve0)),
      new TokenAmount(pair.token1, JSBI.BigInt(pair.reserve1)),
      new TokenAmount(pair.token0, JSBI.BigInt(pair.vReserve0)),
      new TokenAmount(pair.token1, JSBI.BigInt(pair.vReserve1)),
      JSBI.BigInt(pair.fee),
      JSBI.BigInt(pair.amp)
    );
  });
  const route = new Route(_pairs, currrencyIn, currrencyOut);
  const _trade = new Trade(route, currencyAmount, tradeType);
  const tradeBestExacInAnyway = await getV2TradeExactIn(
    (_trade.inputAmount.currency as Token).address,
    new BigNumber(_trade.inputAmount.raw.toString()),
    (_trade?.outputAmount.currency as Token).address,
    assets,
    provider
  );
  const routerContract: Contract = new Contract(
    config.kurve.addresses.routerV2,
    BuniCornRouter02ABI.abi,
    provider.getSigner()
  );
  const swapMethods = [
    Router.swapCallParameters(_trade, {
      feeOnTransfer: false,
      allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
      recipient: account,
      deadline: deadline.toNumber()
    })
  ];

  if (_trade.tradeType === TradeType.EXACT_INPUT) {
    swapMethods.push(
      Router.swapCallParameters(_trade, {
        feeOnTransfer: true,
        allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
        recipient: account,
        deadline: deadline.toNumber()
      })
    );
  } else if (tradeBestExacInAnyway) {
    swapMethods.push(
      Router.swapCallParameters(tradeBestExacInAnyway[0], {
        feeOnTransfer: true,
        allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
        recipient: account,
        deadline: deadline.toNumber()
      })
    );
  }

  const swapCalls = swapMethods.map(parameters => ({
    parameters,
    contract: routerContract
  }));
  const estimatedCalls: EstimatedSwapCall[] = await Promise.all(
    swapCalls.map(async call => {
      const {
        parameters: { methodName, args, value },
        contract
      } = call;
      const options = !value || isZero(value) ? {} : { value };

      try {
        const gasEstimate = await contract.estimateGas[methodName](
          ...args,
          options
        );
        return {
          call,
          gasEstimate
        };
      } catch (gasError) {
        console.debug(
          'Gas estimate failed, trying eth_call to extract error',
          call
        );
        try {
          const result = await contract.callStatic[methodName](
            ...args,
            options
          );
          console.debug(
            'Unexpected successful call after failed estimate gas',
            call,
            gasError,
            result
          );
          return {
            call,
            error: new Error(
              'Unexpected issue with estimating the gas. Please try again.'
            )
          };
        } catch (callError) {
          return callError;
        }
      }
    })
  );

  // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
  const successfulEstimation = estimatedCalls.find(
    (el, ix, list): el is SuccessfulCall =>
      'gasEstimate' in el &&
      (ix === list.length - 1 || 'gasEstimate' in list[ix + 1])
  );

  if (!successfulEstimation) {
    const errorCalls = estimatedCalls.filter(
      (call): call is FailedCall => 'error' in call
    );
    if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error;
    throw new Error(
      'Unexpected error. Please contact support: none of the calls threw an error'
    );
  }

  const {
    call: {
      contract,
      parameters: { methodName, args, value }
    },
    gasEstimate
  } = successfulEstimation;

  try {
    const tx = await contract[methodName](...args, {
      gasLimit: calculateGasMargin(new BigNumber(gasEstimate.toString()))
        .decimalPlaces(0)
        .toString(),
      ...(value && !isZero(value)
        ? { value, from: account }
        : { from: account })
    });
    return tx;
  } catch (e) {
    throw store.dispatch('transactions/handleTransactionError', e);
  }
}

export async function getPairPrice(
  token0: string,
  token1: string,
  assets: any[],
  provider: Web3Provider
) {
  console.debug('-------getPairPrice-------inputs', {
    token0,
    token1,
    assets
  });
  const currrencyIn = new Token(
    config.chainId,
    token0,
    assets[token0].decimals,
    assets[token0].symbol,
    assets[token0].name
  );
  const currrencyOut = new Token(
    config.chainId,
    token1,
    assets[token1].decimals,
    assets[token1].symbol,
    assets[token1].name
  );

  const pair = await Fetcher.fetchPairData(
    currrencyIn as Token,
    currrencyOut as Token,
    config.kurve.addresses.factory,
    provider
  );
  const route = new Route(pair, currrencyIn);
  const price = route.midPrice.toSignificant(6);
  console.debug('-------getPairPrice-------result', price);
  return price;
}
