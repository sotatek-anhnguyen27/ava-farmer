import { BaseProvider } from '@ethersproject/providers';

import { Call, all as callAll } from './call';
import { getEthBalance } from './calls';
import config from '@/config';

export default class Provider {
  provider?: BaseProvider;
  multicallAddress: string;

  constructor() {
    this.multicallAddress = config.addresses.multicall;
  }

  async init(provider: BaseProvider) {
    this.provider = provider;
    this.multicallAddress = config.addresses.multicall;
  }

  getEthBalance(address: string) {
    if (!this.provider) {
      console.error('Provider should be initialized before use.');
    }
    return getEthBalance(address, this.multicallAddress);
  }

  async all(calls: Call[]) {
    if (!this.provider) {
      console.error('Provider should be initialized before use.');
    }
    const provider = this.provider as BaseProvider;
    return await callAll(calls, this.multicallAddress, provider);
  }
}
