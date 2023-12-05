// @ts-ignore
const get = () => import(/* webpackChunkName: "fortmatic" */ 'fortmatic'); // v^2.0.6
import LockConnector from '../connector';

export default class Connector extends LockConnector {
  async connect() {
    let provider;
    try {
      const config = this.options.options;
      const Fortmatic = (await get()).default;
      const fm: any = new Fortmatic(config.apiKey, config.network);
      provider = await fm.getProvider();
      await fm.user.login();
      const isLoggedIn = await fm.user.isLoggedIn();
      if (!isLoggedIn) return;
    } catch (e) {
      console.error(e);
      throw e;
    }
    return provider;
  }

  async isLoggedIn() {
    return false;
  }
}
