import LockConnector from '../connector';
import { CloverConnector, NoCloverProviderError } from "@clover-network/clover-connector";
import InjectedConnector from "@/libs/wallet_connectors/connectors/injected";
import { isMobile } from "@/utils/helpers";
import store from "@/store";

export default class Connector extends LockConnector {
  async connect() {
    let provider;
    try {
      const config = this.options.options;
      const cloverConnector = new CloverConnector({ supportedChainIds: [config.chainId] });
      try {
        provider = await cloverConnector.getProvider();
        await cloverConnector.activate();
        const isLoggedIn = await cloverConnector.isAuthorized();
        if (!isLoggedIn) return;
      } catch (e) {
        const isMobileWeb = isMobile();
        if (isMobileWeb && e instanceof NoCloverProviderError) {
          const injectedConnector = new InjectedConnector(this.options);
          provider = await injectedConnector.connect();
        }
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
    return provider;
  }
}
