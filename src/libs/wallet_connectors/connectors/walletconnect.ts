// @ts-ignore
const get = () =>
  import(
    /* webpackChunkName: "walletconnect" */ '@walletconnect/web3-provider'
  ); // v^1.0.13
import LockConnector from '../connector';

export default class Connector extends LockConnector {
  async connect() {
    let provider;
    try {
      const WalletConnectProvider = (await get()).default;
      provider = new WalletConnectProvider(this.options.options);
      await provider.enable();
    } catch (e) {
      console.error(e);
      throw e;
    }
    return provider;
  }

  logout() {
    if (localStorage) {
      localStorage.removeItem('walletconnect');
    }
    return;
  }
}
