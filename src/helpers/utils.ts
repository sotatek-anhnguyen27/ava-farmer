import numeral from 'numeral';
import { getAddress } from '@ethersproject/address';
import { MaxUint256 } from '@ethersproject/constants';
import BigNumber from '@/helpers/bignumber';
import config from '@/config';
export const aDay = 24 * 60 * 60 * 1000;
export const ITEMS_PER_PAGE = 20;
export const MAX_GAS = new BigNumber('0xffffffff');
export const MAX_UINT = MaxUint256;
export const POOL_TOKENS_DECIMALS = 18;
export const GAS_LIMIT_BUFFER = 0.1;
export const MAX =
  '115792089237316195423570985008687907853269984665640564039457.584007913129639935';

export const amplAddress = '0xD46bA6D942050d489DBd938a2C909A5d5039A161';
export const validAmplPools = ['0xa751a143f8fe0a108800bfb915585e4255c2fe80'];

export const unknownColors = [
  '#C39888',
  '#A1411D',
  '#454545',
  '#EAE1DC',
  '#A1411D',
  '#7E2AE5',
  '#BDBDBD',
  '#E7D39F',
  '#CBF1F9'
];

export const capInputOptions = {
  NUMERIC: 'Value',
  UNLIMITED: 'Unlimited'
};

export const liquidityToggleOptions = {
  MULTI_ASSET: 'Multi Asset',
  SINGLE_ASSET: 'Single Asset'
};

export const poolTypes = {
  SHARED_POOL: 'Shared',
  SMART_POOL: 'Smart'
};

export const poolRights = {
  canPauseSwapping: 'Can pause swapping',
  canChangeSwapFee: 'Can change swap fee',
  canChangeWeights: 'Can change weights',
  canAddRemoveTokens: 'Can change tokens',
  canWhitelistLPs: 'Restrict LPs to a whitelist',
  canChangeCap: 'Can limit total KPT supply'
};

export function jsonParse(input, fallback?) {
  try {
    return JSON.parse(input);
  } catch (err) {
    return fallback || undefined;
  }
}

export function scrollToTop() {
  window.scrollTo(0, 0);
}

export function shortenAddress(str = '') {
  return str ? `${str.slice(0, 6)}...${str.slice(str.length - 4)}` : str;
}

export function timeSince(date) {
  const seconds = Math.floor((new Date().valueOf() - date) / 1000);

  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + ' years ago';
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' months ago';
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' days ago';
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' hours ago';
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' minutes ago';
  }
  return Math.floor(seconds) + ' seconds ago';
}

export function shorten(str = '', max = 14) {
  return str.length > max ? `${str.slice(0, max)}...` : str;
}

export function bnum(val: string | number | BigNumber): BigNumber {
  const number = typeof val === 'string' ? val : val ? val.toString() : '0';
  return new BigNumber(number);
}

export function scale(input: BigNumber, decimalPlaces: number): BigNumber {
  const scalePow = new BigNumber(decimalPlaces.toString());
  const scaleMul = new BigNumber(10).pow(scalePow);
  return input.times(scaleMul);
}

export function toWei(val: string | BigNumber): BigNumber {
  return scale(bnum(val.toString()), 18).integerValue();
}

export function denormalizeBalance(
  amount: BigNumber,
  tokenDecimals: number
): BigNumber {
  return scale(bnum(amount), tokenDecimals);
}

export function normalizeBalance(
  amount: BigNumber,
  tokenDecimals: number
): BigNumber {
  return scale(bnum(amount), -tokenDecimals);
}

export function isLocked(
  allowances,
  tokenAddress,
  spender,
  rawAmount,
  decimals
) {
  const tokenAllowance = allowances[tokenAddress];
  if (!tokenAllowance || !tokenAllowance[spender]) {
    return true;
  }
  if (!rawAmount) {
    return false;
  }
  const amount = denormalizeBalance(rawAmount, decimals);
  return amount.gt(tokenAllowance[spender]);
}

export function formatPool(pool) {
  let colorIndex = 0;
  pool.tokens = pool.tokens.map(token => {
    token.checksum = getAddress(token.address);
    token.weightPercent = (100 / pool.totalWeight) * token.denormWeight;
    const configToken = config.tokens[token.checksum];
    if (configToken) {
      token.color = configToken.color;
    } else {
      token.color = unknownColors[colorIndex];
      colorIndex++;
    }
    return token;
  });
  if (pool.shares) pool.holders = pool.shares.length;
  pool.tokensList = pool.tokensList.map(token => getAddress(token));
  pool.lastSwapVolume = 0;
  const poolTotalSwapVolume =
    pool.swaps && pool.swaps[0] && pool.swaps[0].poolTotalSwapVolume
      ? parseFloat(pool.swaps[0].poolTotalSwapVolume)
      : 0;
  pool.lastSwapVolume = parseFloat(pool.totalSwapVolume) - poolTotalSwapVolume;
  return pool;
}

export async function getMarketChartFromCoinGecko(address) {
  const ratePerDay = {};
  const uri = `https://api.coingecko.com/api/v3/coins/ethereum/contract/${address}/market_chart?vs_currency=usd&days=60`;
  try {
    const marketChart = await fetch(uri).then(res => res.json());
    marketChart.prices.forEach(p => {
      const date = new Date();
      date.setTime(p[0]);
      const day = date.toISOString();
      ratePerDay[day] = p[1];
    });
    return ratePerDay;
  } catch (e) {
    return Promise.reject();
  }
}

export function isValidAddress(str) {
  try {
    getAddress(str);
  } catch (e) {
    return false;
  }
  return true;
}

export function delay(ms) {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}

export function clone(item) {
  return JSON.parse(JSON.stringify(item));
}

export function trunc(value: number, decimals = 0) {
  const mutiplier = 10 ** decimals;
  return Math.trunc(value * mutiplier) / mutiplier;
}

/*
  Contract does this (wei added/subtracted to ensure rounding errors favor the pool):
    ratio = poolAmountOut / (totalSupply)
    tokenAmountIn = ratio * (tokenInBalance)

  and then:
    require(tokenAmountIn <= maxAmountsIn[i], "ERR_LIMIT_IN");

  So, solving for poolAmountOut:
    poolAmountOut = tokenAmountIn * totalSupply / tokenInBalance

*/
export function calcPoolTokensFromAmount(
  amountIn: BigNumber,
  balanceIn: BigNumber,
  totalShares: string
) {
  if (amountIn.isNaN() || balanceIn.isNaN()) {
    return '0';
  }

  let poolAmountOut = toWei(amountIn)
    .times(toWei(totalShares))
    .div(balanceIn)
    .times(1 - 10 ** -16)
    .integerValue(BigNumber.ROUND_DOWN);

  if (poolAmountOut.dividedBy(toWei(totalShares)).comparedTo(1) > 0) {
    poolAmountOut = poolAmountOut.minus(100);
  }

  return poolAmountOut.toString();
}

export function calcPoolTokensByRatio(ratio, totalShares) {
  if (ratio.isNaN()) {
    return '0';
  }
  // @TODO - fix calcs so no buffer is needed
  const buffer = bnum(100);
  return bnum(ratio)
    .times(toWei(totalShares))
    .integerValue(BigNumber.ROUND_DOWN)
    .minus(buffer)
    .toString();
}

export function getTokenBySymbol(symbol) {
  const tokenAddresses = Object.keys(config.tokens);
  const tokenAddress = tokenAddresses.find(
    tokenAddress => config.tokens[tokenAddress].symbol === symbol
  );
  return config.tokens[tokenAddress || ''];
}

export const isTxRejected = error => {
  if (!error) {
    return false;
  }
  return (
    error.code === 4001 ||
    error.code === -32603 ||
    error.message === 'Transaction is rejected'
  );
};

export const isTxReverted = error => {
  if (!error) {
    return false;
  }
  return error.code === -32016;
};

export function formatFilters(filters, fb) {
  if (!filters) return fb || {};
  if (!filters.token) filters.token = [];
  if (!filters.type) filters.type = 'shared';
  if (!Array.isArray(filters.token)) filters.token = [filters.token];
  return filters;
}

export function blockNumberToTimestamp(
  currentTime,
  currentBlockNumber,
  blockNumber
) {
  const AVG_BLOCK_TIMES = {
    1: 13,
    42: 5,
    56: config.blockTime
  };
  const avgBlockTime = AVG_BLOCK_TIMES[config.chainId];
  return currentTime + avgBlockTime * 1000 * (blockNumber - currentBlockNumber);
}

export function filterObj(obj, fn) {
  return Object.fromEntries(Object.entries(obj).filter(item => fn(item)));
}

export function roundedCurrency(number) {
  return numeral(number).format('$0,0');
}

export function formatNumber(number, key) {
  if (number == 0) return '-';
  if (number < 1e-8 && !key) return '< 0.00000001';

  let format = '0.[000]';
  if (number > 1000) format = '0.[0]a';
  if (number < 1) {
    number = new BigNumber(number).toFixed(4, BigNumber.ROUND_DOWN);
    format = '0.[0000]';
  }

  if (key === 'long') {
    format = '0,000.[00]';
    if (number < 1) format = '0.[0000]';
  }

  if (key === 'usd') {
    format = '$(0.[00])';
    if (number > 1000) format = '$(0.[0]a)';
    if (number < 1) format = '$(0.[0000])';
    if (number < 1e-4) return '< $0.0001';
  }
  if (key === 'usd-long' && number < 1e-4) return '< 0.0001';

  if (key === 'usd-long') {
    format = '$(0,000.[00])';
    if (number < 1) format = '$(0.[0000])';
  }

  if (key === 'percent') format = '(0.[00])%';
  if (key === 'percent-short') format = '(0)%';
  if (key === 'percent-large') format = '(0,000.[00])%';

  if (number < 0.0000000001 && key === 'percent') {
    return '< 0.0000000001%';
  }

  if (number < 0.0001 && !key) {
    const roundNumber = new BigNumber(number).toFixed(8, 1);
    return new BigNumber(roundNumber).toString();
  }

  if (!key && format === '0.[000]') {
    const roundNumber = new BigNumber(number).toFixed(3, BigNumber.ROUND_DOWN);
    return new BigNumber(roundNumber).toString();
  }

  return numeral(number)
    .format(format)
    .toUpperCase();
}

// add 10%
export function calculateGasMargin(value: BigNumber): BigNumber {
  return value
    .multipliedBy(new BigNumber(10000).plus(new BigNumber(1000)))
    .div(new BigNumber(10000));
}

export function getChainIdNumber(chainId) {
  const parseStringChainId = chainId.toString();
  const isHex = parseStringChainId.substring(0, 2) === '0x';

  if (!isHex) {
    return parseInt(parseStringChainId);
  }

  return parseInt(parseStringChainId.substring(2), 16);
}
export function normalizeData(object) {
  const newObj = {};
  for (const property in object) {
    if (
      object[property] !== null &&
      object[property] !== undefined &&
      object[property] !== ''
    ) {
      newObj[property] = object[property];
    }
  }
  return newObj;
}
