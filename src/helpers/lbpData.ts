import { calcSpotPrice } from './math';
import { bnum } from './utils';
import config from '@/config';

const reserveCurrencies = {
  1: [
    '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    '0x261b45D85cCFeAbb11F022eBa346ee8D1cd488c0' // rDAI
  ],
  42: [
    '0xE680fA3CF20cAaB259Ab3E2d55a29C942ad72d01', // DAI
    '0x0B22E57e4e1E236f1E4C4d68c15E064E1Cc2e265', // USDC
    '0x0675A944CbEa834cddA62F24a08cE42d0fbb83A3', //BSUD
    '0x9792F3977Ac74833EA55Da9B2Aa63277eaB05A5C' // TUSD
  ],
  56: [
    '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', // DAI
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC
    '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', //BUSD
    '0x55d398326f99059fF775485246999027B3197955' // USDT
  ]
};

export function swapPrice(pool, chainId, swap) {
  const reserves = new Set(config.reserveCurrencies);
  const poolTokens = new Set(pool.tokensList);

  // @ts-ignore
  const intersection = new Set([...poolTokens].filter(x => reserves.has(x)));

  const reserveToken = intersection
    .values()
    .next()
    .value.toLowerCase();

  return swap.tokenIn === reserveToken
    ? swap.tokenAmountIn / swap.tokenAmountOut
    : swap.tokenAmountOut / swap.tokenAmountIn;
}

export function getLbpData(pool, chainId) {
  const reserves = new Set(config.reserveCurrencies);
  const poolTokens = new Set(pool.tokensList);

  let projectToken;
  let projectIdx;
  let reserveIdx;

  // Reserve token is the pool token that IS in reserves
  // @ts-ignore
  const intersection = new Set([...poolTokens].filter(x => reserves.has(x)));

  // Project token is the pool token that is NOT in reserves
  // @ts-ignore
  const difference = new Set([...poolTokens].filter(x => !reserves.has(x)));

  // An LB Pool has to have two tokens, only one of which is a reserve token
  const lbpPoolFlag = pool.tokensList.length === 2 && intersection.size === 1;
  if (lbpPoolFlag) {
    projectToken = difference.values().next().value;

    if (pool.tokens[0].checksum === projectToken) {
      projectIdx = 0;
      reserveIdx = 1;
    } else {
      projectIdx = 1;
      reserveIdx = 0;
    }
  }

  if (reserveIdx === undefined || projectIdx === undefined) return {};

  return {
    // There are two tokens and (only) one of them is a reserve currency
    // We want the price of the pool token in terms of the reserve
    // tokenIn is reserve; token out is project
    isLbpPool: lbpPoolFlag,
    lbpPrice: calcSpotPrice(
      bnum(pool.tokens[reserveIdx].balance),
      bnum(pool.tokens[reserveIdx].denormWeight),
      bnum(pool.tokens[projectIdx].balance),
      bnum(pool.tokens[projectIdx].denormWeight),
      bnum(pool.swapFee * 1e18)
    ).div(1e18),
    projectToken: pool.tokens[projectIdx].symbol
  };
}
