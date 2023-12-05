import BigNumber from 'bignumber.js';
import { getAddress } from '@ethersproject/address';
import config from '@/config';

export const BNB_KEY = config.chainId === 56 ? 'bnb' : 'eth';

export function formatAddress(address: string, length = 8): string {
  const ellipsizedAddress = `${address.substr(
    0,
    2 + length / 2
  )}…${address.substr(42 - length / 2)}`;
  return ellipsizedAddress;
}

export function formatTxHash(txHash: string, length = 16): string {
  const ellipsizedHash = `${txHash.substr(0, 2 + length / 2)}…${txHash.substr(
    66 - length / 2
  )}`;
  return ellipsizedHash;
}

export function formatDate(timestamp: number): string {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  };
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', options);
}

export function isAddress(value: string): boolean {
  try {
    getAddress(value);
  } catch (e) {
    return false;
  }
  return true;
}

export function scale(input: BigNumber, decimalPlaces: number): BigNumber {
  const scalePow = new BigNumber(decimalPlaces.toString());
  const scaleMul = new BigNumber(10).pow(scalePow);
  return input.times(scaleMul);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}

export function getEtherscanLink(txHash: string): string {
  const chainId = config.chainId;
  if (chainId == 56) {
    return `https://bscscan.com/tx/${txHash}`;
  }

  const prefixMap = {
    1: '',
    42: 'kovan.'
  };
  const prefix = prefixMap[chainId];
  const link = `https://${prefix}etherscan.io/tx/${txHash}`;
  return link;
}

export function getAccountLink(address: string): string {
  const chainId = config.chainId;

  if (chainId == 56) {
    return `https://bscscan.com/address/${address}`;
  }

  const prefixMap = {
    1: '',
    42: 'kovan.'
  };
  const prefix = prefixMap[chainId];
  const link = `https://${prefix}etherscan.io/address/${address}`;
  return link;
}

export function getPoolLink(pool: string, type: string): string {
  return `${process.env.VUE_APP_BASE_URL}#/liquidity/${type}/detail/${pool}`;
}

export function getStablePoolLink(pool, type): string {
  const combine = `${pool.poolTokens[0].address}_${pool.poolTokens[1].address}`;
  return `${process.env.VUE_APP_BASE_URL}#/liquidity/${type}/detail/${combine}/${pool.poolAddress}`;
}

export function getStablePoolLinkPreStaking(pool, type): string {
  const combine = `${pool.poolTokens[0].address}_${pool.poolTokens[1].address}`;
  return `${process.env.VUE_APP_BASE_URL}#/liquidity/${type}/detail/${combine}/${pool.lpAddress}`;
}

export function getAssetLogo(address: string): string {
  const defaultLogo = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
  return config.tokens[address] || config.tokens[address.toLowerCase()]
    ? config.tokens[address.toLowerCase()].logoURI ||
        config.tokens[address].logoURI
    : defaultLogo;
}

export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}
