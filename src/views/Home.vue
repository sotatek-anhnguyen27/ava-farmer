<template>
  <Page :requireLogin="true">
    <Container class="mb-3">
      <Title :title="$t('myStablecoinLiquidity')" />
    </Container>
    <MyKurveLiquidity />
    <Container class="mb-3">
      <Title :title="$t('myFlexibleLiquidity')" />
    </Container>
    <ListPools
      :key="JSON.stringify(queryMyLiquidity)"
      :query="queryMyLiquidity"
      class="mb-4"
    />
    <Container class="mb-3">
      <Title :title="$t('myPools')" />
    </Container>
    <ListPools :key="JSON.stringify(queryMyPools)" :query="queryMyPools" />
  </Page>
</template>

<script>
import MyKurveLiquidity from '@/components/Kurve/MyKurveLiquidity.vue';
export default {
  metaInfo: { title: 'Home' },
  components: { MyKurveLiquidity },
  computed: {
    queryMyLiquidity() {
      const poolShares = this.subgraph.poolShares;
      const ids = Object.keys(poolShares).map(share => share.toLowerCase());
      return {
        where: {
          id_in: ids
        }
      };
    },
    queryMyPools() {
      return {
        where: {
          crpController: this.$store.state.account.proxy
        }
      };
    }
  }
  // beforeMount() {
  //   if (!this.$store.state.account.address)
  //     this.$router.push({ name: 'tradeTokens' });
  // }
};
</script>
