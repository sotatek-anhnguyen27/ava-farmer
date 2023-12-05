import { Provider, Web3Provider } from '@ethersproject/providers';

import Ethereum, { Allowances, Balances } from '@/helpers/ethereum';
import lock, { getConnectorLogo, getConnectorName } from '@/utils/connectors';
import provider from '@/helpers/provider';
import Storage from '@/utils/storage';
import Vue from 'vue';
import { Contract } from '@ethersproject/contracts';
import config from '@/config';
import abi from '@/helpers/abi';
import { Interface } from '@ethersproject/abi';
import { BNB_KEY, isMobile } from '@/utils/helpers';
import store from '@/store';
import i18n from '@/i18n';
import { fetchUserAllowances } from '@/helpers/prestaking';
import {
  fetchFarmUserAllowances,
  fetchSyrupFarmUserAllowances
} from '@/helpers/farm';
// import * as SentryBrowser from '@sentry/browser';

export interface AccountState {
  connector: Connector | null;
  address: string;
  chainId: number;
  proxy: string;
  balances: Balances;
  allowances: Allowances;
  wrongNetwork: boolean;
  provider: any;
}

interface Connector {
  id: string;
  name: string;
}

const mutations = {
  setConnector: (_state: AccountState, connector: Connector | null): void => {
    _state.connector = connector;
  },
  setProvider: (_state: AccountState, provider: any): void => {
    _state.provider = provider;
  },
  setAddress: (_state: AccountState, address: string): void => {
    _state.address = address;
  },
  setWrongNetwork: (_state: AccountState, wrongNetwork: boolean): void => {
    _state.wrongNetwork = wrongNetwork;
  },
  setChainId: (_state: AccountState, chainId: number): void => {
    _state.chainId = chainId;
  },
  setProxy: (_state: AccountState, proxy: string): void => {
    // Vue.prototype.$mixpanel.people.set({
    //   'DS proxy': proxy
    // });
    _state.proxy = proxy;
  },
  addBalances: (_state: AccountState, balances: Balances): void => {
    for (const address in balances) {
      Vue.set(_state.balances, address, balances[address]);
    }
  },
  addAllowances: (_state: AccountState, allowances: Allowances): void => {
    for (const spender in allowances) {
      if (!_state.allowances[spender]) {
        Vue.set(_state.allowances, spender, {});
      }
      for (const asset in allowances[spender]) {
        const allowance = allowances[spender][asset];
        Vue.set(_state.allowances[spender], asset, allowance);
      }
    }
  },
  clear: (_state: AccountState): void => {
    _state.proxy = '';
    _state.balances = {};
    _state.allowances = {};
    _state.wrongNetwork = false;
  }
};

const actions = {
  init: async ({ dispatch }) => {
    // Save Web3 provider if available
    const connectorId = Storage.getConnector();
    dispatch('connect', connectorId);
  },
  connect: async ({ commit, dispatch }, connectorId): Promise<void> => {
    if (!connectorId) {
      return;
    }
    const connector = lock.getConnector(connectorId);
    if (!connector) {
      return;
    }
    console.log('=== setting connector:' + connectorId + ' ===');
    let provider = undefined;
    try {
      // @ts-ignored
      provider = await connector.connect();
    } catch (e) {
      console.error('==== connecting wallet error=====', JSON.stringify(e));
    }
    // @ts-ignored
    if (!provider) {
      const isMobileWeb = isMobile();

      store.dispatch('notify', [
        'error',
        {
          text: isMobileWeb
            ? i18n.t('providerNotFoundMobile')
            : i18n.t('providerNotFound'),
          type: 'error'
        }
      ]);
      dispatch('disconnect');
      return;
    }
    commit('setConnector', {
      id: connectorId,
      name: getConnectorName(connectorId),
      logo: getConnectorLogo(connectorId)
    });
    // @ts-ignored
    console.log(`Loading account information from provider: ${connectorId}`);
    const web3Provider = new Web3Provider(provider);
    const accounts = await web3Provider.listAccounts();
    if (accounts.length === 0) {
      dispatch('disconnect');
      return;
    }
    dispatch('listenProviderEvent', provider);
    dispatch('saveProvider', provider);
    dispatch('transactions/checkPendingTransactions', null, { root: true });
    Storage.saveConnector(connectorId);
  },
  disconnect: async ({ commit }): Promise<void> => {
    const connectorId = Storage.getConnector();
    if (connectorId) {
      const connector = lock.getConnector(connectorId);
      let provider: any = undefined;
      try {
        // @ts-ignored
        provider = await connector.connect();
      } catch (e) {
        console.error('==== connecting wallet error=====', JSON.stringify(e));
      }
      if (provider && provider.removeAllListeners) {
        provider.removeAllListeners();
      }
      const isLoggedIn = connector.isLoggedIn();
      if (isLoggedIn) {
        await connector.logout();
      }
      Storage.clearConnector();
    }
    if (provider.removeAllListeners) {
      provider.removeAllListeners();
    }
    commit('setConnector', null);
    commit('setAddress', '');
    commit('setChainId', 0);
    commit('setWrongNetwork', false);
    commit('clear');
    commit('transactions/setTransactions', {}, { root: true });
    commit('farm/setMyAccount', '', { root: true });
    commit('farm/clearFarmUserData', null, { root: true });
    commit('farm/updateThresholdEpic', 10000, { root: true });
    commit('prestaking/clearPreStakingUserData', null, { root: true });
  },
  listenProviderEvent: ({ commit, dispatch }, provider: any): any => {
    if (provider.removeAllListeners) {
      provider.removeAllListeners();
    }

    if (provider && provider.on) {
      provider.on('chainChanged', async () => {
        commit('clear');
        dispatch('saveProvider', provider);
      });
      provider.on('accountsChanged', async () => {
        commit('clear');
        dispatch('saveProvider', provider);
      });
      provider.on('disconnect', async () => {
        console.log('TRIGGER');

        dispatch('disconnect');
      });
    }
  },
  saveProvider: async (
    { state, commit, dispatch },
    provider: any
  ): Promise<void> => {
    // @ts-ignore
    const web3Provider = new Web3Provider(provider);
    const accounts = await web3Provider.listAccounts();
    const account = accounts[0];
    const connectorId = state.connector ? state.connector.id : '';
    let networkChainId = 0;

    switch (connectorId) {
      case 'safepalwallet': {
        networkChainId = provider.chainId;
        break;
      }
      default: {
        const network = await web3Provider.getNetwork();
        networkChainId = network.chainId;
        break;
      }
    }

    if (state.address !== account) {
      console.log('clearTransactions', state.address);
      Storage.clearTransactions(state.address);
    }

    commit('setAddress', account);
    // SentryBrowser.setTag('my_address', account);

    // Vue.prototype.$mixpanel.identify(account);
    // Vue.prototype.$mixpanel.people.set({
    //   'Last provider': Storage.getConnector() || 'empty',
    //   'Last login at': Date.now(),
    //   $email: account
    // });
    // Vue.prototype.$mixpanel.track('Login', {
    //   provider: Storage.getConnector() || 'empty',
    //   network: networkChainId
    // });

    commit('setChainId', networkChainId);
    commit('farm/setMyAccount', account, { root: true });
    commit('prestaking/setMyAccount', account, { root: true });

    if (networkChainId != config.chainId) {
      commit('clear');
      commit('setWrongNetwork', true);
      const connector = lock.getConnector(state.connector.id);
      const isLoggedIn = connector.isLoggedIn();
      if (isLoggedIn) {
        await connector.logout();
      }
      Storage.clearConnector();
      return;
    }
    commit('setWrongNetwork', false);
    dispatch('fetchState');

    dispatch('getUserPoolShares', null, { root: true });
    dispatch('transactions/getTransactions', null, { root: true });
    dispatch('farm/getFarmUserData', null, { root: true });
    dispatch('prestaking/fetchPreStakingUserData', null, { root: true });
    dispatch('getFarmAllowances');
    dispatch('getSyrupFarmAllowances');
    dispatch('getPreStakingAllowances');
  },
  fetchState: async ({
    commit,
    state,
    dispatch,
    rootGetters
  }): Promise<void> => {
    const { address } = state;
    if (!address) {
      return;
    }

    const metadata = rootGetters['assets/metadata'];
    const assets = Object.keys(metadata);
    console.time(`[API] Fetched account state: ${address}`);
    const { proxy, balances, allowances } = await Ethereum.fetchAccountState(
      address,
      assets
    );
    console.timeEnd(`[API] Fetched account state: ${address}`);
    commit('setProxy', proxy);
    commit('addBalances', balances);
    commit('addAllowances', allowances);

    dispatch('getPoolAllowances');
  },
  getBalances: async ({ state, commit }, tokens) => {
    const address = state.address;
    const promises: any = [];
    const multi = new Contract(
      config.addresses.multicall,
      abi['Multicall'],
      provider
    );
    const calls = [];
    const testToken = new Interface(abi.TestToken);
    const tokensToFetch = tokens
      ? tokens
      : Object.keys(state.balances).filter(token => token !== BNB_KEY);
    tokensToFetch.forEach(token => {
      // @ts-ignore
      calls.push([token, testToken.encodeFunctionData('balanceOf', [address])]);
    });
    promises.push(multi.aggregate(calls));
    promises.push(multi.getEthBalance(address));
    const balances: any = {};
    try {
      // @ts-ignore
      const [[, response], ethBalance] = await Promise.all(promises);
      // @ts-ignore
      balances[BNB_KEY] = ethBalance.toString();
      let i = 0;
      response.forEach(value => {
        if (tokensToFetch && tokensToFetch[i]) {
          const balanceNumber = testToken.decodeFunctionResult(
            'balanceOf',
            value
          );
          balances[tokensToFetch[i]] = balanceNumber.toString();
        }
        i++;
      });
      commit('addBalances', balances);
      return balances;
    } catch (e) {
      return Promise.reject();
    }
  },
  fetchAssets: async ({ commit, state }, assets: string[]): Promise<void> => {
    const { address } = state;
    if (!address || state.chainId !== config.chainId) {
      return;
    }
    console.time(`[API] Fetched account state: ${address}`);
    const { balances, allowances } = await Ethereum.fetchAccountState(
      address,
      assets
    );
    console.timeEnd(`[API] Fetched account state: ${address}`);
    commit('addBalances', balances);
    commit('addAllowances', allowances);
  },
  getPoolAllowances: async ({ state, commit }, tokens) => {
    if (!tokens) {
      tokens = Object.entries(config.tokens).map(token => token[1].address);
    }

    const spender: any = state.proxy;
    if (!spender) return;
    const address = state.address;
    const promises: any = [];
    const multi = new Contract(
      config.addresses.multicall,
      abi['Multicall'],
      provider
    );
    const calls = [];
    const testToken = new Interface(abi.TestToken);
    tokens.forEach(token => {
      calls.push([
        // @ts-ignore
        token,
        // @ts-ignore
        testToken.encodeFunctionData('allowance', [address, spender])
      ]);
    });
    promises.push(multi.aggregate(calls));
    const allowances: any = {};
    try {
      const [, response] = await multi.aggregate(calls);
      let i = 0;
      response.forEach(value => {
        if (tokens && tokens[i]) {
          const tokenAllowanceNumber = testToken.decodeFunctionResult(
            'allowance',
            value
          );
          if (!allowances[tokens[i]]) {
            allowances[tokens[i]] = {};
          }
          allowances[tokens[i]][spender] = tokenAllowanceNumber.toString();
        }
        i++;
      });
      commit('addAllowances', allowances);
      return allowances;
    } catch (e) {
      return Promise.reject();
    }
  },
  getProxy: async ({ state, commit }) => {
    const address = state.address;
    try {
      const dsProxyRegistryContract = new Contract(
        config.kalancer.addresses.dsProxyRegistry,
        abi['DSProxyRegistry'],
        provider
      );
      const proxy = await dsProxyRegistryContract.proxies(address);

      commit('setProxy', proxy);

      return proxy;
    } catch (e) {
      return Promise.reject(e);
    }
  },
  getPreStakingAllowances: async ({ state, commit }) => {
    const allowances = await fetchUserAllowances(state.address);
    const addAllowances = {};
    config.prestaking.forEach((item, index) => {
      addAllowances[item.lpAddress] = {};
      addAllowances[item.lpAddress][item.preStakingAddress] = allowances[index];
    });
    commit('addAllowances', addAllowances);
  },
  getFarmAllowances: async ({ state, commit }) => {
    const allowances = await fetchFarmUserAllowances(state.address);
    const addAllowances = {};
    config.farms.forEach((item, index) => {
      addAllowances[`${item.poolAddress}-${item.pid}`] = {};
      addAllowances[`${item.poolAddress}-${item.pid}`][item.lpAddresses] =
        allowances[index];
    });
    commit('addAllowances', addAllowances);
  },
  getSyrupFarmAllowances: async ({ state, commit }) => {
    const allowances = await fetchSyrupFarmUserAllowances(state.address);
    const addAllowances = {};
    config.syrupFarms.forEach((item, index) => {
      addAllowances[`${item.poolAddress}-${item.pid}`] = {};
      addAllowances[`${item.poolAddress}-${item.pid}`][item.lpAddresses] =
        allowances[index];
    });
    commit('addAllowances', addAllowances);
  }
};

const getters = {
  provider: async (state: AccountState): Promise<Provider> => {
    if (state.connector && state.connector.id) {
      const connector = lock.getConnector(state.connector.id);
      const provider = await connector.connect();
      // @ts-ignore
      return new Web3Provider(provider);
    }
    return provider;
  },
  myAddress: (state: AccountState) => {
    if (state.connector && state.connector.id) {
      return state.address
    }
    return null;
  }
};

function state(): AccountState {
  return {
    connector: null,
    address: '',
    chainId: 0,
    proxy: '',
    balances: {},
    allowances: {},
    wrongNetwork: false,
    provider: undefined
  };
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
