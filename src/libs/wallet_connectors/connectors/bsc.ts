import LockConnector from '../connector';
import InjectedConnector from './injected';

export default class Connector extends LockConnector {
  async connect() {
    try {
      const binanceChain = window['BinanceChain'];

      if (binanceChain) {
        await binanceChain.enable();

        return binanceChain;
      }

      const injectedConnector = new InjectedConnector(this.options.options);

      return await injectedConnector.connect();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
