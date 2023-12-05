import { gql } from 'apollo-boost';

const BUNDLE_ID = '1';

export const BUNI_STABLECOINS_SUMMARY = (factoryId: string) => {
  const queryString = `
  query buniCornFactories {
    buniCornFactories(where: {id: "${factoryId.toLowerCase()}"}) {
      id
      pairCount
      poolCount
      totalFeeUSD
      totalVolumeUSD
      totalLiquidityUSD
    }
  }
`;
  return gql(queryString);
};

export const ETH_PRICE = (block?: number) => {
  const queryString = block
    ? `
    query bundles {
      bundles(where: { id: ${BUNDLE_ID} } block: {number: ${block}}) {
        id
        ethPrice
      }
    }
  `
    : ` query bundles {
      bundles(where: { id: ${BUNDLE_ID} }) {
        id
        ethPrice
      }
    }
  `;
  return gql(queryString);
};

export const TOKEN_DERIVED_ETH = (tokenAddress: string) => {
  const queryString = `
    query tokens {
      tokens(where: { id: "${tokenAddress.toLowerCase()}"} ) {
        derivedETH
      }
    }
    `;

  return gql(queryString);
};

export const GET_BLOCK = gql`
  query blocks($timestampFrom: Int!, $timestampTo: Int!) {
    blocks(
      first: 1
      orderBy: timestamp
      orderDirection: asc
      where: { timestamp_gt: $timestampFrom, timestamp_lt: $timestampTo }
    ) {
      id
      number
      timestamp
    }
  }
`;

export const GET_BLOCKS = (timestamps: number[]) => {
  let queryString = 'query blocks {';
  queryString += timestamps.map(timestamp => {
    return `t${timestamp}:blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gt: ${timestamp}, timestamp_lt: ${timestamp +
      600} }) {
      number
    }`;
  });
  queryString += '}';
  return gql(queryString);
};

const PoolFields = `
  fragment PoolFields on Pool {
    id
    txCount
    txSwapCount
    token0 {
      id
      symbol
      name
      totalLiquidity
      derivedETH
    }
    token1 {
      id
      symbol
      name
      totalLiquidity
      derivedETH
    }
    amp
    reserve0
    reserve1
    vReserve0
    vReserve1
    reserveUSD
    totalSupply
    trackedReserveETH
    reserveETH
    volumeUSD
    feeUSD
    untrackedVolumeUSD
    untrackedFeeUSD
    token0Price
    token1Price
    token0PriceMin
    token0PriceMax
    token1PriceMin
    token1PriceMax
    createdAtTimestamp
  }
`;

export const USER_LIQUIDITY_POSITION_SNAPSHOTS = gql`
  query liquidityPositionSnapshots($account: String!) {
    liquidityPositionSnapshots(where: { user: $account }) {
      pool {
        id
      }
      liquidityTokenBalance
      liquidityTokenTotalSupply
      reserveUSD
      timestamp
    }
  }
`;

export const USER_LIQUIDITY_POSITION_SNAPSHOTS_IN_POOL = gql`
  query liquidityPositionSnapshots($account: String!, $pool: String!) {
    liquidityPositionSnapshots(where: { user: $account, pool: $pool }) {
      pool {
        id
      }
      liquidityTokenBalance
      liquidityTokenTotalSupply
      reserveUSD
      timestamp
    }
  }
`;

export const POOL_DATA = (poolAddress: string, block: number) => {
  const queryString = `
    query pools {
      pools(${
        block ? `block: {number: ${block}}` : ``
      } where: { id: "${poolAddress}"} ) {
        ...PoolFields
      }
    }
    ${PoolFields}
    `;

  return gql(queryString);
};

export const POOLS_BULK = gql`
  ${PoolFields}
  query pools($allPools: [Bytes]!) {
    pools(
      where: { id_in: $allPools }
      orderBy: trackedReserveETH
      orderDirection: desc
    ) {
      ...PoolFields
    }
  }
`;

export const ALL_POOLS_BULK = gql`
  ${PoolFields}
  query pools {
    pools(first: 200, orderBy: trackedReserveETH, orderDirection: desc) {
      ...PoolFields
    }
  }
`;

export const POOLS_HISTORICAL_BULK = (block: number, pools: string[]) => {
  // Construct the poolsString
  let poolsString = `[`;
  pools.map((pool: string) => {
    return (poolsString += `"${pool}"`);
  });
  poolsString += ']';

  const queryString = `
  query pools {
    pools(first: 200, where: {id_in: ${poolsString}}, block: {number: ${block}}, orderBy: trackedReserveETH, orderDirection: desc) {
      id
      reserveUSD
      trackedReserveETH
      volumeUSD
      feeUSD
      untrackedVolumeUSD
      untrackedFeeUSD
    }
  }
  `;

  return gql(queryString);
};

const PairFields = `
  fragment PairFields on Pair {
    id
    txCount
    token0 {
      id
      symbol
      name
      totalLiquidity
      derivedETH
    }
    token1 {
      id
      symbol
      name
      totalLiquidity
      derivedETH
    }
    reserve0
    reserve1
    reserveUSD
    totalSupply
    trackedReserveETH
    reserveETH
    volumeUSD
    feeUSD
    untrackedVolumeUSD
    untrackedFeeUSD
    token0Price
    token1Price
    createdAtTimestamp
  }
`;

export const PAIRS_BULK = gql`
  ${PairFields}
  query pairs($allPairs: [Bytes]!) {
    pairs(
      where: { id_in: $allPairs }
      orderBy: trackedReserveETH
      orderDirection: desc
    ) {
      ...PairFields
    }
  }
`;

export const PAIRS_HISTORICAL_BULK = (block, pairs) => {
  let pairsString = `[`;
  pairs.map(pair => {
    return (pairsString += `"${pair}"`);
  });
  pairsString += ']';
  const queryString = `
  query pairs {
    pairs(first: 200, where: {id_in: ${pairsString}}, block: {number: ${block}}, orderBy: trackedReserveETH, orderDirection: desc) {
      id
      reserveUSD
      trackedReserveETH
      volumeUSD
      feeUSD
      untrackedVolumeUSD
      untrackedFeeUSD
    }
  }
  `;
  return gql(queryString);
};

export const PAIR_DATA = (pairAddress, block) => {
  const queryString = `
    ${PairFields}
    query pairs {
      pairs(${
        block ? `block: {number: ${block}}` : ``
      } where: { id: "${pairAddress}"} ) {
        ...PairFields
      }
    }`;
  return gql(queryString);
};

export const FILTERED_TRANSACTIONS = gql`
  query($allPairs: [Bytes]!, $skip: Int!) {
    mints(
      first: 20
      skip: $skip
      where: { pair_in: $allPairs }
      orderBy: timestamp
      orderDirection: desc
    ) {
      transaction {
        id
        timestamp
      }
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      to
      liquidity
      amount0
      amount1
      amountUSD
    }
    burns(
      first: 20
      skip: $skip
      where: { pair_in: $allPairs }
      orderBy: timestamp
      orderDirection: desc
    ) {
      transaction {
        id
        timestamp
      }
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      sender
      liquidity
      amount0
      amount1
      amountUSD
    }
    swaps(
      first: 20
      skip: $skip
      where: { pair_in: $allPairs }
      orderBy: timestamp
      orderDirection: desc
    ) {
      transaction {
        id
        timestamp
      }
      id
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
      to
      feeUSD
    }
  }
`;

export const PAIR_CHART = gql`
  query pairDayDatas($pairAddress: Bytes!, $skip: Int!) {
    pairDayDatas(
      first: 1000
      skip: $skip
      orderBy: date
      orderDirection: asc
      where: { pairAddress: $pairAddress }
    ) {
      id
      date
      dailyVolumeToken0
      dailyVolumeToken1
      dailyVolumeUSD
      reserveUSD
    }
  }
`;
