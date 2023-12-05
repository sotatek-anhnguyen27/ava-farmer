import LockConnector from '../connector';

export default class Connector extends LockConnector {
  async connect() {
    let provider;
    if (window['ethereum']) {
      const connectorOptions = this.options.options;

      if (connectorOptions.chainId === 56 && this.options.id === 'metamask') {
        await this.connectToCustomNetwork();
      } else {
        await this.connectNormally();
      }

      provider = window['ethereum'];
    } else if (window['web3']) {
      provider = window['web3'].currentProvider;
    }

    return provider;
  }

  async isLoggedIn() {
    if (!window['ethereum']) return false;
    if (window['ethereum'].selectedAddress) return true;
    await new Promise(r => setTimeout(r, 400));
    return !!window['ethereum'].selectedAddress;
  }

  connectNormally() {
    if (!window['ethereum']) {
      return;
    }

    return window['ethereum'].enable();
  }

  async connectToCustomNetwork() {
    if (!window['ethereum']) {
      return;
    }

    const connectorOptions = this.options.options;
    const chainId = '0x' + connectorOptions.chainId.toString(16);

    //@ts-ignore
    await window['ethereum'].request({
      method: 'wallet_addEthereumChain',
      params: [
        Object.assign({}, connectorOptions, {
          chainId: chainId
        })
      ]
    });

    return window['ethereum'].enable();
  }
}
