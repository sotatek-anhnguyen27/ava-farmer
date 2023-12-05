import BigNumber from './bignumber';
import { subgraphRequest } from '@/_balancer/utils';
import config from '@/config';
import queries from '@/helpers/queries.json';
import merge from "lodash/merge";
import { formatPool } from "@/helpers/utils";

export function getPoolLiquidity(pool, prices) {
  let sumWeight = new BigNumber(0);
  let sumValue = new BigNumber(0);
  for (const token of pool.tokens) {
    const price = prices[token.checksum];
    if (!price) {
      continue;
    }
    const balanceNumber = new BigNumber(token.balance);
    const value = balanceNumber.times(price);
    sumValue = sumValue.plus(value);
    sumWeight = sumWeight.plus(token.weightPercent / 100);
  }
  if (sumWeight.gt(0)) {
    return sumValue.div(sumWeight).toString();
  } else {
    return pool.liquidity;
  }
}

export async function getBuniPrice() {
  const query = {
    tokenPrice: {
      __args: {
        id: config.addresses.buni.toLowerCase()
      }
    }
  };

  const { tokenPrice } = await subgraphRequest(
    config.kalancer.subgraphUrl,
    merge(queries['getBuniPrice'], query)
  );

  if (!tokenPrice) {
    return config.buniPrice;
  }

  return parseFloat(tokenPrice.price);
}

export async function getBurPrice() {
  const query = {
    tokenPrice: {
      __args: {
        id: config.addresses.bur.toLowerCase()
      }
    }
  };

  const { tokenPrice } = await subgraphRequest(
    config.kalancer.subgraphUrl,
    merge(queries['getBuniPrice'], query)
  );

  if (!tokenPrice) {
    return 0.05;
  }

  return parseFloat(tokenPrice.price);
}

export async function getTokenPriceOnChain(contract) {
  const query = {
    tokenPrice: {
      __args: {
        id: contract.toLowerCase()
      }
    }
  };

  const { tokenPrice } = await subgraphRequest(
    config.kalancer.subgraphUrl,
    merge(queries['getBuniPrice'], query)
  );

  if (!tokenPrice) {
    return 0;
  }

  return parseFloat(tokenPrice.price);
}
