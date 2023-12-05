<template>
  <Page :loading="loading">
    <MessageSimilarPools
      v-if="pool.liquidity < 1e7 && pool.finalized"
      :pool="pool"
      class="mb-4"
    />
    <div class="flex-auto header mb-4 py-3">
      <PoolHeader :pool="bPool" class="" />
      <PoolBoxes :pool="pool" :bPool="bPool" />
      <div class="d-block text-center text-md-left d-md-flex mb-3 mb-md-0">
        <div class="pb-3  action" :class="_isThemeGame && 'game-pr'">
          <UiButton
            v-if="enableAddLiquidity && pool.tokens.length > 0"
            class="ml-2"
            :class="_isThemeGame ? 'game-border-btn-add' : 'content-button'"
            @click="openAddLiquidityModal"
          >
            <div :class="_isThemeGame ? 'd-flex' : ''">
              <Icon v-if="!_isThemeGame" name="add" />
              <img
                v-else
                src="~/@/assets/icon/game/plus.png"
                class="icon-game"
              />
            </div>
            <div class="text-button" :class="_isThemeGame && 'game'">
              {{ $t('add') }}
            </div>
          </UiButton>
          <UiButton
            v-if="enableAddLiquidity && pool.tokens.length > 0"
            class="ml-2"
            :class="_isThemeGame ? 'game-border-btn-add' : 'content-button'"
            @click="openRemoveLiquidityModal"
          >
            <div :class="_isThemeGame ? 'd-flex' : ''">
              <Icon v-if="!_isThemeGame" name="remove" />
              <img
                v-else
                src="~/@/assets/icon/game/minus.png"
                class="icon-minus-game"
              />
            </div>
            <div class="text-button" :class="_isThemeGame && 'game'">
              {{ $t('remove') }}
            </div>
          </UiButton>
        </div>
      </div>
    </div>
    <Chart :pool="pool" class="chart" />
    <div class="router-table">
      <Tabs :pool="pool" />
      <router-view
        :key="$route.path"
        :pool="pool"
        :bPool="bPool"
        @reload="loadPool"
      />
    </div>
    <portal to="modal">
      <ModalAddLiquidity
        :pool="pool"
        :bPool="bPool"
        :open="modalAddLiquidityOpen"
        @close="modalAddLiquidityOpen = false"
        @reload="loadPool"
      />
      <ModalRemoveLiquidity
        :pool="pool"
        :bPool="bPool"
        :open="modalRemoveLiquidityOpen"
        @close="modalRemoveLiquidityOpen = false"
        @reload="loadPool"
      />
      <ModalCustomToken
        :open="modalCustomTokenOpen"
        @close="modalCustomTokenOpen = false"
      />
    </portal>
  </Page>
</template>

<script>
import Vue from 'vue';
import { mapActions } from 'vuex';
import { getAddress } from '@ethersproject/address';
import Pool from '@/_balancer/pool';
import { bnum, scale } from '@/helpers/utils';

export default {
  metaInfo: {
    title: 'Pool'
  },
  data() {
    return {
      bPool: undefined,
      id: this.$route.params.id,
      pool: {},
      loading: false,
      modalAddLiquidityOpen: !!this.$route.query.addLiquidity,
      modalRemoveLiquidityOpen: false,
      modalCustomTokenOpen: false
    };
  },
  watch: {
    $route() {
      const id = this.$route.params.id;
      if (id !== this.id) {
        this.id = id;
        this.loadPool();
      }
    },
    'account.address': async function(val, prev) {
      if (val && val.toLowerCase() !== prev) await this.loadPool();
    }
  },
  computed: {
    hasCustomToken() {
      if (!this.pool || !this.pool.tokens) return false;
      for (const token of this.pool.tokens) {
        const tokenMetadata = this.networkdata.tokenMetadata[token.checksum];
        if (!tokenMetadata || !tokenMetadata.whitelisted) return true;
      }
      return false;
    },
    enableAddLiquidity() {
      if (!this.bPool) return false;
      return this.pool.finalized || this.bPool.isCrp();
    },
    enableRemoveLiquidity() {
      return (
        this.config.chainId == this.$store.state.account.chainId &&
        this.$store.state.account.address &&
        (Object.keys(this.subgraph.poolShares).includes(this.id) ||
          this.$store.state.account.balances[getAddress(this.id)])
      );
    }
  },
  methods: {
    ...mapActions([
      'getPoolBalances',
      'loadTokenMetadata',
      'loadPricesByAddress'
    ]),
    ...mapActions('account', ['getPoolAllowances', 'getBalances']),
    openAddLiquidityModal() {
      this.modalAddLiquidityOpen = true;
    },
    openRemoveLiquidityModal() {
      this.modalRemoveLiquidityOpen = true;
    },
    async loadPool() {
      const bPool = new Pool(this.id);
      try {
        this.pool = await bPool.getMetadata();
        this.bPool = bPool;
      } catch (e) {
        return this.$router.push({ name: 'home' });
      }
      const unknownTokens = this.pool.tokensList.filter(
        tokenAddress => !this.networkdata.tokenMetadata[tokenAddress]
      );
      if (unknownTokens.length > 0) {
        await this.loadTokenMetadata(unknownTokens);
        await this.loadPricesByAddress(unknownTokens);
      }
      if (this.$store.state.account.address) {
        const data = await Promise.all([
          this.getBalances([
            ...this.pool.tokensList,
            getAddress(this.bPool.getBptAddress())
          ]),
          this.getPoolAllowances(this.pool.tokensList),
          this.getPoolBalances({
            poolAddress: this.id,
            tokens: this.pool.tokensList
          })
        ]);
        this.fixPoolBalances(data[2]);
      }
    },
    fixPoolBalances(poolBalances) {
      for (const address in poolBalances) {
        const tokenIndex = this.pool.tokens.findIndex(
          token => token.checksum === address
        );
        const tokenDecimals = this.pool.tokens[tokenIndex].decimals;
        const poolBalance = scale(bnum(poolBalances[address]), -tokenDecimals);
        Vue.set(
          this.pool.tokens[tokenIndex],
          'balance',
          poolBalance.toString()
        );
      }
    }
  },
  beforeDestroy() {
    this.$root.$off('RELOAD_POOL');
  },
  async created() {
    this.loading = true;
    await this.loadPool();
    this.loading = false;
    setTimeout(() => {
      if (this.hasCustomToken && !this.bPool.isWhitelisted())
        this.modalCustomTokenOpen = true;
    }, 1e2);

    this.$root.$on('RELOAD_POOL', () => {
      this.loadPool();
    });
  }
};
</script>
<style lang="scss" scoped>
@import '../vars.scss';
.header {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  border-bottom: 1px solid var(--border-input);
}
.action {
  display: flex;
  @media (max-width: 1024px) {
    flex-direction: column;
    button {
      margin: 10px 0;
    }
  }
  .content-button {
    display: flex;
    padding: 8px 15px !important;
    align-items: center;
    border: 2px solid $color-primary;
    color: $color-primary;
    background: none;
    border-radius: 100px;
    &:hover {
      background: $btn-bg-hover-color !important;
      color: $text-white !important;
      border: 2px solid $btn-bg-hover-color;
    }
    .icon {
      width: 12px;
      height: 12px;
      object-fit: contain;
      margin-right: 9px;
      display: flex;
      align-items: center;
      color: $color-primary;
    }
  }
  .game-border-btn-add {
    display: flex;
    padding: 8px 15px !important;
    align-items: center;
    color: $text-white;
    background: $color-primary;
    border-radius: 0;
    border: none !important;
    margin-left: 1.5rem !important;
    height: 25px !important;
    &:hover {
      background: $game-btn-hover-color !important;
    }
    .icon {
      width: 12px;
      height: 12px;
      object-fit: contain;
      margin-right: 9px;
      display: flex;
      align-items: center;
      color: $color-primary;
    }
  }
}

.game-pr {
  padding-right: 8px;
}
.text-button {
  font-family: $font-bold;
  font-size: 13px;
  line-height: 20px;
}
.icon-game {
  width: 12px;
  height: 12px;
  margin-right: 10px;
}

.icon-minus-game {
  width: 12px;
  margin-right: 10px;
}

.text-button.game {
  font-size: 11px;
}
@media only screen and (max-width: 768px) {
  .text-md-left {
    width: 100%;
  }
  .action {
    width: 100%;
    display: flex;
    justify-content: center;
    flex-direction: row;
    .content-button {
      width: 40vw;
      justify-content: center;
      margin: 20px 8px 0 8px;
    }
    .game-border-btn-add {
      width: 40vw;
      justify-content: center;
      margin: 20px 20px 0 8px;
      &:hover {
        background: $color-primary !important;
      }
    }
  }
}
</style>
