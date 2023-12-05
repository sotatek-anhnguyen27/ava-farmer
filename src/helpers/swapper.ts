import BigNumber from 'bignumber.js';
import BlockchainHelper from '../helpers/BlockchainHelper';
import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import abi from '@/helpers/abi';
import config from '@/config';
import { BNB_KEY } from '@/utils/helpers';
import store from '@/store';
import Vue from 'vue';

const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const exchangeProxyAddress = config.kalancer.addresses.exchangeProxy;

export default class Swapper {
  static async swapIn(
    provider: Web3Provider,
    assetInAddress: string,
    assetOutAddress: string,
    assetInAmount: BigNumber,
    assetOutAmountMin: BigNumber
  ): Promise<any> {
    const overrides: any = {};
    if (assetInAddress === BNB_KEY) {
      assetInAddress = ETH_ADDRESS;
      overrides.value = `0x${assetInAmount.toString(16)}`;
    }
    if (assetOutAddress === BNB_KEY) {
      assetOutAddress = ETH_ADDRESS;
    }
    const exchangeProxyContract = new Contract(
      exchangeProxyAddress,
      abi['ExchangeProxy'],
      provider.getSigner()
    );
    const params = [
      assetInAddress,
      assetOutAddress,
      assetInAmount.toString(),
      assetOutAmountMin.toString(),
      overrides
    ];

    console.log('Swap in before getting gas', JSON.stringify(params));
    try {
      const gasLimit = await BlockchainHelper.estimateGas(
        exchangeProxyContract,
        'multihopBatchSwapExactIn',
        params
      );
      overrides.gasLimit = new BigNumber(gasLimit)
        .times(1.25)
        .integerValue(BigNumber.ROUND_CEIL)
        .toNumber();

      console.log('Swap in gas limit', overrides.gasLimit);
      // Vue.prototype.$mixpanel.track('swapIn', { params, overrides });

      return await exchangeProxyContract.multihopBatchSwapExactIn(
        assetInAddress,
        assetOutAddress,
        assetInAmount.toString(),
        assetOutAmountMin.toString(),
        overrides
      );
    } catch (e) {
      store.dispatch('notify', [
        'error',
        {
          text: `multihopBatchSwapExactIn error:` + e.message,
          type: 'error'
        }
      ]);
      console.error(e);
      return store.dispatch('transactions/handleTransactionError', e);
    }
  }

  static async swapOut(
    provider: Web3Provider,
    assetInAddress: string,
    assetOutAddress: string,
    assetInAmountMax: BigNumber
  ): Promise<any> {
    const overrides: any = {};
    if (assetInAddress === BNB_KEY) {
      assetInAddress = ETH_ADDRESS;
      overrides.value = `0x${assetInAmountMax.toString(16)}`;
    }
    if (assetOutAddress === BNB_KEY) {
      assetOutAddress = ETH_ADDRESS;
    }
    const exchangeProxyContract = new Contract(
      exchangeProxyAddress,
      abi['ExchangeProxy'],
      provider.getSigner()
    );
    const params = [
      assetInAddress,
      assetOutAddress,
      assetInAmountMax.toString(),
      overrides
    ];

    console.log('Swap out before getting gas', JSON.stringify(params));

    try {
      const gasLimit = await BlockchainHelper.estimateGas(
        exchangeProxyContract,
        'multihopBatchSwapExactOut',
        params
      );

      overrides.gasLimit = new BigNumber(gasLimit)
        .times(1.25)
        .integerValue(BigNumber.ROUND_CEIL)
        .toNumber();

      // Vue.prototype.$mixpanel.track('swapOut', { params, overrides });

      console.log('Swap out gas limit', overrides.gasLimit);

      return await exchangeProxyContract.multihopBatchSwapExactOut(
        assetInAddress,
        assetOutAddress,
        assetInAmountMax.toString(),
        overrides
      );
    } catch (e) {
      console.error(e);
      return store.dispatch('transactions/handleTransactionError', e);
    }
  }
}
