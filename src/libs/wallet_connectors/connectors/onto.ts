import LockConnector from '../connector';
import Web3 from 'web3';

export default class Connector extends LockConnector {
  // @ts-ignore
  async connect() {
    if (window['ethereum']) {
      return this.connectNormally();
    }

    const web3 = new Web3(window['onto']);

    await web3.eth.requestAccounts();

    return web3.currentProvider;
  }

  async connectNormally() {
    // @ts-ignore
    await window['ethereum'].enable();

    return window['ethereum'];
  }
}
