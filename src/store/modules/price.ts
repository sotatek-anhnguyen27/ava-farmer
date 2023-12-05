import Vue from 'vue';
import { getAddress } from '@ethersproject/address';
import config from '@/config';
import { getPrices } from '@/utils/price';
import { getBuniPrice, getBurPrice } from "@/helpers/price";

const ENDPOINT = 'https://api.coingecko.com/api/v3';

export interface PriceState {
  prices: Record<string, number>;
  values: object;
}

const state = {
  values: {},
  prices: []
};

const mutations = {
  GET_PRICE_REQUEST() {
    console.debug('GET_PRICE_REQUEST');
  },
  async GET_PRICE_SUCCESS(_state, payload) {
    for (const address in payload) {
      const price = payload[address];
      Vue.set(_state.values, address, price);
    }
    console.debug('GET_PRICE_SUCCESS');
  },
  setPrices: async (
    _state: PriceState,
    prices: Record<string, number>
  ): Promise<void> => {
    for (const address in prices) {
      _state.prices[address] = prices[address];
    }
  }
};

const actions = {
  loadPricesById: async ({ commit }, payload) => {
    commit('GET_PRICE_REQUEST');
    const idString = payload.join('%2C');
    let data;
    try {
      const url = `${ENDPOINT}/simple/price?ids=${idString}&vs_currencies=usd`;
      const response = await fetch(url);
      data = await response.json();
    } catch (e) {
      return;
    }
    const idToAddressMap = {};
    for (const address in config.tokens) {
      const id = config.tokens[address].id;
      if (!id) {
        continue;
      }
      idToAddressMap[id] = address;
    }
    const prices = {};
    for (const id in data) {
      const price = data[id].usd;
      const address = idToAddressMap[id];
      prices[address] = price;
    }
    prices[getAddress(config.addresses.bur)] = await getBurPrice();
    prices[getAddress(config.addresses.buni)] = await getBuniPrice();
    commit('GET_PRICE_SUCCESS', prices);
  },
  loadPricesByAddress: async ({ commit }, payload) => {
    commit('GET_PRICE_REQUEST');
    const contractString = payload.join('%2C');
    let data;
    try {
      const url = `${ENDPOINT}/simple/token_price/ethereum?contract_addresses=${contractString}&vs_currencies=usd`;
      const response = await fetch(url);
      data = await response.json();
    } catch (e) {
      return;
    }
    const prices = {};
    for (const address in data) {
      const price = data[address].usd;
      prices[getAddress(address)] = price;
    }
    prices[getAddress(config.addresses.bur)] = await getBurPrice();
    prices[getAddress(config.addresses.buni)] = await getBuniPrice();
    commit('GET_PRICE_SUCCESS', prices);
  },
  initPrices: async ({ dispatch }): Promise<void> => {
    dispatch('fetchPrices');
  },
  fetchPrices: async ({ commit }): Promise<void> => {
    const assets = ['ethereum'];
    const prices = await getPrices(assets);

    prices[getAddress(config.addresses.buni)] = await getBuniPrice();
    prices[getAddress(config.addresses.bur)] = await getBurPrice();
    commit('setPrices', prices);
  }
};

const getters = {
  prices: ({ values }) => {
    return values;
  }
};

export default {
  state,
  mutations,
  actions,
  getters
};
