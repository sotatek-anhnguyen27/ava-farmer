import Vue from 'vue';
import Storage from '@/utils/storage';
import BigNumber from '@/helpers/bignumber';
import { normalizeBalance } from '@/helpers/utils';
import { getBalanceNumber } from '@/helpers/farm';

export interface Summaries {
  totalLiquidity: number;
}

const state = {
  totalLiquidity: 0
};

const mutations = {
  setTotalLiquidity: (
    _state: Summaries,
    { tokensSummary, stablecoinsSummary, buniFarm }
  ): void => {
    const tokensLiquidity = tokensSummary?.totalLiquidity || 0;
    const stablecoinsLiquidity = stablecoinsSummary?.totalLiquidityUSD || 0;
    const totalLiquidity = new BigNumber(tokensLiquidity)
      .plus(stablecoinsLiquidity)
      .plus(buniFarm)
      .toNumber();
    Vue.set(_state, 'totalLiquidity', totalLiquidity);
  }
};

const actions = {
  fetchSummaries: async ({ commit, dispatch }) => {
    console.log('Fetching summary data');
    const [tokensSummary, stablecoinsSummary] = await Promise.all([
      dispatch('getBuniTokensSummary'),
      dispatch('getBuniStablecoinsSummary')
    ]);

    const buniFarm = getBalanceNumber(
      await dispatch('farm/getBuniFarmSummary')
    );
    commit('setTotalLiquidity', {
      tokensSummary,
      stablecoinsSummary,
      buniFarm
    });
  }
};
export default {
  state,
  mutations,
  actions
};
