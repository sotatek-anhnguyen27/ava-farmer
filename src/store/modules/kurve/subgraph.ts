import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import * as _ from 'lodash';
import Vue from 'vue';
import {
  getBlockFromTimestamp,
  getBlocksFromTimestamps,
  getPercentChange,
  getTimestampsForChanges
} from '@/utils';
import {
  ALL_POOLS_BULK,
  ETH_PRICE,
  FILTERED_TRANSACTIONS,
  PAIRS_BULK,
  PAIRS_HISTORICAL_BULK,
  PAIR_CHART,
  PAIR_DATA,
  POOLS_BULK,
  POOLS_HISTORICAL_BULK,
  POOL_DATA,
  USER_LIQUIDITY_POSITION_SNAPSHOTS,
  USER_LIQUIDITY_POSITION_SNAPSHOTS_IN_POOL,
  BUNI_STABLECOINS_SUMMARY,
  TOKEN_DERIVED_ETH
} from './queries';
import { client } from './client';
import {
  getKurvePoolAmp,
  getKurvePoolsByTokens,
  getKurvePoolTotalSupply,
  getKurveTradeInfo,
  PairDayData,
  BulkPoolPayload,
  updateNameData,
  wrappedToken,
  BulkPairPayload,
  PoolDetailPayload,
  UserLiquidityPositionPayload,
  PoolSwapTxnPayload,
  PairChartPayload,
  TokenAddressesPayload,
  PairAddressPayload
} from '@/helpers/kurve';
import { parseData } from './helper';
import BigNumber from '@/helpers/bignumber';
import config from '@/config';
import { getAddress } from '@ethersproject/address';

dayjs.extend(utc);

const state = {
  kurve: {},
  poolShares: {},
  myPools: [],
  tokens: {}
};

const mutations = {
  CLEAR_USER(_state) {
    Vue.set(_state, 'kurve__poolShares', {});
    Vue.set(_state, 'kurve__myPools', []);
    console.debug('CLEAR_USER');
  },
  GET_BUNI_STABLECOINS_SUMMARY_REQUEST() {
    console.debug('GET_BUNI_STABLECOINS_SUMMARY_REQUEST');
  },
  GET_BUNI_STABLECOINS_SUMMARY_SUCCESS() {
    console.debug('GET_BUNI_STABLECOINS_SUMMARY_SUCCESS');
  },
  GET_BUNI_STABLECOINS_SUMMARY_FAILURE() {
    console.debug('GET_BUNI_STABLECOINS_SUMMARY_FAILURE');
  },
  GET_KURVE_ETH_PRICE_REQUEST() {
    console.debug('GET_KURVE_ETH_PRICE_REQUEST');
  },
  GET_KURVE_ETH_PRICE_SUCCESS(_state, payload) {
    console.debug('GET_KURVE_ETH_PRICE_SUCCESS', payload);
  },
  GET_KURVE_ETH_PRICE_FAILURE(_state, payload) {
    console.debug('GET_KURVE_ETH_PRICE_FAILURE', payload);
  },
  GET_KURVE_POOL_LIST_REQUEST() {
    console.debug('GET_KURVE_POOL_LIST_REQUEST');
  },
  GET_KURVE_POOL_LIST_SUCCESS(_state, payload) {
    console.debug('GET_KURVE_POOL_LIST_SUCCESS', payload);
  },
  GET_KURVE_POOL_LIST_FAILURE(_state, payload) {
    console.debug('GET_KURVE_POOL_LIST_FAILURE', payload);
  },
  GET_ONE_KURVE_POOL_INFO_REQUEST() {
    console.debug('GET_ONE_KURVE_POOL_INFO_REQUEST');
  },
  GET_ONE_KURVE_POOL_INFO_SUCCESS(_state, payload) {
    console.debug('GET_ONE_KURVE_POOL_INFO_SUCCESS', payload);
  },
  GET_ONE_KURVE_POOL_INFO_FAILURE(_state, payload) {
    console.debug('GET_ONE_KURVE_POOL_INFO_FAILURE', payload);
  },
  GET_KURVE_USER_LIQUIDITY_POSITIONS_REQUEST() {
    console.debug('GET_KURVE_USER_LIQUIDITY_POSITIONS_REQUEST');
  },
  GET_KURVE_USER_LIQUIDITY_POSITIONS_SUCCESS(_state, payload) {
    console.debug('GET_KURVE_USER_LIQUIDITY_POSITIONS_SUCCESS', payload);
  },
  GET_KURVE_USER_LIQUIDITY_POSITIONS_FAILURE(_state, payload) {
    console.debug('GET_KURVE_USER_LIQUIDITY_POSITIONS_FAILURE', payload);
  },
  GET_KURVE_USER_LIQUIDITY_POSITIONS_IN_POOL_REQUEST() {
    console.debug('GET_KURVE_USER_LIQUIDITY_POSITIONS_IN_POOL_REQUEST');
  },
  GET_KURVE_USER_LIQUIDITY_POSITIONS_IN_POOL_SUCCESS(_state, payload) {
    console.debug(
      'GET_KURVE_USER_LIQUIDITY_POSITIONS_IN_POOL_SUCCESS',
      payload
    );
  },
  GET_KURVE_USER_LIQUIDITY_POSITIONS_IN_POOL_FAILURE(_state, payload) {
    console.debug(
      'GET_KURVE_USER_LIQUIDITY_POSITIONS_IN_POOL_FAILURE',
      payload
    );
  },
  GET_KURVE_BULK_PAIR_DATA_REQUEST() {
    console.debug('GET_KURVE_BULK_PAIR_DATA_REQUEST');
  },
  GET_KURVE_BULK_PAIR_DATA_SUCCESS(_state, payload) {
    console.debug('GET_KURVE_BULK_PAIR_DATA_SUCCESS', payload);
  },
  GET_KURVE_BULK_PAIR_DATA_FAILURE(_state, payload) {
    console.debug('GET_KURVE_BULK_PAIR_DATA_FAILURE', payload);
  },
  GET_KURVE_POOL_SWAPS_REQUEST() {
    console.debug('GET_KURVE_POOL_SWAPS_REQUEST');
  },
  GET_KURVE_POOL_SWAPS_SUCCESS(_state, payload) {
    console.debug('GET_KURVE_POOL_SWAPS_SUCCESS', payload);
  },
  GET_KURVE_POOL_SWAPS_FAILURE(_state, payload) {
    console.debug('GET_KURVE_POOL_SWAPS_FAILURE', payload);
  },
  GET_KURVE_PAIR_CHART_REQUEST() {
    console.debug('GET_KURVE_PAIR_CHART_REQUEST');
  },
  GET_KURVE_PAIR_CHART_SUCCESS(_state, payload) {
    console.debug('GET_KURVE_PAIR_CHART_SUCCESS', payload);
  },
  GET_KURVE_PAIR_CHART_FAILURE(_state, payload) {
    console.debug('GET_KURVE_PAIR_CHART_FAILURE', payload);
  },
  GET_TOKEN_PRICE_BY_USD_REQUEST() {
    console.debug('GET_TOKEN_PRICE_BY_USD');
  },
  GET_TOKEN_PRICE_BY_USD_SUCCESS(_state, payload) {
    console.debug('GET_TOKEN_PRICE_BY_USD_SUCCESS', payload);
  },
  GET_TOKEN_PRICE_BY_USD_FAILURE(_state, payload) {
    console.debug('GET_TOKEN_PRICE_BY_USD_FAILURE', payload);
  },
  GET_TOKENS_PRICE_BY_USD_REQUEST() {
    console.debug('GET_TOKENS_PRICE_BY_USD_REQUEST');
  },
  GET_TOKENS_PRICE_BY_USD_SUCCESS(_state, payload) {
    console.debug('GET_TOKENS_PRICE_BY_USD_SUCCESS', payload);
  },
  GET_TOKENS_PRICE_BY_USD_FAILURE(_state, payload) {
    console.debug('GET_TOKENS_PRICE_BY_USD_FAILURE', payload);
  }
};

const actions = {
  clearUser: async ({ commit }) => {
    commit('CLEAR_USER');
  },
  getBuniStablecoinsSummary: async ({ commit }) => {
    commit('GET_BUNI_STABLECOINS_SUMMARY_REQUEST');
    try {
      const result = await client.query({
        query: BUNI_STABLECOINS_SUMMARY(config.kurve.addresses.factory),
        fetchPolicy: 'network-only'
      });
      commit('GET_BUNI_STABLECOINS_SUMMARY_SUCCESS');
      const factories = result.data ? result.data.buniCornFactories : [];
      const [factory] = Array.from(factories);
      return factory;
    } catch (e) {
      commit('GET_BUNI_STABLECOINS_SUMMARY_FAILURE', e);
      throw e;
    }
  },
  getEthPriceForKurve: async ({ commit }) => {
    const utcCurrentTime = dayjs();
    const utcOneDayBack = utcCurrentTime
      .subtract(1, 'day')
      .startOf('minute')
      .unix();

    let ethPrice = 0;
    let ethPriceOneDay = 0;
    let priceChangeETH = 0;

    commit('GET_KURVE_ETH_PRICE_REQUEST');
    try {
      const oneDayBlock = await getBlockFromTimestamp(utcOneDayBack);
      const result = await client.query({
        query: ETH_PRICE(),
        fetchPolicy: 'cache-first'
      });
      const resultOneDay = await client.query({
        query: ETH_PRICE(oneDayBlock),
        fetchPolicy: 'cache-first'
      });
      const currentPrice = result?.data?.bundles[0]?.ethPrice;
      const oneDayBackPrice = resultOneDay?.data?.bundles[0]?.ethPrice;

      priceChangeETH = getPercentChange(currentPrice, oneDayBackPrice);
      ethPrice = currentPrice;
      ethPriceOneDay = oneDayBackPrice;

      commit('GET_KURVE_ETH_PRICE_SUCCESS', {
        ethPrice,
        ethPriceOneDay,
        priceChangeETH
      });
      return [ethPrice, ethPriceOneDay, priceChangeETH];
    } catch (e) {
      commit('GET_KURVE_ETH_PRICE_FAILURE', e);
      throw e;
    }
  },
  getKurveBulkPoolsData: async ({ commit }, payload: BulkPoolPayload) => {
    const [t1, t2, tWeek] = getTimestampsForChanges();
    const [
      { number: b1 },
      { number: b2 },
      { number: bWeek }
    ] = await getBlocksFromTimestamps([t1, t2, tWeek]);

    commit('GET_KURVE_POOL_LIST_REQUEST');
    const poolList = payload.fetchAll
      ? []
      : payload.poolAddress
      ? [payload.poolAddress]
      : await getKurvePoolsByTokens(
          payload.provider,
          payload.tokenA,
          payload.tokenB
        );

    try {
      const current = await client.query({
        query: payload.fetchAll ? ALL_POOLS_BULK : POOLS_BULK,
        variables: {
          allPools: poolList.map((pool: string) => pool.toLowerCase())
        },
        fetchPolicy: 'network-only'
      });

      const [oneDayResult, twoDayResult, oneWeekResult] = await Promise.all(
        [b1, b2, bWeek].map(async block => {
          const result = client.query({
            query: POOLS_HISTORICAL_BULK(block, poolList),
            fetchPolicy: 'network-only'
          });
          return result;
        })
      );

      const oneDayData = oneDayResult?.data?.pools.reduce(
        (obj: any, cur: any) => {
          return { ...obj, [cur.id]: cur };
        },
        {}
      );

      const twoDayData = twoDayResult?.data?.pools.reduce(
        (obj: any, cur: any) => {
          return { ...obj, [cur.id]: cur };
        },
        {}
      );

      const oneWeekData = oneWeekResult?.data?.pools.reduce(
        (obj: any, cur: any) => {
          return { ...obj, [cur.id]: cur };
        },
        {}
      );

      const poolData = await Promise.all(
        current &&
          current.data.pools.map(async (pool: any) => {
            let data = { ...pool };
            let oneDayHistory = oneDayData?.[pool.id];
            if (!oneDayHistory) {
              const newData = await client.query({
                query: POOL_DATA(pool.id, b1),
                fetchPolicy: 'network-only'
              });
              oneDayHistory = newData.data.pools[0];
            }
            let twoDayHistory = twoDayData?.[pool.id];
            if (!twoDayHistory) {
              const newData = await client.query({
                query: POOL_DATA(pool.id, b2),
                fetchPolicy: 'network-only'
              });
              twoDayHistory = newData.data.pools[0];
            }
            let oneWeekHistory = oneWeekData?.[pool.id];
            if (!oneWeekHistory) {
              const newData = await client.query({
                query: POOL_DATA(pool.id, bWeek),
                fetchPolicy: 'network-only'
              });
              oneWeekHistory = newData.data.pools[0];
            }
            data = parseData(
              data,
              oneDayHistory,
              twoDayHistory,
              oneWeekHistory,
              payload.ethPrice,
              b1
            );

            return data;
          })
      );

      const results = poolData.map((pool: any) => {
        const whitelistIndex = config.kurve.whitelistPairs.findIndex(
          pairAddress => pairAddress.toLowerCase() === pool.id.toLowerCase()
        );
        if (whitelistIndex === -1) {
          return null;
        }

        const checksumToken0 = getAddress(pool.token0.id);
        const checksumToken1 = getAddress(pool.token1.id);
        const configToken0 = config.tokens[checksumToken0] || {};
        const configToken1 = config.tokens[checksumToken1] || {};

        pool.token0.color = configToken0.color;
        pool.token1.color = configToken1.color;

        return pool;
      });

      commit('GET_KURVE_POOL_LIST_SUCCESS', { pools: _.compact(results) });
      return _.compact(results);
    } catch (e) {
      commit('GET_KURVE_POOL_LIST_FAILURE', e);
      throw e;
    }
  },
  getKurveBulkPairData: async ({ commit }, payload: BulkPairPayload) => {
    const [t1, t2, tWeek] = getTimestampsForChanges();
    const [
      { number: b1 },
      { number: b2 },
      { number: bWeek }
    ] = await getBlocksFromTimestamps([t1, t2, tWeek]);

    commit('GET_KURVE_BULK_PAIR_DATA_REQUEST');
    const pairList: string[] = [payload.pair.toLowerCase()];
    try {
      const current = await client.query({
        query: PAIRS_BULK,
        variables: {
          allPairs: pairList
        },
        fetchPolicy: 'cache-first'
      });

      const [oneDayResult, twoDayResult, oneWeekResult] = await Promise.all(
        [b1, b2, bWeek].map(async block => {
          const result = client.query({
            query: PAIRS_HISTORICAL_BULK(block, pairList),
            fetchPolicy: 'cache-first'
          });
          return result;
        })
      );

      const oneDayData = oneDayResult?.data?.pairs.reduce(
        (obj: any, cur: any) => {
          return { ...obj, [cur.id]: cur };
        },
        {}
      );

      const twoDayData = twoDayResult?.data?.pairs.reduce(
        (obj: any, cur: any) => {
          return { ...obj, [cur.id]: cur };
        },
        {}
      );

      const oneWeekData = oneWeekResult?.data?.pairs.reduce(
        (obj: any, cur: any) => {
          return { ...obj, [cur.id]: cur };
        },
        {}
      );

      const pairData = await Promise.all(
        current &&
          current.data.pairs.map(async pair => {
            let data = pair;
            let oneDayHistory = oneDayData?.[pair.id];
            if (!oneDayHistory) {
              const newData = await client.query({
                query: PAIR_DATA(pair.id, b1),
                fetchPolicy: 'cache-first'
              });
              oneDayHistory = newData.data.pairs[0];
            }
            let twoDayHistory = twoDayData?.[pair.id];
            if (!twoDayHistory) {
              const newData = await client.query({
                query: PAIR_DATA(pair.id, b2),
                fetchPolicy: 'cache-first'
              });
              twoDayHistory = newData.data.pairs[0];
            }
            let oneWeekHistory = oneWeekData?.[pair.id];
            if (!oneWeekHistory) {
              const newData = await client.query({
                query: PAIR_DATA(pair.id, bWeek),
                fetchPolicy: 'cache-first'
              });
              oneWeekHistory = newData.data.pairs[0];
            }
            data = parseData(
              data,
              oneDayHistory,
              twoDayHistory,
              oneWeekHistory,
              payload.ethPrice,
              b1
            );
            return data;
          })
      );

      commit('GET_KURVE_BULK_PAIR_DATA_SUCCESS', pairData);
      return pairData;
    } catch (e) {
      commit('GET_KURVE_BULK_PAIR_DATA_FAILURE', e);
      throw e;
    }
  },
  getKurvePoolDetailByAddress: async (
    { commit },
    payload: PoolDetailPayload
  ) => {
    commit('GET_ONE_KURVE_POOL_INFO_REQUEST');
    try {
      const [reserves, amp, totalSupply] = await Promise.all([
        getKurveTradeInfo(payload.provider, payload.address),
        getKurvePoolAmp(payload.provider, payload.address),
        getKurvePoolTotalSupply(payload.provider, payload.address)
      ]);

      const {
        _reserve0,
        _reserve1,
        _vReserve0,
        _vReserve1,
        feeInPrecision
      } = reserves;
      const [token0, token1] =
        wrappedToken(payload.tokenA).toLowerCase() <
        wrappedToken(payload.tokenB).toLowerCase()
          ? [payload.tokenA, payload.tokenB]
          : [payload.tokenB, payload.tokenA];
      const noLiquidity: boolean =
        new BigNumber(totalSupply).isEqualTo(0) &&
        (wrappedToken(payload.tokenA) !== config.addresses.weth ||
          wrappedToken(payload.tokenB) !== config.addresses.weth);
      const price = noLiquidity
        ? undefined
        : {
            price: new BigNumber(_reserve1.toString())
              .div(
                new BigNumber(10).pow(payload.assets[payload.tokenB].decimals)
              )
              .div(
                new BigNumber(_reserve0.toString()).div(
                  new BigNumber(10).pow(payload.assets[payload.tokenA].decimals)
                )
              ),
            invert: new BigNumber(_reserve0.toString())
              .div(
                new BigNumber(10).pow(payload.assets[payload.tokenA].decimals)
              )
              .div(
                new BigNumber(_reserve1.toString()).div(
                  new BigNumber(10).pow(payload.assets[payload.tokenB].decimals)
                )
              )
          };
      const response = {
        pool: {
          address: payload.address,
          tokenA: {
            address: token0,
            tokenAmount: new BigNumber(_reserve0.toString()).div(
              new BigNumber(10).pow(payload.assets[token0].decimals)
            ),
            vTokenAmount: new BigNumber(_vReserve0.toString()).div(
              new BigNumber(10).pow(payload.assets[token0].decimals)
            )
          },
          tokenB: {
            address: token1,
            tokenAmount: new BigNumber(_reserve1.toString()).div(
              new BigNumber(10).pow(payload.assets[token1].decimals)
            ),
            vTokenAmount: new BigNumber(_vReserve1.toString()).div(
              new BigNumber(10).pow(payload.assets[token1].decimals)
            )
          },
          fee: new BigNumber(feeInPrecision).div(new BigNumber(10).pow(18)),
          amp: new BigNumber(amp).div(10000),
          totalSupply: new BigNumber(totalSupply.toString()).div(
            new BigNumber(10).pow(18)
          )
        },
        price,
        noLiquidity
      };
      commit('GET_ONE_KURVE_POOL_INFO_SUCCESS', { poolInfo: response });
      return response;
    } catch (e) {
      commit('GET_ONE_KURVE_POOL_INFO_FAILURE', e);
      throw e;
    }
  },
  getKurveUserLiquidityPositions: async (
    { commit },
    payload: UserLiquidityPositionPayload
  ) => {
    commit('GET_KURVE_USER_LIQUIDITY_POSITIONS_REQUEST');
    try {
      const current = await client.query({
        query: USER_LIQUIDITY_POSITION_SNAPSHOTS,
        variables: {
          account: payload.account.toLowerCase()
        },
        fetchPolicy: 'network-only'
      });
      commit('GET_KURVE_USER_LIQUIDITY_POSITIONS_SUCCESS', { data: current });
      return current.data ? current.data.liquidityPositionSnapshots : [];
    } catch (e) {
      commit('GET_KURVE_USER_LIQUIDITY_POSITIONS_FAILURE', e);
      throw e;
    }
  },
  getKurveUserLiquidityPositionsInPool: async (
    { commit },
    payload: UserLiquidityPositionPayload
  ) => {
    commit('GET_KURVE_USER_LIQUIDITY_POSITIONS_IN_POOL_REQUEST');
    try {
      const current = await client.query({
        query: USER_LIQUIDITY_POSITION_SNAPSHOTS_IN_POOL,
        variables: {
          account: payload.account.toLowerCase(),
          pool: payload.poolId?.toLowerCase()
        },
        fetchPolicy: 'network-only'
      });
      commit('GET_KURVE_USER_LIQUIDITY_POSITIONS_IN_POOL_SUCCESS', {
        data: current
      });
      return current.data ? current.data.liquidityPositionSnapshots : [];
    } catch (e) {
      commit('GET_KURVE_USER_LIQUIDITY_POSITIONS_IN_POOL_FAILURE', e);
      throw e;
    }
  },
  getKurvePoolSwaps: async ({ commit }, payload: PoolSwapTxnPayload) => {
    const transactions = {
      swaps: []
    };

    commit('GET_KURVE_POOL_SWAPS_REQUEST');
    try {
      const result = await client.query({
        query: FILTERED_TRANSACTIONS,
        variables: {
          allPairs: [payload.pairAddress],
          skip: (payload.page - 1 < 0 ? 0 : payload.page - 1) * 20
        },
        fetchPolicy: 'no-cache'
      });
      // transactions.mints = result.data.mints
      // transactions.burns = result.data.burns
      transactions.swaps = result.data.swaps.map(swap => {
        return {
          ...swap,
          pair: updateNameData(swap.pair)
        };
      });

      commit('GET_KURVE_POOL_SWAPS_SUCCESS', transactions);
      return transactions;
    } catch (e) {
      commit('GET_KURVE_POOL_SWAPS_FAILURE', e);
      throw e;
    }
  },
  getKurvePairChart: async ({ commit }, payload: PairChartPayload) => {
    let data: PairDayData[] = [];
    const utcEndTime = dayjs.utc();
    const utcStartTime = utcEndTime.subtract(1, 'year').startOf('minute');
    const startTime = utcStartTime.unix() - 1;

    commit('GET_KURVE_PAIR_CHART_REQUEST');
    try {
      let allFound = false;
      let skip = 0;
      while (!allFound) {
        const result = await client.query({
          query: PAIR_CHART,
          variables: {
            pairAddress: payload.pairAddress,
            skip
          },
          fetchPolicy: 'cache-first'
        });
        skip += 1000;
        data = data.concat(result.data.pairDayDatas);
        if (result.data.pairDayDatas.length < 1000) {
          allFound = true;
        }
      }

      const dayIndexSet = new Set();
      const dayIndexArray: PairDayData[] = [];
      const oneDay = 24 * 60 * 60;
      data.forEach((dayData, i) => {
        // add the day index to the set of days
        dayIndexSet.add((data[i].date / oneDay).toFixed(0));
        dayIndexArray.push(data[i]);
        dayData.dailyVolumeUSD = new BigNumber(
          dayData.dailyVolumeUSD
        ).toNumber();
        dayData.reserveUSD = new BigNumber(dayData.reserveUSD).toNumber();
      });

      if (data[0]) {
        // fill in empty days
        let timestamp = data[0].date ? data[0].date : startTime;
        let latestLiquidityUSD = data[0].reserveUSD;
        let index = 1;
        while (timestamp < utcEndTime.unix() - oneDay) {
          const nextDay = timestamp + oneDay;
          const currentDayIndex = (nextDay / oneDay).toFixed(0);
          if (!dayIndexSet.has(currentDayIndex)) {
            data.push({
              date: nextDay,
              dayString: nextDay,
              dailyVolumeUSD: 0,
              reserveUSD: latestLiquidityUSD
            });
          } else {
            latestLiquidityUSD = dayIndexArray[index].reserveUSD;
            index = index + 1;
          }
          timestamp = nextDay;
        }
      }

      data = data.sort((a, b) =>
        new BigNumber(a.date).isGreaterThan(b.date) ? 1 : -1
      );
      commit('GET_KURVE_PAIR_CHART_SUCCESS', data);
      return data;
    } catch (e) {
      commit('GET_KURVE_PAIR_CHART_FAILURE', e);
      throw e;
    }
  },
  getTokenPriceByUSD: async ({ commit }, payload: PairAddressPayload) => {
    let tokenPriceByUSD = 0;
    if (!payload.address) {
      throw new Error('Token address is missing.');
    }

    commit('GET_TOKEN_PRICE_BY_USD_REQUEST');
    try {
      const result = await client.query({
        query: TOKEN_DERIVED_ETH(payload.address),
        fetchPolicy: 'no-cache'
      });

      const derivedUSD = result?.data?.tokens[0]?.derivedETH;
      tokenPriceByUSD = parseFloat(derivedUSD);

      commit('GET_TOKEN_PRICE_BY_USD_SUCCESS', derivedUSD);
    } catch (e) {
      commit('GET_TOKEN_PRICE_BY_USD_FAILURE', e);
    }

    return tokenPriceByUSD;
  },
  getTokensPriceByUSD: async ({ commit }, payload: TokenAddressesPayload) => {
    commit('GET_TOKENS_PRICE_BY_USD_REQUEST');
    // get usdt price
    try {
      const [ethPrice] = await actions.getEthPriceForKurve({ commit });
      if (!payload || !payload.tokens || payload.tokens.length === 0) {
        return [];
      }

      const tasks = payload.tokens.map(async token => {
        if (!token) {
          return 0;
        }

        if (!ethPrice) {
          return 0;
        }

        if (
          token === '0x0000000000000000000000000000000000000000' ||
          token === config.addresses.weth
        ) {
          return 0;
        }

        const tokenPrice = await actions.getTokenPriceByUSD(
          { commit },
          { address: token }
        );
        return tokenPrice * ethPrice;
      });

      const results = await Promise.all(tasks);
      commit('GET_TOKENS_PRICE_BY_USD_SUCCESS', results);
      return results;
    } catch (e) {
      commit('GET_TOKEN_PRICE_BY_USD_FAILURE', e);
      return [];
    }
  }
};

export default {
  state,
  mutations,
  actions
};
