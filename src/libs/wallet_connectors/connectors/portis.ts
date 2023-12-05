// @ts-ignore
const get = () => import(/* webpackChunkName: "portis" */ '@portis/web3'); // v2.0.0-beta.49
import LockConnector from '../connector';

export default class Connector extends LockConnector {
  async connect() {
    let provider;
    try {
      const config = this.options.options;
      const Portis = (await get()).default;
      const portis = new Portis(config.dappId, config.network);
      // @ts-ignore
      if (!portis.isLoggedIn()) {
        return;
      }
      // @ts-ignore
      await portis.provider.enable();
      // @ts-ignore
      portis.provider._portis = portis;
      // @ts-ignore
      provider = portis.provider;
    } catch (e) {
      console.error(e);
      throw e;
    }
    return provider;
  }
}
