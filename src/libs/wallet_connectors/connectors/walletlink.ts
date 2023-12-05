// @ts-ignore
const get = () => import(/* webpackChunkName: "walletlink" */ 'walletlink'); // v^2.0.2
import LockConnector from '../connector';

export default class Connector extends LockConnector {
  async connect() {
    let provider;
    try {
      const config = this.options.options;
      const WalletLink = (await get()).default;
      const walletLink = new WalletLink(config);
      // @ts-ignore
      provider = walletLink.makeWeb3Provider(
        config.ethJsonrpcUrl,
        config.chainId
      );
      await provider.enable();
    } catch (e) {
      console.error(e);
      throw e;
    }
    return provider;
  }

  logout() {
    if (localStorage) {
      localStorage.removeItem(
        '-walletlink:https://www.walletlink.org:session:id'
      );
      localStorage.removeItem(
        '-walletlink:https://www.walletlink.org:session:secret'
      );
      localStorage.removeItem(
        '-walletlink:https://www.walletlink.org:session:linked'
      );
      localStorage.removeItem(
        '-walletlink:https://www.walletlink.org:Addresses'
      );
    }
    return;
  }
}
