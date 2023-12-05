import merge from 'lodash/merge';

import homestead from '@/config/homestead/homestead.json';
import homesteadSyrupFarms from '@/config/homestead/hero_arena_farms.json';

const configs = { production: homestead };

configs.production = merge(
  {
    syrupFarms: homesteadSyrupFarms
  },
  configs.production
);

const env = process.env.VUE_APP_ENV || 'production';
console.log('loading env', env);
const config: Config = configs[env];

export interface Config {
  env: string;
  network: string;
  chainId: number;
  defaultPrecision: number;
  rpcUrl: string[];
  infuraKey: string[];
  wsUrl: string[];
  explorerName: string;
  gameNftFarm: number[];
  kryptoMonsterFarm: number[];
  explorer: string;
  exchangeUrl: string;
  unlockInGameUrl: string;
  helpUrl: string;
  buniPrice: number;
  buniPerBlock: number;
  buniPerBlock2: number;
  blockTime: number;
  addresses: {
    weth: string;
    multicall: string;
    masterChef: string;
    masterChef2: string;
    tokenMasterChef: string;
    vbuni: string;
    buniFarm: string;
    burFarm: string;
    buni: string;
    bur: string;
    preStakingFactory: string;
    mysteryBox: string;
    bounty_nft: string;
    vBuniNFTFarm: string;
    vBuniNFTFarmNew: string;
    buniBountyFarm: string;
    governance: string;
    gameContract: string;
    trainerContract: string;
    bunicornContract: string;
    trainersV2StakingFarm: string;
    bunicornsV2StakingFarm: string;
    trainersV2StakingFarm2: string;
    bunicornsV2StakingFarm2: string;
  };
  applyCorrectBunicornImageFromID: number;
  applyUpdateBunicornV2FromID: number;
  applyUpdateBunicornV3FromID: number;
  applyUpdateBunicornV4FromID: number;
  api: {
    voteApi: string;
  };
  reserveCurrencies: string[];
  systemCoin: {
    symbol: string;
    name: string;
    wrap: string;
    logo: string;
  };
  kalancer: KalancerConfig;
  kurve: KurveConfig;
  connectors: ConnectorConfig;
  tokens: Record<string, Token>;
  farms: FarmConfig[];
  tokenFarms: TokenFarmConfig[];
  syrupFarms: TokenFarmConfig[];
  prestaking: PreStakingConfig[];
  nftMetadataDebugUrl: string;
}

export interface FarmConfig {
  pid: string;
  lpAddresses: string;
  poolAddress: string;
  poolType: string;
}

export interface TokenFarmConfig {
  pid: string;
  lpAddresses: string;
  poolAddress: string;
  stakeType: string;
  lpSymbol: string;
  poolTokens: PoolTokenConfig[];
}

export interface PoolTokenConfig {
  contractAddress: string;
  color: string;
  decimals: number;
  denormWeight: number;
  symbol: string;
  weightPercent: number;
}

export interface PreStakingConfig {
  pid: string;
  preStakingAddress: string;
  lpAddress: string;
  poolType: string;
}

export interface KalancerConfig {
  subgraphBackupUrl: string;
  subgraphUrl: string;
  addresses: {
    bFactory: string;
    bActions: string;
    exchangeProxy: string;
    dsProxyRegistry: string;
    proxy: string;
    crpFactory: string;
    poolInfoMulticall: string;
  };
  pair: {
    inputAsset: string;
    outputAsset: string;
  };
}
export interface KurveConfig {
  subgraphUrl: string;
  blockSubGraphUrl: string;
  addresses: {
    factory: string;
    routerV2: string;
  };
  pair: {
    inputAsset: string;
    outputAsset: string;
  };
  whitelistTokens: string[];
  whitelistPairs: string[];
}

export interface ConnectorConfig {
  injected: ConnectorMetadata;
  walletconnect: ConnectorMetadata;
  portis: ConnectorMetadata;
  walletlink: ConnectorMetadata;
  fortmatic: ConnectorMetadata;
  bsc: ConnectorMetadata;
}

export interface Token {
  address: string;
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  precision: number;
  color: string;
  chainId: number;
  hasIcon: boolean;
  logoURI: string;
  forKurve?: boolean;
}

export interface ConnectorMetadata {
  id: string;
  name: string;
  options: any;
}

export interface AssetMetadata {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string | undefined;
  forKurve?: boolean;
}

interface Connector {
  id: string;
  name: string;
  options: any;
}

export default config;
