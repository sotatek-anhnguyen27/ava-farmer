import Storage, { VestingMode } from '@/utils/storage';

export interface Theme {
  mode: string;
  language: string;
  vestingMode: VestingMode;
}

const mutations = {
  setTheme: (_state: Theme, mode: string): void => {
    _state.mode = mode;
    Storage.setModeTheme(mode);
  },
  setLanguage: (_state: Theme, language: string): void => {
    _state.language = language;
    Storage.saveLanguage(language);
  },
  setVestingMode: (_state: Theme, vestingMode: VestingMode): void => {
    _state.vestingMode = vestingMode;
    Storage.setVestingMode(vestingMode);
  }
};

const actions = {
  init: async ({ dispatch }): Promise<void> => {
    dispatch('setTheme');
  },
  setTheme: async ({ commit }, mode): Promise<void> => {
    commit('setTheme', mode);
  },
  setLanguage: async ({ commit }, language): Promise<void> => {
    commit('setLanguage', language);
  },
  setVestingMode: async ({ commit }, vestingMode): Promise<void> => {
    commit('setVestingMode', vestingMode);
  }
};

function state(): Theme {
  return {
    mode: Storage.getModeTheme(),
    language: Storage.getLanguage(),
    vestingMode: Storage.getVestingMode()
  };
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
