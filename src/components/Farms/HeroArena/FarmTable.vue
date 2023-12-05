<template>
  <div class="table-farm-wrapper">
    <UiTable v-if="loading">
      <ListLoading
        :classes="[
          'column-sm text-left hide-sm hide-md hide-lg',
          'flex-auto text-left',
          'column hide-sm hide-md',
          'column hide-sm hide-md',
          'column hide-sm hide-md',
          'column',
          'column hide-sm hide-md hide-lg',
          'column hide-sm hide-md hide-lg'
        ]"
        :height="29"
      />
    </UiTable>
    <div v-else>
      <div
        v-if="!loading && formattedFarms.length === 0"
        class="py-3 text-center no-token"
      >
        <div>
          <img v-if="!_isThemeGame" src="~@/assets/icon/no-search.svg" />
          <img v-else src="~@/assets/icon/game/no-search.png" />
        </div>
        <div :class="`mt-4 ${_isThemeGame ? 'game' : ''}`">
          <div v-if="farmType === 'live'">{{ $t('noLiveFarm') }}</div>
          <div v-else>{{ $t('noTokenFound') }}</div>
        </div>
      </div>
      <UiTable v-else class="table-farm">
        <UiTableTr
          v-for="formattedFarm in formattedFarms"
          :key="formattedFarm.farm.pid"
        >
          <FarmTr
            :rewardToken="formattedFarm.rewardToken"
            :key="formattedFarm.farm.label"
            :poolTokens="formattedFarm.farm.tokens"
            :poolId="formattedFarm.farm.id"
            :buniEarned="formattedFarm.earned.earnings"
            :stake="formattedFarm.myStake"
            :apy="formattedFarm.apr.value"
            :details="formattedFarm.details"
            :rewardTokenPrice="formattedFarm.apr.buniPriceUsd"
            :originalValue="formattedFarm.apr.originalValue"
            :tax="formattedFarm.tax"
          />
        </UiTableTr>
      </UiTable>
    </div>
  </div>
</template>
<script>
import FarmTr from '@/components/Farms/HeroArena/FarmTr';
import BigNumber from 'bignumber.js';
import { orderBy } from 'lodash';
import { getBalanceNumber } from '@/helpers/farm';
import { useIntervalFn } from '@vueuse/core';
import config from '@/config';
import get from 'lodash/get';
import { getTokenPriceOnChain } from '@/helpers/price';
import { Contract } from '@ethersproject/contracts';
import abi from '@/helpers/abi';

const BLOCK_TIME = config.blockTime;
const farmConfig = config.syrupFarms;
export const BLOCKS_PER_YEAR = new BigNumber((60 / BLOCK_TIME) * 60 * 24 * 365); // 10512000
export default {
  name: 'FarmTable',
  components: {
    FarmTr
  },
  props: {
    farmType: {
      type: String,
      require: true,
      default: 'live'
    },
    isStaked: {
      type: Boolean,
      require: true,
      default: false
    },
    isSortedBy: {
      type: String,
      require: false,
      default: ''
    },
    query: {
      type: String,
      require: false,
      default: ''
    },
    isInit: {
      type: Boolean,
      require: true,
      default: false
    },
    farmData: {
      type: Array,
      require: true,
      default: () => []
    }
  },
  data() {
    return {
      prices: [],
      pauseIntervalFn: undefined
    };
  },
  computed: {
    loading() {
      return !this.isInit;
    },
    wrongNetwork() {
      return this.$store.state.account.wrongNetwork;
    },

    formattedFarms() {
      const farmsStaked = this.farmData;
      const data = this.sortFarms(farmsStaked).map(farm => {
        const { quoteTokenAdresses, quoteTokenSymbol, tokenAddresses } = farm;
        const buniPriceUsd = farm.rewardTokenPrice;

        const myAddress = this.$store.state.account.address;
        let myLiquidity = 0;
        if (!this.wrongNetwork && farm.userData && myAddress) {
          const stakedBalance = getBalanceNumber(
            new BigNumber(farm.userData.stakedBalance)
          );
          const lpPrice = farm.lpPriceUsd;
          myLiquidity = new BigNumber(stakedBalance).times(lpPrice).toString();
        }

        farm.myLiquidity = myLiquidity;
        const row = {
          apr: {
            value:
              farm.apy &&
              farm.apy.toLocaleString('en-US', { maximumFractionDigits: 2 }),
            quoteTokenAdresses,
            quoteTokenSymbol,
            tokenAddresses,
            buniPriceUsd,
            originalValue: farm.apy
          },
          farm: {
            pid: farm.pid,
            id: farm.poolAddress,
            tokens: farm.poolTokens
          },
          earned: {
            earnings:
              !this.wrongNetwork && farm.userData && myAddress
                ? getBalanceNumber(new BigNumber(farm.userData.earnings))
                : null,
            pid: farm.pid
          },
          myStake: getBalanceNumber(farm.myStake),
          multiplier: farm.multiplier,
          details: farm,
          myLiquidity,
          rewardToken: farm.rewardToken,
          tax: farm.tax
        };

        return row;
      });

      let filterQuery = data;
      if (this.query) {
        filterQuery = data.filter(farm =>
          farm.details.lpSymbol.toLowerCase().includes(this.query.toLowerCase())
        );
      }
      const filterActive =
        this.farmType === 'live'
          ? filterQuery.filter(farm => farm.multiplier !== '0X')
          : filterQuery.filter(farm => farm.multiplier === '0X');
      const filterStake = this.isStaked
        ? filterActive.filter(
            farm =>
              get(farm, 'details.userData.stakedBalance') &&
              new BigNumber(farm.details.userData.stakedBalance).isGreaterThan(
                0
              )
          )
        : filterActive;
      return this.sortFarms(filterStake);
    }
  },
  beforeDestroy() {
    if (!this.pauseIntervalFn) {
      return;
    }
    this.pauseIntervalFn();
  },
  async mounted() {
    const { pause, resume, isActive } = useIntervalFn(async () => {
      console.log(
        `==== Fetching state farm data  with interval ${BLOCK_TIME * 6}s at:`,
        new Date().toLocaleString()
      );
      await this.$store.dispatch('farm/getFarmData');

      if (!this.$store.state.account.address) {
        return;
      }

      console.log(
        `==== Fetching state farm user data with interval ${BLOCK_TIME *
          60}s at:`,
        new Date().toLocaleString()
      );
      await this.$store.dispatch('farm/getFarmUserData');
    }, 3 * 60 * 1000); // update after 6 blocks

    this.pauseIntervalFn = pause;
  },
  methods: {
    async getTokenPrice(contractAddress) {
      const prices = this.$store.getters.prices;
      let tokenPrice =
        prices[contractAddress] || prices[contractAddress.toLowerCase()] || 0;

      if (new BigNumber(tokenPrice).isZero()) {
        tokenPrice = await getTokenPriceOnChain(contractAddress.toLowerCase());
      }

      return tokenPrice;
    },
    async getTokenRewardPerBlock() {
      const provider = await this.$store.getters['account/provider'];
      const masterChefContract = new Contract(
        farmConfig.poolAddress,
        abi['BuniSyrupPool'],
        provider
      );
      const reward = await masterChefContract.rewardPerBlock();
      console.log('rewardddddddd', reward);
      return new BigNumber(reward.toString()).div(1e18).toString();
    },
    async getTokenRewardContract() {
      const provider = await this.$store.getters['account/provider'];
      const masterChefContract = new Contract(
        config.addresses.tokenMasterChef,
        abi['TokenFarmMasterChef'],
        provider
      );
      return await masterChefContract.rewardToken();
    },
    sortFarms(farms) {
      switch (this.isSortedBy) {
        case 'apr':
          return farms.sort(
            (poolA, poolB) =>
              ((poolB.apr && poolB.apr.originalValue) || 0) -
              ((poolA.apr && poolA.apr.originalValue) || 0)
          );
        case 'earned':
          return orderBy(
            farms,
            farm => (farm.earned ? farm.earned.earnings : 0),
            'desc'
          );
        case 'liquidity':
          return orderBy(farms, farm => Number(farm.myStake), 'desc');
        case 'myLiquidity':
          return orderBy(farms, farm => Number(farm.myLiquidity), 'desc');
        default:
          return farms;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.no-token {
  color: var(--color-text-not-found);
  font-size: 20px;
  font-family: $font-bold;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
</style>
