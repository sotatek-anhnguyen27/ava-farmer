import Vue from 'vue';
import { Contract } from '@ethersproject/contracts';
import { Interface } from '@ethersproject/abi';
import store from '@/store';
import abi from '@/helpers/abi';
import config from '@/config';
import provider from '@/helpers/provider';
import wsProvider from '@/helpers/wsProvider';
import { multicall } from '@/_balancer/utils';
import { BNB_KEY } from '@/utils/helpers';

if (wsProvider) {
  wsProvider.on('block', blockNumber => {
    store.commit('GET_BLOCK_SUCCESS', blockNumber);
  });
}

const state = {
  injectedLoaded: false,
  injectedChainId: null,
  blockNumber: 0,
  account: null,
  name: null,
  dsProxyAddress: null,
  active: false,
  balances: {},
  allowances: {},
  tokenMetadata: {}
};

const mutations = {
  LOAD_TOKEN_METADATA_REQUEST() {
    console.debug('LOAD_TOKEN_METADATA_REQUEST');
  },
  LOAD_TOKEN_METADATA_SUCCESS(_state, payload) {
    for (const address in payload) {
      Vue.set(_state.tokenMetadata, address, payload[address]);
    }
    console.debug('LOAD_TOKEN_METADATA_SUCCESS');
  },
  LOAD_TOKEN_METADATA_FAILURE(_state, payload) {
    console.debug('LOAD_TOKEN_METADATA_FAILURE', payload);
  },
  GET_BLOCK_SUCCESS(_state, blockNumber) {
    Vue.set(_state, 'blockNumber', blockNumber);
    console.log('GET_BLOCK_SUCCESS', blockNumber);
  }
};

const actions = {
  initTokenMetadata: async ({ commit }) => {
    const invalids = ['0xD46bA6D942050d489DBd938a2C909A5d5039A161'];
    const metadata = Object.fromEntries(
      Object.entries(config.tokens).map(tokenEntry => {
        const { decimals, symbol, name } = tokenEntry[1] as any;
        return [
          tokenEntry[0],
          {
            decimals,
            symbol,
            name,
            whitelisted: !invalids.includes(tokenEntry[0])
          }
        ];
      })
    );
    commit('LOAD_TOKEN_METADATA_SUCCESS', metadata);
  },
  loadTokenMetadata: async ({ commit }, tokens) => {
    commit('LOAD_TOKEN_METADATA_REQUEST');
    try {
      const keys = ['decimals', 'symbol', 'name'];
      const calls = tokens
        .map(token =>
          keys.map(key => {
            return { address: token, name: key, params: [] };
          })
        )
        .reduce((a, b) => [...a, ...b]);
      const res = await multicall(provider, abi['TestToken'], calls);
      const tokenMetadata = Object.fromEntries(
        tokens.map((token, i) => [
          token,
          Object.fromEntries(
            keys.map((key, keyIndex) => [
              key,
              ...res[keyIndex + i * keys.length]
            ])
          )
        ])
      );
      commit('LOAD_TOKEN_METADATA_SUCCESS', tokenMetadata);
      return tokenMetadata;
    } catch (e) {
      commit('LOAD_TOKEN_METADATA_FAILURE', e);
      return Promise.reject();
    }
  },
  getPoolBalances: async (_state, { poolAddress, tokens }) => {
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
      calls.push([
        // @ts-ignore
        token,
        // @ts-ignore
        testToken.encodeFunctionData('balanceOf', [poolAddress])
      ]);
    });
    promises.push(multi.aggregate(calls));
    const balances: any = {};
    try {
      // @ts-ignore
      const [[, response]] = await Promise.all(promises);
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
      return balances;
    } catch (e) {
      return Promise.reject();
    }
  },
  getBlockNumber: async ({ commit }) => {
    try {
      const blockNumber = await provider.getBlockNumber();
      commit('GET_BLOCK_SUCCESS', blockNumber);
      return blockNumber;
    } catch (e) {
      return Promise.reject();
    }
  }
};

export default {
  state,
  mutations,
  actions
};
