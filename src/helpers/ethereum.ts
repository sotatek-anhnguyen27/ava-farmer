import { Contract, Provider } from '@/libs/ethcall';
import { AddressZero } from '@ethersproject/constants';
import abi from '@/helpers/abi';
import config, { AssetMetadata } from '@/config';
import { BNB_KEY, getAssetLogo } from '@/utils/helpers';
import provider from '@/helpers/provider';

export type Allowances = Record<string, Record<string, string>>;

export type Balances = Record<string, string>;

export interface AccountState {
  allowances: Allowances;
  balances: Balances;
  proxy: string;
}

export default class Ethereum {
  static async fetchAccountState(
    address: string,
    assets: string[]
  ): Promise<AccountState> {
    assets = assets.filter(asset => asset !== BNB_KEY);
    const ethcallProvider = new Provider();
    await ethcallProvider.init(provider);
    const calls = [];
    // Fetch balances and allowances
    const exchangeProxyAddress = config.kalancer.addresses.exchangeProxy;
    for (const assetAddress of assets) {
      const assetContract = new Contract(assetAddress, abi['ERC20']);
      const balanceCall = assetContract.balanceOf(address);
      const allowanceCall = assetContract.allowance(
        address,
        exchangeProxyAddress
      );
      // @ts-ignore
      calls.push(balanceCall);
      // @ts-ignore
      calls.push(allowanceCall);
    }
    // Fetch bnb balance
    const ethBalanceCall = ethcallProvider.getEthBalance(address);
    // @ts-ignore
    calls.push(ethBalanceCall);
    // Fetch proxy
    const dsProxyRegistryAddress = config.kalancer.addresses.dsProxyRegistry;
    const dsProxyRegistryContract = new Contract(
      dsProxyRegistryAddress,
      abi['DSProxyRegistry']
    );
    const proxyCall = dsProxyRegistryContract.proxies(address); // TBC
    // @ts-ignore
    calls.push(proxyCall);
    // Fetch data
    // @ts-ignore
    const data = await ethcallProvider.all(calls);
    const assetCount = assets.length;
    const allowances = {};
    allowances[exchangeProxyAddress] = {};
    const balances: Record<string, string> = {};
    let i = 0;
    for (const assetAddress of assets) {
      balances[assetAddress] = data[2 * i].toString();
      allowances[exchangeProxyAddress][assetAddress] = data[
        2 * i + 1
      ].toString();
      i++;
    }
    balances[BNB_KEY] = data[2 * assetCount].toString();
    const proxy =
      data[2 * assetCount + 1] === AddressZero ? '' : data[2 * assetCount + 1];
    return { allowances, balances, proxy };
  }

  static async fetchAssetMetadata(
    assets: string[]
  ): Promise<Record<string, AssetMetadata>> {
    const ethcallProvider = new Provider();
    await ethcallProvider.init(provider);
    const calls = [];
    // Fetch asset metadata
    for (const assetAddress of assets) {
      const assetContract = new Contract(assetAddress, abi['ERC20']);
      const nameCall = assetContract.name();
      const symbolCall = assetContract.symbol();
      const decimalCall = assetContract.decimals();
      // @ts-ignore
      calls.push(nameCall);
      // @ts-ignore
      calls.push(symbolCall);
      // @ts-ignore
      calls.push(decimalCall);
    }
    // Fetch data
    // @ts-ignore
    const data = await ethcallProvider.all(calls);
    const metadata: Record<string, AssetMetadata> = {};
    for (let i = 0; i < assets.length; i++) {
      const assetAddress = assets[i];
      const name = data[3 * i];
      const symbol = data[3 * i + 1];
      const decimals = data[3 * i + 2];
      metadata[assetAddress] = {
        address: assetAddress,
        name,
        symbol,
        decimals,
        logoURI: getAssetLogo(assetAddress)
      };
    }
    return metadata;
  }
}
