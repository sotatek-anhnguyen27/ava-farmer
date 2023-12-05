import Vue from 'vue';
import {
  fetchPreStakingData,
  fetchPreStakingUserData
} from '@/helpers/prestaking';

const mutations = {
  setPreStakingData: (_state, data): void => {
    _state.data = data;
  },
  setIsEndedPrestaking: (_state, data): void => {
    _state.isEnded = data;
  },
  updatePreStakingData: (_state, data): void => {
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
  setIsInit: (_state, flag): void => {
    _state.isInit = flag;
  },
  setPreStakingUserData: (_state, payload): void => {
    const { arrayOfUserDataObjects } = payload;
    arrayOfUserDataObjects.forEach(userDataEl => {
      const { index } = userDataEl;
      Vue.set(_state.data, index, {
        ..._state.data[index],
        userData: userDataEl
      });
    });
  },
  clearPreStakingUserData: (_state): void => {
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
  isEnded: false
};

const actions = {
  init: async ({ commit, dispatch, rootState }) => {
    commit('setIsInit', false);
    const data = await fetchPreStakingData();
    commit('setPreStakingData', data);

    if (rootState.account.address) {
      dispatch('fetchPreStakingUserData');
    }
    commit('setIsInit', true);
  },
  fetchNew: async ({ commit }) => {
    const [preStakingData, userPreStakingData] = await Promise.all([
      fetchPreStakingData(),
      fetchPreStakingUserData(state.myAccount)
    ]);
    commit('setPreStakingData', preStakingData);
    commit('setPreStakingUserData', userPreStakingData);
  },
  setEndPrestaking: async ({ commit }, data) => {
    commit('setIsEndedPrestaking', data);
  },
  fetchPreStakingData: async ({ commit }) => {
    const farms = await fetchPreStakingData();
    commit('setPreStakingData', farms);
  },
  fetchPreStakingUserData: async ({ state, commit }) => {
    commit(
      'setPreStakingUserData',
      await fetchPreStakingUserData(state.myAccount)
    );
  }
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
