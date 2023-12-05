import { MaxUint256 } from '@ethersproject/constants';
import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import BigNumber from 'bignumber.js';
import config from '@/config';
import abi from '@/helpers/abi';
import { getAddress } from '@ethersproject/address';
import { GAS_LIMIT_BUFFER } from '@/helpers/utils';
import { Interface } from '@ethersproject/abi';
import store from '@/store';

export default class BlockchainHelper {
  static async stake(
    provider,
    masterChefAddress,
    amount,
    pid,
    isSinglePool,
    abiInterface
  ) {
    const assetContract = new Contract(
      masterChefAddress,
      abiInterface,
      provider.getSigner()
    );
    const overrides = {
      gasLimit: 450000
    };
    const title = isSinglePool
      ? 'transactionTitles.stakingBuni'
      : 'transactionTitles.stakingLP';

    try {
      const tx = await assetContract.deposit(
        pid,
        new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
        overrides
      );

      tx.amount = amount;

      const receipt = await store.dispatch('transactions/handleTransaction', {
        transaction: tx,
        titleKey: title,
        titleParams: {
          amount
        }
      });

      return receipt.transactionHash;
    } catch (error) {
      console.error(
        `Action stake pid: ${pid} with amount: ${amount} has an error: ${error.toString()}`,
        JSON.stringify(error)
      );
      throw store.dispatch('transactions/handleTransactionError', error);
    }
  }

  static async stakePreStaking(provider, contractAddress, amount) {
    const assetContract = new Contract(
      contractAddress,
      abi['StakingReward'],
      provider.getSigner()
    );
    const overrides = {
      gasLimit: 450000
    };
    const title = 'transactionTitles.stakingLP';

    try {
      const tx = await assetContract.stake(
        new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
        overrides
      );

      tx.amount = amount;

      const receipt = await store.dispatch('transactions/handleTransaction', {
        transaction: tx,
        titleKey: title,
        titleParams: {
          amount
        }
      });

      return receipt.transactionHash;
    } catch (error) {
      console.error(
        `Action stakePreStaking ${contractAddress} with amount: ${amount} has an error: ${error.toString()}`,
        JSON.stringify(error)
      );
      throw store.dispatch('transactions/handleTransactionError', error);
    }
  }
  static async stakeSyrupFarm(provider, contractAddress, amount, isSinglePool) {
    const assetContract = new Contract(
      contractAddress,
      abi['BuniSyrupPool'],
      provider.getSigner()
    );
    console.log('stakeSyrupFarm contractAddress', contractAddress);
    const overrides = {
      gasLimit: 450000
    };
    const title = isSinglePool
      ? 'transactionTitles.stakingBuni'
      : 'transactionTitles.stakingLP';

    try {
      const tx = await assetContract.deposit(
        new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
        overrides
      );

      tx.amount = amount;

      const receipt = await store.dispatch('transactions/handleTransaction', {
        transaction: tx,
        titleKey: title,
        titleParams: {
          amount
        }
      });

      return receipt.transactionHash;
    } catch (error) {
      console.error(
        `Action stake SyrupFarm ${contractAddress} with amount: ${amount} has an error: ${error.toString()}`,
        JSON.stringify(error)
      );
      throw store.dispatch('transactions/handleTransactionError', error);
    }
  }
  static async setApprovalForAll(provider) {
    const vBuniContract = new Contract(
      config.addresses.vbuni,
      abi['VBuni'],
      provider.getSigner()
    );

    try {
      const tx = await vBuniContract.setApprovalForAll(
        config.addresses.masterChef,
        true
      );
      const receipt = await store.dispatch('transactions/handleTransaction', {
        transaction: tx,
        titleKey: 'transactionTitles.approveTx'
      });

      return receipt.transactionHash;
    } catch (error) {
      console.error(
        `Action setApprovalForAll has an error: ${error.toString()}`,
        JSON.stringify(error)
      );
      throw store.dispatch('transactions/handleTransactionError', error);
    }
  }

  static async redeemBuni(provider, masterChefAddress, tokenId) {
    const masterChefContract = new Contract(
      masterChefAddress,
      abi['MasterChef'],
      provider.getSigner()
    );
    const overrides = {
      gasLimit: 450000
    };
    const title = 'transactionTitles.redeemBuni';

    try {
      const tx = await masterChefContract.redeemBuni(tokenId, overrides);
      const receipt = await store.dispatch('transactions/handleTransaction', {
        transaction: tx,
        titleKey: title
      });

      return receipt.transactionHash;
    } catch (error) {
      console.error(
        `Action redeemBuni ${tokenId} has an error: ${error.toString()}`,
        JSON.stringify(error)
      );
      throw store.dispatch('transactions/handleTransactionError', error);
    }
  }

  static async redeemBuniNow(provider, masterChefAddress, tokenId) {
    const masterChefContract = new Contract(
      masterChefAddress,
      abi['MasterChef'],
      provider.getSigner()
    );
    const overrides = {
      gasLimit: 450000
    };
    const title = 'transactionTitles.redeemBuni';

    try {
      const tx = await masterChefContract.emergencyRedeemBuni(
        tokenId,
        overrides
      );
      const receipt = await store.dispatch('transactions/handleTransaction', {
        transaction: tx,
        titleKey: title
      });

      return receipt.transactionHash;
    } catch (error) {
      console.error(
        `Action redeemBuni ${tokenId} has an error: ${error.toString()}`,
        JSON.stringify(error)
      );
      throw store.dispatch('transactions/handleTransactionError', error);
    }
  }

  static async getTimeConfig(provider, masterChefAddress) {
    const assetContract = new Contract(
      masterChefAddress,
      abi['MasterChef'],
      provider.getSigner()
    );

    console.log('Getting time config', { masterChefAddress });

    return await assetContract.vestTimeLock();
  }
  static async getUserInfo(provider, masterChefAddress, poolId, address) {
    const assetContract = new Contract(
      masterChefAddress,
      abi['MasterChef'],
      provider.getSigner()
    );

    console.log('Getting user info', {
      masterChefAddress,
      poolId,
      address
    });

    return await assetContract.userInfo(poolId, address);
  }
  static async unstake(
    provider,
    masterChefAddress,
    amount,
    pid,
    isSinglePool,
    abiInterface
  ) {
    const assetContract = new Contract(
      masterChefAddress,
      abiInterface,
      provider.getSigner()
    );
    const overrides = {
      gasLimit: 450000
    };
    const title = isSinglePool
      ? 'transactionTitles.unstakingBuni'
      : 'transactionTitles.unstakingLP';

    try {
      const tx = await assetContract.withdraw(
        pid,
        new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
        overrides
      );

      tx.amount = amount;

      const receipt = await store.dispatch('transactions/handleTransaction', {
        transaction: tx,
        titleKey: title,
        titleParams: {
          amount
        }
      });

      return receipt.transactionHash;
    } catch (error) {
      throw store.dispatch('transactions/handleTransactionError', error);
    }
  }

  static async unstakePreStaking(provider, contractAddress, amount) {
    const assetContract = new Contract(
      contractAddress,
      abi['StakingReward'],
      provider.getSigner()
    );
    const overrides = {
      gasLimit: 450000
    };
    const title = 'transactionTitles.unstakingLP';

    try {
      const tx = await assetContract.withdraw(
        new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
        overrides
      );

      tx.amount = amount;

      const receipt = await store.dispatch('transactions/handleTransaction', {
        transaction: tx,
        titleKey: title,
        titleParams: {
          amount
        }
      });

      return receipt.transactionHash;
    } catch (error) {
      throw store.dispatch('transactions/handleTransactionError', error);
    }
  }
  static async unstakeSyrupFarm(provider, contractAddress, amount, isSinglePool) {
    const assetContract = new Contract(
      contractAddress,
      abi['BuniSyrupPool'],
      provider.getSigner()
    );
    const overrides = {
      gasLimit: 450000
    };
    const title = isSinglePool
      ? 'transactionTitles.unstakingBuni'
      : 'transactionTitles.unstakingLP';

    try {
      const tx = await assetContract.withdraw(
        new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
        overrides
      );

      tx.amount = amount;

      const receipt = await store.dispatch('transactions/handleTransaction', {
        transaction: tx,
        titleKey: title,
        titleParams: {
          amount
        }
      });

      return receipt.transactionHash;
    } catch (error) {
      throw store.dispatch('transactions/handleTransactionError', error);
    }
  }

  static async harvest(provider, masterChefAddress, pid, harvestType) {
    return await BlockchainHelper.harvestNFT(provider, masterChefAddress, pid);
  }

  static async harvestNFT(provider, masterChefAddress, pid) {
    const assetContract = new Contract(
      masterChefAddress,
      abi['MasterChef'],
      provider.getSigner()
    );
    const overrides = {
      gasLimit: 450000
    };
    const title = 'transactionTitles.harvesting';

    console.log('Harvest', {
      masterChefAddress,
      pid
    });

    try {
      const tx = await assetContract.harvest(pid, overrides);
      const receipt = await store.dispatch('transactions/handleTransaction', {
        transaction: tx,
        titleKey: title
      });

      return receipt.transactionHash;
    } catch (error) {
      console.error(
        `Action harvest pid: ${pid} has an error: ${error.toString()}`,
        JSON.stringify(error)
      );
      throw store.dispatch('transactions/handleTransactionError', error);
    }
  }

  static async harvestBuni(provider, masterChefAddress, pid) {
    const assetContract = new Contract(
      masterChefAddress,
      abi['MasterChef'],
      provider.getSigner()
    );
    const overrides = {
      gasLimit: 450000
    };
    const title = 'transactionTitles.harvesting';

    console.log('Harvest', {
      masterChefAddress,
      pid
    });

    try {
      const tx = await assetContract.emergencyHarvest(pid, 0, overrides);
      const receipt = await store.dispatch('transactions/handleTransaction', {
        transaction: tx,
        titleKey: title
      });

      return receipt.transactionHash;
    } catch (error) {
      console.error(
        `Action emergencyHarvest pid: ${pid} has an error: ${error.toString()}`,
        JSON.stringify(error)
      );
      throw store.dispatch('transactions/handleTransactionError', error);
    }
  }

  static async harvestPreStaking(provider, contractAddress) {
    const assetContract = new Contract(
      contractAddress,
      abi['StakingReward'],
      provider.getSigner()
    );
    const overrides = {
      gasLimit: 450000
    };
    const title = 'transactionTitles.harvesting';

    try {
      const tx = await assetContract.getReward(overrides);
      const receipt = await store.dispatch('transactions/handleTransaction', {
        transaction: tx,
        titleKey: title
      });

      return receipt.transactionHash;
    } catch (error) {
      console.error(
        `Action harvestPreStaking ${contractAddress} has an error: ${error.toString()}`,
        JSON.stringify(error)
      );
      throw store.dispatch('transactions/handleTransactionError', error);
    }
  }

  static async wrap(provider: Web3Provider, amount: BigNumber): Promise<any> {
    const wethAddress = config.addresses.weth;
    const wethContract = new Contract(
      wethAddress,
      abi['Weth'],
      provider.getSigner()
    );
    const overrides = {
      value: `0x${amount.toString(16)}`
    };

    console.log('Wrap', {
      amount: amount.toString(),
      wethAddress
    });

    try {
      return await wethContract.deposit(overrides);
    } catch (e) {
      return store.dispatch('transactions/handleTransactionError', e);
    }
  }

  static async unwrap(provider: Web3Provider, amount: BigNumber): Promise<any> {
    const wethAddress = config.addresses.weth;
    const withdrawalAmount = amount.toString();
    const wethContract = new Contract(
      wethAddress,
      abi['Weth'],
      provider.getSigner()
    );

    console.log('Unwrap', {
      wethAddress,
      withdrawalAmount
    });

    try {
      return await wethContract.withdraw(withdrawalAmount, {});
    } catch (e) {
      return store.dispatch('transactions/handleTransactionError', e);
    }
  }

  static async getGasPrice(provider: Web3Provider): Promise<any> {
    const gasPrice = await provider.getGasPrice();
    return gasPrice.toString();
  }

  static async sendTransaction(
    web3,
    [contractType, contractAddress, action, params, overrides]: any
  ) {
    const signer = web3.getSigner();
    const contract = new Contract(
      getAddress(contractAddress),
      abi[contractType],
      web3
    );
    const contractWithSigner = contract.connect(signer);
    try {
      // Gas estimation
      const gasLimitNumber = await contractWithSigner.estimateGas[action](
        ...params,
        overrides
      );
      const gasLimit = gasLimitNumber.toNumber();
      overrides.gasLimit = Math.floor(gasLimit * (1 + GAS_LIMIT_BUFFER));
      return await contractWithSigner[action](...params, overrides);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  static makeProxyTransaction(
    dsProxy,
    [contractType, contractAddress, action, params, overrides]: any
  ) {
    const iface = new Interface(abi[contractType]);
    const data = iface.encodeFunctionData(action, params);
    return ['DSProxy', dsProxy, 'execute', [contractAddress, data], overrides];
  }

  static async estimateGas(
    contract: Contract,
    action: string,
    params: any[]
  ): Promise<number> {
    const gasLimitNumber = await contract.estimateGas[action](...params);
    return gasLimitNumber.toNumber();
  }
  static async stakeNFT(
    provider,
    masterChefAddress,
    abiInterface,
    from,
    to,
    tokenId
  ) {
    const assetContract = new Contract(
      masterChefAddress,
      abiInterface,
      provider
    );
    try {
      const tx = await assetContract
        .connect(provider.getSigner())
        ['safeTransferFrom(address,address,uint256)'](from, to, tokenId);
      const title = 'transactionTitles.stakingNFT';
      const receipt = await store.dispatch('transactions/handleTransaction', {
        transaction: tx,
        titleKey: title
      });

      return receipt.transactionHash;
    } catch (error) {
      console.error(
        `Action stake NFT: ${tokenId} has an error: ${error.toString()}`,
        JSON.stringify(error)
      );
      throw store.dispatch('transactions/handleTransactionError', error);
    }
  }
  static async harvestBuniBounty(provider, masterChefAddress) {
    const assetContract = new Contract(
      masterChefAddress,
      abi['BuniBounty'],
      provider.getSigner()
    );
    const overrides = {
      gasLimit: 450000
    };
    const title = 'transactionTitles.harvesting';

    try {
      const tx = await assetContract.getReward(overrides);
      const receipt = await store.dispatch('transactions/handleTransaction', {
        transaction: tx,
        titleKey: title
      });

      return receipt.transactionHash;
    } catch (error) {
      console.error(
        `Action harvest has an error: ${error.toString()}`,
        JSON.stringify(error)
      );
      throw store.dispatch('transactions/handleTransactionError', error);
    }
  }
  static async harvestVBuniNFTFarm(provider, masterChefAddress) {
    const assetContract = new Contract(
      masterChefAddress,
      abi['VBuniNFTFarm'],
      provider.getSigner()
    );
    const overrides = {
      gasLimit: 450000
    };
    const title = 'transactionTitles.harvesting';

    try {
      const tx = await assetContract.getReward(overrides);
      const receipt = await store.dispatch('transactions/handleTransaction', {
        transaction: tx,
        titleKey: title
      });

      return receipt.transactionHash;
    } catch (error) {
      console.error(
        `Action harvest has an error: ${error.toString()}`,
        JSON.stringify(error)
      );
      throw store.dispatch('transactions/handleTransactionError', error);
    }
  }
  static async harvestVBuniNFTFarmNew(provider, masterChefAddress) {
    const assetContract = new Contract(
      masterChefAddress,
      abi['VBuniNFTFarmNew'],
      provider.getSigner()
    );
    const overrides = {
      gasLimit: 450000
    };
    const title = 'transactionTitles.harvesting';

    try {
      const tx = await assetContract.getReward(overrides);
      const receipt = await store.dispatch('transactions/handleTransaction', {
        transaction: tx,
        titleKey: title
      });

      return receipt.transactionHash;
    } catch (error) {
      console.error(
        `Action harvest has an error: ${error.toString()}`,
        JSON.stringify(error)
      );
      throw store.dispatch('transactions/handleTransactionError', error);
    }
  }
  static async unstakeNFT(provider, contractAddress, tokenIndex) {
    const assetContract = new Contract(
      contractAddress,
      abi['VBuniNFTFarm'],
      provider.getSigner()
    );
    const overrides = {
      gasLimit: 450000
    };
    const title = 'transactionTitles.unstakingNFT';
    console.log('assetContract', assetContract);
    try {
      const tx = await assetContract.unstakeNft(tokenIndex, overrides);

      const receipt = await store.dispatch('transactions/handleTransaction', {
        transaction: tx,
        titleKey: title
      });

      return receipt.transactionHash;
    } catch (error) {
      throw store.dispatch('transactions/handleTransactionError', error);
    }
  }
}
