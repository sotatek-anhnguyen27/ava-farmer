import config, { AssetMetadata } from '@/config';
import { BNB_KEY, getAssetLogo } from '@/utils/helpers';

export interface TokenList {
  name: string;
  logoURI?: string;
  tokens: Token[];
}

interface Token {
  address: string;
  chainId: number;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
}

export const DEFAULT_LIST = 'buni';

export const SUPPORTED_LIST = [
  '1inch',
  'coingecko',
  'compound',
  'zapper',
  'zerion'
];

export const listMetadata: Record<string, string> = {
  [DEFAULT_LIST]: '',
  '1inch': 'http://tokens.1inch.eth.link',
  coingecko: 'https://tokens.coingecko.com/uniswap/all.json',
  compound:
    'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
  zapper: 'https://zapper.fi/api/token-list',
  zerion: 'http://tokenlist.zerion.eth.link'
};

export async function getTokenlist(id: string): Promise<TokenList> {
  if (id === DEFAULT_LIST || !SUPPORTED_LIST.includes(id)) {
    return {
      name: DEFAULT_LIST,
      tokens: Object.values(config.tokens)
    };
  }
  const listUrl = listMetadata[id];
  const response = await fetch(listUrl);
  const json = await response.json();
  return json;
}

export function getAssetsFromTokenlist(
  chainId: number,
  list: TokenList
): Record<string, AssetMetadata> {
  const assets: Record<string, AssetMetadata> = {};
  if (
    list.tokens.findIndex(token => token.address === config.systemCoin.name) ===
    -1
  ) {
    assets[BNB_KEY] = {
      address: BNB_KEY,
      name: config.systemCoin.name,
      symbol: config.systemCoin.symbol,
      decimals: 18,
      logoURI: config.systemCoin.logo
    };
  }
  for (const token of list.tokens) {
    if (token.chainId !== chainId) {
      continue;
    }
    const forKurveIndex = config.kurve.whitelistTokens.findIndex(
      whitelist => token.address.toLowerCase() === whitelist.toLowerCase()
    );
    assets[token.address] = {
      address: token.address,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      logoURI: token.logoURI,
      forKurve: forKurveIndex !== -1
    };
  }
  return assets;
}
