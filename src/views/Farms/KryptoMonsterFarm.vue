<template>
  <Page>
    <Container>
      <Title
        :title="$t('kryptoMonsterFarms')"
        :subTitle="$t('subTitleKryptoMonsterFarms')"
        :tvl="$store.state.summaries.totalLiquidity"
        :totalMyLiquidity="totalMyLiquidity"
      />
      <KryptoMonsterBanner nftReward="krypto_monster_nft"/>
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
      nftReward="krypto_monster_nft"
    />
  </Page>
</template>

<script>
import FilterActions from '@/components/Farms/FilterActions';
import FarmTable from '@/components/Farms/FarmTable';
import { getBalanceNumber } from '@/helpers/farm';
import BigNumber from 'bignumber.js';
import config from '@/config';
import KryptoMonsterBanner from '@/components/Farms/KryptoMonsterBanner';
export default {
  metaInfo: { title: 'Farms' },
  data() {
    return {
      farmType: 'live',
      isStaked: false,
      isSortedBy: '',
      query: ''
    };
  },
  components: {
    KryptoMonsterBanner,
    FilterActions,
    FarmTable,
  },
  computed: {
    totalMyLiquidity() {
      if (!this.$store.state.farm.data) {
        return 0;
      }
      let farmsStaked = this.$store.state.farm.data;
      farmsStaked = farmsStaked.filter((farm) => {
        return config.kryptoMonsterFarm.includes(Number(farm.pid));
      });

      let totalMyLiquidity = new BigNumber(0);
      farmsStaked.map((farm, index) => {
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

      return totalMyLiquidity.toString();
    }
  },
  methods: {
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
