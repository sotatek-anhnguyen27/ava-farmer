import Vue from 'vue';
import config from '@/config';
import { sleep } from '@/utils/helpers';
import store from '@/store';
export const NOTIFICATION_DURATION = 20 * 1000;

export interface UIState {
  init: boolean;
  loading: boolean;
  authLoading: boolean;
  address: string;
  balances: object;
  pools: [];
  proxy: string;
  sidebarIsOpen: boolean;
  modalOpen: boolean;
  selectLanguageIsOpen: boolean;
  theme: string;
  modal: {
    asset: {
      isOpen: boolean;
      key: string;
    };
    settings: {
      isOpen: boolean;
      forKurve: boolean;
    };
    account: {
      isOpen: boolean;
    };
    connector: {
      isOpen: boolean;
    };
    testNestWarning: {
      isOpen: boolean;
    };
    tradingCompetitionCampaign: {
      isOpen: boolean;
    };
  };
  notifications: Notification[];
}

interface Notification {
  text: string;
  type: 'success' | 'error';
  link: string;
}

const state = {
  init: false,
  loading: false,
  authLoading: false,
  address: '',
  balances: {},
  pools: [],
  proxy: '',
  sidebarIsOpen: true,
  modalOpen: false,
  selectLanguageIsOpen: false,
  modal: {
    asset: {
      isOpen: false,
      key: ''
    },
    settings: {
      isOpen: false,
      forKurve: false
    },
    account: {
      isOpen: false
    },
    connector: {
      isOpen: false
    },
    testNestWarning: {
      isOpen: false
    },
    tradingCompetitionCampaign: {
      isOpen: false
    }
  },
  notifications: []
};

const mutations = {
  SET(_state, payload) {
    Object.keys(payload).forEach(key => {
      Vue.set(_state, key, payload[key]);
    });
  },

  // mutations swap ui
  setAssetModalOpen: (_state: UIState, isOpen: boolean): void => {
    _state.modal.asset.isOpen = isOpen;
  },
  setAssetModalKey: (_state: UIState, key: string): void => {
    _state.modal.asset.key = key;
  },
  setSettingsModal: (_state: UIState, isOpen: boolean): void => {
    _state.modal.settings.isOpen = isOpen;
  },
  setSettingsModalType: (_state: UIState, forKurve: boolean) => {
    _state.modal.settings.forKurve = forKurve;
  },
  setAccountModal: (_state: UIState, isOpen: boolean): void => {
    _state.modal.account.isOpen = isOpen;
  },
  setConnectorModal: (_state: UIState, isOpen: boolean): void => {
    _state.modal.connector.isOpen = isOpen;
  },
  setTestnetWarningModal: (_state: UIState, isOpen: boolean): void => {
    _state.modal.testNestWarning.isOpen = isOpen;
  },
  setTradingCompetitionCampaign: (_state: UIState, isOpen: boolean): void => {
    _state.modal.tradingCompetitionCampaign.isOpen = isOpen;
  },
  addNotification: (_state: UIState, notification: Notification): void => {
    _state.notifications.push(notification);
  },
  removeTopNotification: (_state: UIState): void => {
    _state.notifications.splice(0, 1);
  }
};

const actions = {
  init: async ({ commit, dispatch }) => {
    commit('SET', { loading: true });
    const tokenIds = Object.keys(config.tokens)
      .map(tokenAddress => config.tokens[tokenAddress].id)
      .filter(tokenId => !!tokenId);
    await Promise.all([
      dispatch('loadPricesById', tokenIds),
      dispatch('initTokenMetadata'),
    ]);
    dispatch('getBlockNumber');
    dispatch('farm/init');
    dispatch('prestaking/init');
    dispatch('fetchSummaries');

    if (process.env.VUE_APP_ENV !== 'production')
      store.dispatch('openTestnetWarningModal');
    if (process.env.VUE_APP_ENV == 'production')
      store.dispatch('openTradingCompetitionCampaign');

    commit('SET', { loading: false, init: true });
  },
  loading: ({ commit }, payload) => {
    commit('SET', { loading: payload });
  },
  toggleSidebar: ({ commit }) => {
    commit('SET', { sidebarIsOpen: !state.sidebarIsOpen });
  },
  hideSidebar: ({ commit }) => {
    commit('SET', { sidebarIsOpen: false });
  },
  toggleSelectLanguage: ({ commit }) => {
    commit('SET', { selectLanguageIsOpen: !state.selectLanguageIsOpen });
  },
  hideSelectLanguage: ({ commit }) => {
    commit('SET', { selectLanguageIsOpen: false });
  },
  toggleModal: ({ commit }, payload) => {
    commit('SET', { modalOpen: payload });
  },

  // action swap ui
  openAssetModal: ({ commit }, key: string): void => {
    commit('setAssetModalOpen', true);
    commit('setAssetModalKey', key);
  },
  closeAssetModal: ({ commit }): void => {
    commit('setAssetModalOpen', false);
  },
  openSettingsModal: ({ commit }, payload: { forKurve: boolean }): void => {
    commit('setSettingsModalType', payload.forKurve);
    commit('setSettingsModal', true);
  },
  closeSettingsModal: ({ commit }): void => {
    commit('setSettingsModal', false);
  },
  openAccountModal: ({ commit }): void => {
    commit('setAccountModal', true);
  },
  closeAccountModal: ({ commit }): void => {
    commit('setAccountModal', false);
  },
  openConnectorModal: ({ commit }): void => {
    commit('setConnectorModal', true);
  },
  closeConnectorModal: ({ commit }): void => {
    commit('setConnectorModal', false);
  },
  openTestnetWarningModal: ({ commit }): void => {
    commit('setTestnetWarningModal', true);
  },
  closeTestnetWarningModal: ({ commit }): void => {
    commit('setTestnetWarningModal', false);
  },
  openTradingCompetitionCampaign: ({ commit }): void => {
    commit('setTradingCompetitionCampaign', true);
  },
  closeTradingCompetitionCampaign: ({ commit }): void => {
    commit('setTradingCompetitionCampaign', false);
  },
  notify: async ({ commit }, notification: Notification): Promise<void> => {
    commit('addNotification', notification);
    await sleep(NOTIFICATION_DURATION);
    commit('removeTopNotification');
  }
};

export default {
  state,
  mutations,
  actions
};
