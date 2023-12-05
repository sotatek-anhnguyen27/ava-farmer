import config from '@/config';
import store from '@/store';
import {ethers} from 'ethers';

const SIGN_MESSAGE = 'Join bunicorn game';
const domain = {
  name: 'Bunicorn Game',
  version: '1',
  chainId: config.chainId,
};

const types = {
  message: [
    { name: 'gamer', type: 'address' },
    { name: 'message', type: 'string' },
  ]
};

export async function sign() {
  const userProvider = await store.getters['account/provider'];
  return await userProvider.getSigner().signMessage(SIGN_MESSAGE);
}

export async  function signByBinanceWallet(address: string) {
  // @ts-ignore
  return await window.BinanceChain.request({method: 'eth_sign', params: [address, SIGN_MESSAGE]});
}

export function verifySign(signature: string) {
  return ethers.utils.verifyMessage(SIGN_MESSAGE, signature);
}

export async function signTypedData(account: string) {
  const message = {
    gamer: account,
    message: config.addresses.gameContract,
  };
  const userProvider = await store.getters['account/userProvider'];
  return await userProvider.getSigner()._signTypedData(domain, types, message);
}

export function verifyTypedData(account: string, signature: string) {
  const message = {
    gamer: account,
    message: config.addresses.gameContract,
  };
  return ethers.utils.verifyTypedData( domain, types, message, signature);
}

async function isBinanceWalletSupport() {
  // @ts-ignore
  return window.BinanceChain && await window.BinanceChain.isConnected();
}

export async function createSignature(account: string) {
  let signature;
  let signatureType;
  if (await isBinanceWalletSupport()) {
    signature = await signByBinanceWallet(account);
    signatureType = 'sign';
  } else {
    try {
      signature =  await signTypedData(account);
      signatureType = 'signTypedData';
    } catch (e) {
      signature =  await sign();
      signatureType = 'sign';
    }
  }

  return {
    signature,
    signatureType
  };
}
