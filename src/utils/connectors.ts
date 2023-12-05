import Lock from '../libs/wallet_connectors/lock';
import Injected from '../libs/wallet_connectors/connectors/injected';
import Fortmatic from '../libs/wallet_connectors/connectors/fortmatic';
import Portis from '../libs/wallet_connectors/connectors/portis';
import Walletconnect from '../libs/wallet_connectors/connectors/walletconnect';
import Walletlink from '../libs/wallet_connectors/connectors/walletlink';
import BSC from '../libs/wallet_connectors/connectors/bsc';
import Onto from '../libs/wallet_connectors/connectors/onto';
import Clover from '../libs/wallet_connectors/connectors/clover';

// @ts-ignore
import defaultLogo from '@/assets/connector/default.svg';
// @ts-ignore
import fortmaticLogo from '@/assets/connector/fortmatic.svg';
// @ts-ignore
import frameLogo from '@/assets/connector/frame.svg';
// @ts-ignore
import imtokenLogo from '@/assets/connector/imtoken.svg';
// @ts-ignore
import metamaskLogo from '@/assets/connector/metamask.svg';
// @ts-ignore
import portisLogo from '@/assets/connector/portis.svg';
// @ts-ignore
import statusLogo from '@/assets/connector/status.svg';
// @ts-ignore
import trustwalletLogo from '@/assets/connector/trustwallet.svg';
// @ts-ignore
import walletconnectLogo from '@/assets/connector/walletconnect.svg';
// @ts-ignore
import walletlinkLogo from '@/assets/connector/walletlink.svg';

// @ts-ignore
import mathWalletLogo from '@/assets/connector/mathwallet.png';
// @ts-ignore
import ontoWalletLogo from '@/assets/connector/ontowallet.svg';
// @ts-ignore
import coin98Logo from '@/assets/connector/coin98.png';
// @ts-ignore
import cloverLogo from '@/assets/connector/clover.png';

import config from '@/config';

const lock = new Lock();

const connectors = {
  injected: Injected,
  metamask: Injected,
  trustwallet: Injected,
  mathwallet: Injected,
  tokenpocket: Injected,
  safepalwallet: Injected,
  fortmatic: Fortmatic,
  portis: Portis,
  walletconnect: Walletconnect,
  walletlink: Walletlink,
  bsc: BSC,
  ontowallet: Onto,
  coin98: Injected,
  clover: Clover
};

for (const connectorId in connectors) {
  const connector = {
    key: connectorId,
    connector: connectors[connectorId],
    options: config.connectors[connectorId]
  };
  lock.addConnector(connector);
}

export function hasInjectedProvider(): boolean {
  return !!window.ethereum;
}

export function getConnectorName(connectorId: string): string {
  if (connectorId === 'injected') {
    const provider = window.ethereum || {};
    // @ts-ignore
    if (provider.isMetaMask) {
      return 'MetaMask';
    }
    // @ts-ignore
    if (provider.isImToken) {
      return 'imToken';
    }
    // @ts-ignore
    if (provider.isStatus) {
      return 'Status';
    }
    // @ts-ignore
    if (provider.isTrust) {
      return 'Trust Wallet';
    }
    // @ts-ignore
    if (provider.isFrame) {
      return 'Frame';
    }
    // @ts-ignore
    if (provider.isCoin98) {
      return 'Coin98 Wallet';
    }
    return 'Browser Wallet';
  }
  if (connectorId === 'fortmatic') {
    return 'Fortmatic';
  }
  if (connectorId === 'portis') {
    return 'Portis';
  }
  if (connectorId === 'walletconnect') {
    return 'WalletConnect';
  }
  if (connectorId === 'walletlink') {
    return 'Coinbase Wallet';
  }

  if (connectorId === 'metamask') {
    return 'MetaMask';
  }

  if (connectorId === 'mathwallet') {
    return 'MathWallet';
  }

  if (connectorId === 'ontowallet') {
    return 'ONTO Wallet';
  }

  if (connectorId === 'coin98') {
    return 'Coin98 Wallet';
  }

  if (connectorId === 'clover') {
    return 'Clover Wallet';
  }
  return 'Unknown';
}

export function getConnectorLogo(connectorId: string): string {
  if (connectorId === 'injected') {
    const provider = window.ethereum || {};
    // @ts-ignore
    if (provider.isMetaMask) {
      return metamaskLogo;
    }
    // @ts-ignore
    if (provider.isImToken) {
      return imtokenLogo;
    }
    // @ts-ignore
    if (provider.isStatus) {
      return statusLogo;
    }
    // @ts-ignore
    if (provider.isTrust) {
      return trustwalletLogo;
    }
    // @ts-ignore
    if (provider.isFrame) {
      return frameLogo;
    }
    // @ts-ignore
    if (provider.isCoin98) {
      return coin98Logo;
    }
    return defaultLogo;
  }
  if (connectorId === 'fortmatic') {
    return fortmaticLogo;
  }
  if (connectorId === 'portis') {
    return portisLogo;
  }
  if (connectorId === 'walletconnect') {
    return walletconnectLogo;
  }
  if (connectorId === 'walletlink') {
    return walletlinkLogo;
  }
  if (connectorId === 'mathwallet') {
    return mathWalletLogo;
  }
  if (connectorId === 'metamask') {
    return metamaskLogo;
  }
  if (connectorId === 'ontowallet') {
    return ontoWalletLogo;
  }
  if (connectorId === 'coin98') {
    return coin98Logo;
  }
  if (connectorId === 'clover') {
    return cloverLogo;
  }
  return defaultLogo;
}

export default lock;
