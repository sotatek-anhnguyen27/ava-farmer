<template>
  <Page>
    <Container>
      <Title
        :title="$t('heroArenaFarms')"
        :tvl="$store.state.summaries.totalLiquidity"
      />
      <FilterActions
        @switchTab="switchTab"
        @stakedToggle="onStakeChange"
        @sort="onSort"
        v-on:inputSearch="onInputSearch"
      />
    </Container>
    <FarmTable
      :farmType="farmType"
      :isStaked="isStaked"
      :isSortedBy="isSortedBy"
      :query="query"
      :farmData="syrupFarms"
      :isInit="isInit"
    />
  </Page>
</template>

<script>
import FilterActions from '@/components/Farms/HeroArena/FilterActions';
import FarmTable from '@/components/Farms/HeroArena/FarmTable';
import { getBalanceNumber } from '@/helpers/farm';
import BigNumber from 'bignumber.js';
import config from '@/config';
import { multicall } from '@/_balancer/utils';
import provider from '@/helpers/provider';
import abi from '@/helpers/abi';
import Vue from 'vue';
import { getTokenPriceOnChain } from '@/helpers/price';
import { Contract } from '@ethersproject/contracts';
import { mapActions } from 'vuex';

const BLOCK_TIME = config.blockTime;
export const BLOCKS_PER_YEAR = new BigNumber((60 / BLOCK_TIME) * 60 * 24 * 365); // 10512000
const farmConfig = config.syrupFarms;
export default {
  metaInfo: { title: 'Farms' },
  data() {
    return {
      farmType: 'live',
      isStaked: false,
      isSortedBy: '',
      query: '',
      syrupFarms: [],
      isInit: false,
      buniPriceUsd: 0
    };
  },
  components: {
    FilterActions,
    FarmTable
  },
  async mounted() {
    await this.$store.dispatch('initPrices');
    try {
      this.syrupFarms = await this.getFarmData();
    } catch (e) {
      console.error(e);
    }
    this.isInit = true;

    if (this.myAccount) {
      this.getFarmUserData();
      this.getSyrupFarmAllowances();
    }

    this.$root.$on('UPDATE_TOKEN_FARM_DATA', async () => {
      await this.updateTokenFarmData();
    });
    this.$root.$on('UPDATE_TOKEN_FARM_USER_DATA', () => {
      this.getFarmUserData();
    });
    this.$root.$on('UPDATE_TOKEN_FARM_USER_ALLOWANCES', () => {
      this.getSyrupFarmAllowances();
    });
  },
  beforeDestroy() {
    this.$root.$off('UPDATE_TOKEN_FARM_DATA');
    this.$root.$off('UPDATE_TOKEN_FARM_USER_DATA');
  },
  watch: {
    myAccount() {
      this.getSyrupFarmAllowances();
      this.getFarmUserData();
    }
  },
  computed: {
    myAccount() {
      return this.$store.state.account.address;
    },
    totalMyLiquidity() {
      if (!this.syrupFarms) {
        return 0;
      }
      const farmsStaked = this.syrupFarms;

      let totalMyLiquidity = new BigNumber(0);
      farmsStaked.map(farm => {
        const myAddress = this.$store.state.account.address;

        if (!this.wrongNetwork && farm.userData && myAddress) {
          const stakedBalance = getBalanceNumber(
            new BigNumber(farm.userData.stakedBalance)
          );
          const lpPrice = farm.lpPriceUsd;
          const myLiquidity = new BigNumber(stakedBalance)
            .times(lpPrice)
            .toString();
          totalMyLiquidity = new BigNumber(totalMyLiquidity).plus(myLiquidity);
        }
      });
      if (totalMyLiquidity < 1e-4) return '< 0.0001';
      return totalMyLiquidity.toString();
    }
  },
  methods: {
    ...mapActions('account', ['getSyrupFarmAllowances']),
    async updateTokenFarmData() {
      const data = (await this.getFarmData()) || [];
      data.forEach((record, index) => {
        Vue.set(this.syrupFarms, index, {
          ...record,
          userData: this.syrupFarms[index].userData
        });
      });
    },
    switchTab(value) {
      this.farmType = value;
    },
    onStakeChange(isStaked) {
      this.isStaked = isStaked;
    },
    onSort(value) {
      this.isSortedBy = value;
    },
    onInputSearch(value) {
      this.query = value;
    },
    async getTokenPrice(contractAddress) {
      const prices = this.$store.getters.prices;
      let tokenPrice =
        prices[contractAddress] || prices[contractAddress.toLowerCase()] || 0;
      if (new BigNumber(tokenPrice).isZero()) {
        tokenPrice = await getTokenPriceOnChain(contractAddress.toLowerCase());
      }

      return tokenPrice;
    },
    async getStakeUnitPriceUsd(farmConfig) {
      if (farmConfig.stakeType === 'token') {
        return await this.getTokenPrice(
          farmConfig.poolTokens[0].contractAddress
        );
      }

      const calls = [];
      farmConfig.poolTokens.forEach(poolToken => {
        calls.push({
          address: poolToken.contractAddress,
          name: 'balanceOf',
          params: [farmConfig.lpAddresses]
        });
      });

      const prices = {};
      for (let index = 0; index < farmConfig.poolTokens.length; index++) {
        prices[
          farmConfig.poolTokens[index].contractAddress
        ] = await this.getTokenPrice(
          farmConfig.poolTokens[index].contractAddress
        );
      }

      const result = await multicall(provider, abi['LPErc20'], calls);
      const totalLiq = result
        .reduce((total, tokenAmount, index) => {
          const unitPrice =
            prices[farmConfig.poolTokens[index].contractAddress];

          const totalToken = new BigNumber(unitPrice)
            .times(tokenAmount.toString())
            .div(1e18);

          total = new BigNumber(total).plus(totalToken);

          return total;
        }, new BigNumber(0))
        .toString();

      let [totalSupply] = await multicall(provider, abi['LPErc20'], [
        {
          address: farmConfig.lpAddresses,
          name: 'totalSupply'
        }
      ]);

      totalSupply = new BigNumber(totalSupply.toString()).div(1e18);
      return new BigNumber(totalLiq).div(totalSupply).toString();
    },
    async getStakeFreeRate(poolAddress) {
      const masterChefContract = new Contract(
        poolAddress,
        abi['BuniSyrupPool'],
        provider
      );
      const tax = await masterChefContract.depositFeeRate();
      console.log('TAX', tax);
      return new BigNumber(tax._hex).div(1000).toNumber();
    },
    async getFarmData() {
      const data = await Promise.all(
        farmConfig.map(async farmConfig => {
          // const [liquidity] = await multicall(provider, abi['ERC20'], [
          //   {
          //     address: farmConfig.lpAddresses,
          //     name: 'balanceOf',
          //     params: [farmConfig.poolAddress]
          //   }
          // ]);
          const masterChefContract = new Contract(
            farmConfig.poolAddress,
            abi['BuniSyrupPool'],
            provider
          );

          const reward = await masterChefContract.rewardPerBlock();
          const endBlock = await masterChefContract.bonusEndBlock();
          const totalDeposit = await masterChefContract.stakedTokenSupply();
          const lpPriceUsd = await this.getStakeUnitPriceUsd(farmConfig);
          const tax = await this.getStakeFreeRate(farmConfig.poolAddress);

          const totalLiquidity = new BigNumber(lpPriceUsd)
            .times(totalDeposit.toString() || 0)
            .times(100 - tax)
            .div(100)
            .toNumber();
          const rewardTokenPriceUsd = await this.getTokenPrice(
            farmConfig.rewardToken.contractAddress
          );
          //hardcode blockNumber
          const currentBlock =
            this.networkdata.blockNumber > 13981460
              ? this.networkdata.blockNumber
              : 13981460;
          return {
            ...farmConfig,
            endBlock,
            lpSymbol: farmConfig.lpSymbol,
            lpPriceUsd: new BigNumber(lpPriceUsd).toFixed(5),
            poolTokens: farmConfig.poolTokens,
            // poolWeight: poolWeight.toJSON(),
            myStake: totalLiquidity,
            multiplier: endBlock - currentBlock > 0 ? '1X' : '0X',
            apy:
              endBlock - currentBlock > 0
                ? this.getFarmApy(
                    rewardTokenPriceUsd,
                    totalLiquidity,
                    new BigNumber(reward._hex).toNumber()
                  )
                : 0,
            rewardTokenPrice: rewardTokenPriceUsd,
            tax: tax * 100
          };
        })
      );
      // const data = await Promise.all(
      //   farmConfig.map(async farmConfig => {
      //     const [info, totalAllocPoint] = await multicall(
      //       provider,
      //       abi['BuniPool'],
      //       [
      //         {
      //           address: syrupAddress,
      //           name: 'poolInfo',
      //           params: [farmConfig.pid]
      //         },
      //         {
      //           address: syrupAddress,
      //           name: 'totalAllocPoint'
      //         }
      //       ]
      //     );

      //     const lpAddress = farmConfig.lpAddresses;

      //     const [lpTokenBalanceMC] = await multicall(provider, abi['LPErc20'], [
      //       {
      //         address: lpAddress,
      //         name: 'balanceOf',
      //         params: [syrupAddress]
      //       }
      //     ]);

      //     const allocPoint = new BigNumber(info.allocPoint._hex);
      //     const poolWeight = allocPoint.div(new BigNumber(totalAllocPoint));

      //     return {
      //       ...farmConfig,
      //       lpSymbol: farmConfig.lpSymbol,
      //       lpPriceUsd: new BigNumber(lpPriceUsd).toFixed(5),
      //       poolTokens: farmConfig.poolTokens,
      //       poolWeight: poolWeight.toJSON(),
      //       multiplier: `${allocPoint.div(100).toString()}X`,
      //       myStake: new BigNumber(lpPriceUsd)
      //         .times(lpTokenBalanceMC)
      //         .toString()
      //     };
      //   })
      // );
      // const data = [];
      return data;
    },

    async getFarmUserData() {
      const userFarmTokenBalances = await this.fetchFarmUserTokenBalances();
      const userStakedBalances = await this.fetchFarmUserStakedBalances();
      const userFarmEarnings = await this.fetchFarmUserEarnings();

      const arrayOfUserDataObjects = userFarmTokenBalances.map(
        (farmAllowance, index) => {
          return {
            index,
            tokenBalance: userFarmTokenBalances[index],
            stakedBalance: userStakedBalances[index],
            earnings: userFarmEarnings[index]
          };
        }
      );
      console.log('arrayOfUserDataObjects', arrayOfUserDataObjects);

      arrayOfUserDataObjects.forEach(userDataEl => {
        const { index } = userDataEl;
        Vue.set(this.syrupFarms, index, {
          ...this.syrupFarms[index],
          userData: userDataEl
        });
      });
    },
    getFarmApy(rewardTokenPriceUsd, poolLiquidityUsd, rewardPerBlock) {
      if (!poolLiquidityUsd || !rewardPerBlock) {
        return null;
      }
      const yearlyCakeRewardAllocation = new BigNumber(rewardPerBlock).times(
        BLOCKS_PER_YEAR
      );
      const apy = yearlyCakeRewardAllocation
        .times(rewardTokenPriceUsd)
        .div(poolLiquidityUsd)
        .times(100);

      return apy.isNaN() || !apy.isFinite() ? null : apy.toNumber();
    },
    async fetchFarmUserTokenBalances() {
      const calls = farmConfig.map(farm => {
        console.log('farm.lpAddresses', farm.lpAddresses);
        const lpContractAddress = farm.lpAddresses;
        return {
          address: lpContractAddress,
          name: 'balanceOf',
          params: [this.myAccount]
        };
      });
      console.log('CALLLLLLLLLLLLLLS', calls);

      const rawTokenBalances = await multicall(provider, abi['ERC20'], calls);

      const parsedTokenBalances = rawTokenBalances?.map(tokenBalance => {
        return new BigNumber(tokenBalance).toJSON();
      });
      return parsedTokenBalances;
    },

    async fetchFarmUserStakedBalances() {
      const calls = farmConfig.map(farm => {
        return {
          address: farm.poolAddress,
          name: 'userInfo',
          params: [this.myAccount]
        };
      });

      const rawStakedBalances = await multicall(
        provider,
        abi['BuniSyrupPool'],
        calls
      );

      return rawStakedBalances.map(stakedBalance => {
        return new BigNumber(stakedBalance[0]._hex).toJSON();
      });
    },

    async fetchFarmUserEarnings() {
      const calls = farmConfig.map(farm => {
        return {
          address: farm.poolAddress,
          name: 'pendingReward',
          params: [this.myAccount]
        };
      });
      const rawEarnings = await multicall(
        provider,
        abi['BuniSyrupPool'],
        calls
      );
      return rawEarnings.map(earnings => {
        return new BigNumber(earnings).toJSON();
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.banner {
  width: 100%;
  margin: 27px 0 40px 0;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
</style>
