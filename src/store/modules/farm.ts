import Vue from 'vue';
import {
  fetchFarmData,
  fetchFarmUserDataAsync,
  getBonusMultiplier,
  getMaxMint,
  getThresholdEpic,
  getTotalMint
} from "@/helpers/farm";
import config from '@/config';
import { Contract } from '@ethersproject/contracts';
import _ from 'lodash';
import abi from "@/helpers/abi";
import provider from '@/helpers/provider';
import BigNumber from "bignumber.js";
import { getBuniPrice } from "@/helpers/price";

const mutations = {
  setFarmData: (_state, data): void => {
    _state.data = data;
  },
  updateFarmData: (_state, data): void => {
    data.forEach((record, index) => {
      Vue.set(_state.data, index, {
        ...record,
        userData: _state.data[index].userData
      });
    });
  },
  setMyAccount: (_state, address): void => {
    _state.myAccount = address;
  },
  updateBonusMultiplier: (_state, amount): void => {
    _state.bonusMultiplier = amount;
  },
  updateMaxMint: (_state, amount): void => {
    _state.maxMint = amount;
  },
  updateTotalMint: (_state, amount): void => {
    _state.totalMint = amount;
  },
  updateThresholdEpic: (_state, amount): void => {
    if (isNaN(amount)) {
      amount = 10000;
    }
    _state.thresholdEpic = Math.max(amount || 0, 10000);
  },
  setIsInit: (_state, flag): void => {
    _state.isInit = flag;
  },
  setFarmUserData: (_state, payload): void => {
    const { arrayOfUserDataObjects } = payload;
    arrayOfUserDataObjects.forEach(userDataEl => {
      const { index } = userDataEl;
      Vue.set(_state.data, index, {
        ..._state.data[index],
        userData: userDataEl
      });
    });
  },
  clearFarmUserData: (_state): void => {
    _state.data.forEach(objInData => delete objInData.userData);
  },
  updateLoadingUserDataStatus: (_state, status): void => {
    _state.isLoadingUserData = status;
  }
};

const state = {
  myAccount: '',
  isInit: false,
  data: [],
  isLoadingUserData: false,
  bonusMultiplier: null,
  maxMint: null,
  totalMint: null,
  thresholdEpic: 10000,
};

const actions = {
  init: async ({ commit, dispatch, rootState }) => {
    commit('setIsInit', true);
    try {
      const bonusMultiplier = await getBonusMultiplier();
      // const maxMint = await getMaxMint();
      // const totalMint = await getTotalMint();
      commit('updateBonusMultiplier', bonusMultiplier);
      // commit('updateMaxMint', maxMint);
      // commit('updateTotalMint', totalMint);
    } catch (e) {
      console.error(e);
    }

    const farms = await fetchFarmData();
    commit('setFarmData', farms);
    commit('setIsInit', false);
    if (rootState.account.address) {
      dispatch('getFarmUserData');
    }
  },
  getFarmData: async ({ commit }) => {
    const farms = await fetchFarmData();
    commit('updateFarmData', farms);
  },
  getFarmUserData: async ({ state, commit, rootState }) => {
    commit('updateLoadingUserDataStatus', true);

    if (state.isInit) {
      commit('updateLoadingUserDataStatus', false);

      return null;
    }

    const thresholdEpic = await getThresholdEpic(rootState.account.address);
    commit('updateThresholdEpic', thresholdEpic);
    commit('setFarmUserData', await fetchFarmUserDataAsync(state.myAccount));
    commit('updateLoadingUserDataStatus', false);
  },
  getBuniFarmSummary: async ({ state }) => {
    const contract = new Contract(
      config.addresses.buni,
      abi['ERC20'],
      provider
    );
    let weiBuniAmount = await contract.balanceOf(config.addresses.masterChef)
    weiBuniAmount = weiBuniAmount.toString();
    const buniAmount = new BigNumber(weiBuniAmount);
    const price = await getBuniPrice();
    const tvl = new BigNumber(buniAmount).times(price).toString();

    return tvl;
  }
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
