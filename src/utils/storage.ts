import config, { AssetMetadata } from '@/config';
import { SUPPORTED_LIST, DEFAULT_LIST } from '@/utils/list';

const prefixKey = `${config.network}-${process.env.VUE_APP_ENV}`;
let suffix;
if (process.env.VUE_APP_VERSION_DEPLOY) {
  suffix = process.env.VUE_APP_VERSION_DEPLOY;
}

const PREFERENCES = `${prefixKey}-preferences-bsc-updated-${suffix}`;
const TRANSACTIONS = `${prefixKey}-transactions-bsc-updated-${suffix}`;
const ASSETS = `${prefixKey}-assets-bsc-updated-${suffix}`;

export enum VestingMode {
  NFT = 'NFT',
  BUNI = 'BUNI'
}
interface Preferences {
  connector: string | null;
  slippage: number;
  deadline: number;
  pairs: Record<number, Pair>;
  kurvePairs: Record<number, Pair>;
  list: string;
  modeTheme: string;
  language: string;
  vestingMode: VestingMode;
}

interface Pair {
  inputAsset: string;
  outputAsset: string;
}

function getPreferences(): Preferences {
  const defaultPreferences: Preferences = {
    connector: null,
    slippage: 0.005,
    deadline: 20,
    pairs: {
      [config.chainId]: config.kalancer.pair
    },
    kurvePairs: {
      [config.chainId]: config.kurve.pair
    },
    list: 'buni',
    modeTheme: 'dark',
    language: 'en-US',
    vestingMode: VestingMode.NFT
  };
  const preferenceString = localStorage.getItem(PREFERENCES);
  const preferences = JSON.parse(preferenceString || '{}');
  return {
    ...defaultPreferences,
    ...preferences
  };
}

type Transactions = Record<string, Record<number, Record<string, any>>>;
type Assets = Record<number, Record<string, AssetMetadata>>;

export default class Storage {
  static getConnector(): string | null {
    const preferences = getPreferences();
    return preferences.connector;
  }

  static getSlippage(): number {
    const preferences = getPreferences();
    return preferences.slippage;
  }

  static getDeadline(): number {
    const preferences = getPreferences();
    return preferences.deadline;
  }

  static getPair(chainId: number): Pair {
    const preferences = getPreferences();
    return preferences.pairs[chainId];
  }

  static getKurvePair(chainId: number): Pair {
    const preferences = getPreferences();
    return preferences.kurvePairs[chainId];
  }

  static getList(): string {
    const preferences = getPreferences();
    const list = preferences.list;
    if (!SUPPORTED_LIST.includes(list)) {
      return DEFAULT_LIST;
    }
    return list;
  }

  static getLanguage(): string {
    const preferences = getPreferences();
    return preferences.language;
  }

  static getTransactions(
    account: string,
    chainId: number
  ): Record<string, any> {
    const transactionString = localStorage.getItem(TRANSACTIONS);
    const transactions: Transactions = transactionString
      ? JSON.parse(transactionString)
      : {};
    if (
      !transactions ||
      !transactions[account] ||
      !transactions[account][chainId]
    ) {
      return {};
    }
    return transactions[account][chainId];
  }

  static getAssets(chainId: number): Record<string, AssetMetadata> {
    const assetString = localStorage.getItem(ASSETS);
    const assets: Assets = assetString ? JSON.parse(assetString) : {};
    if (!assets[chainId]) {
      return {};
    }
    return assets[chainId];
  }

  static getModeTheme(): string {
    const preferences = getPreferences();
    return preferences.modeTheme;
  }
  static getVestingMode(): VestingMode {
    const preferences = getPreferences();
    return preferences.vestingMode;
  }

  static saveConnector(connector: string): void {
    const preferences = getPreferences();
    preferences.connector = connector;
    localStorage.setItem(PREFERENCES, JSON.stringify(preferences));
  }

  static saveSlippage(slippage: number): void {
    const preferences = getPreferences();
    preferences.slippage = slippage;
    localStorage.setItem(PREFERENCES, JSON.stringify(preferences));
  }

  static saveDeadline(deadline: number): void {
    const preferences = getPreferences();
    preferences.deadline = deadline;
    localStorage.setItem(PREFERENCES, JSON.stringify(preferences));
  }

  static saveInputAsset(chainId: number, asset: string): void {
    const preferences = getPreferences();
    preferences.pairs[chainId].inputAsset = asset;
    localStorage.setItem(PREFERENCES, JSON.stringify(preferences));
  }

  static saveOutputAsset(chainId: number, asset: string): void {
    const preferences = getPreferences();
    preferences.pairs[chainId].outputAsset = asset;
    localStorage.setItem(PREFERENCES, JSON.stringify(preferences));
  }

  static saveList(list: string): void {
    const preferences = getPreferences();
    preferences.list = list;
    localStorage.setItem(PREFERENCES, JSON.stringify(preferences));
  }

  static saveTransaction(
    account: string,
    chainId: number,
    transaction: any
  ): void {
    const transactionString = localStorage.getItem(TRANSACTIONS);
    const transactions: Transactions = transactionString
      ? JSON.parse(transactionString)
      : {};
    if (!transactions[account]) {
      transactions[account] = {};
    }
    if (!transactions[account][chainId]) {
      transactions[account][chainId] = {};
    }
    transactions[account][chainId][transaction.hash] = transaction;
    localStorage.setItem(TRANSACTIONS, JSON.stringify(transactions));
  }

  static saveAssets(
    chainId: number,
    assets: Record<string, AssetMetadata>
  ): void {
    const assetString = localStorage.getItem(ASSETS);
    const assetList: Assets = assetString ? JSON.parse(assetString) : {};
    if (!assetList[chainId]) {
      assetList[chainId] = {};
    }
    for (const address in assets) {
      assetList[chainId][address] = assets[address];
    }
    localStorage.setItem(ASSETS, JSON.stringify(assetList));
  }

  static setModeTheme(theme) {
    const preferences = getPreferences();
    preferences.modeTheme = theme;
    localStorage.setItem(PREFERENCES, JSON.stringify(preferences));
  }
  static setVestingMode(vestingMode) {
    const preferences = getPreferences();
    preferences.vestingMode = vestingMode;
    localStorage.setItem(PREFERENCES, JSON.stringify(preferences));
  }

  static saveLanguage(language: string): void {
    const preferences = getPreferences();
    preferences.language = language;
    localStorage.setItem(PREFERENCES, JSON.stringify(preferences));
  }

  static clearConnector(): void {
    const preferences = getPreferences();
    preferences.connector = null;
    localStorage.setItem(PREFERENCES, JSON.stringify(preferences));
  }

  static clearTransactions(address = '', chainId: string | number = ''): void {
    const transactionString = localStorage.getItem(TRANSACTIONS);
    const transactions: Transactions = transactionString
      ? JSON.parse(transactionString)
      : {};

    if (address && chainId) {
      delete transactions[address][chainId];
      localStorage.setItem(TRANSACTIONS, JSON.stringify(transactions));
    }

    if (address) {
      delete transactions[address];
      return localStorage.setItem(TRANSACTIONS, JSON.stringify(transactions));
    }

    return localStorage.removeItem(TRANSACTIONS);
  }

  static clearAssets(): void {
    localStorage.removeItem(ASSETS);
  }
}
