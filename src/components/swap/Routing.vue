<template>
  <div>
    <div
      class="routing-header"
      :class="_isThemeGame ? 'game' : ''"
      @click="toggleVisibility"
    >
      <div>
        {{ $t('viewOrderRouting') }}
      </div>
      <Icon
        name="chevron-down"
        size="5"
        class="toggle-icon"
        :class="visible && 'flipped'"
        v-if="!_isThemeGame"
      />
      <img
        v-else
        src="~@/assets/icon/game/arrow-down-icon.png"
        style="width: 30px;"
      />
    </div>
    <div v-if="visible" class="body">
      <div
        v-if="routes.length === 0"
        class="no-data-label"
        :class="_isThemeGame ? 'game' : ''"
      >
        {{ $t('noData') }}
      </div>
      <div v-else>
        <div class="pair">
          <div class="pair-amount">
            <div>
              <div class="asset-amount">
                {{ _num(input.amount, 'long') }}
              </div>
              <div>
                {{ input.symbol }}
              </div>
            </div>
            <div class="output-asset">
              <div class="asset-amount">
                {{ _num(output.amount, 'long') }}
              </div>
              <div>
                {{ output.symbol }}
              </div>
            </div>
          </div>
          <div class="pair-icon-wrapper">
            <div class="pair-line" :class="_isThemeGame && 'game-pair-line'" />
            <div class="pair-icon">
              <AssetIcon :address="input.address" class="asset-icon" />
              <AssetIcon :address="output.address" class="asset-icon" />
            </div>
          </div>
        </div>
        <div
          v-if="!_isThemeGame"
          class="arrows"
          :style="{ margin: `8px ${11 + routes.length}px` }"
        >
          <Icon class="arrow-icon" name="triangle" size="6" />
          <Icon class="arrow-icon reverted" name="triangle" size="6" />
        </div>
        <div
          v-else
          class="arrows"
          :style="{ margin: `8px ${12 + routes.length}px` }"
        >
          <img
            src="~@/assets/icon/game/arrow-down-routing.png"
            style="width: 10px"
          />
          <img
            src="~@/assets/icon/game/arrow-up-routing.png"
            style="width: 10px"
          />
        </div>
        <div class="routes">
          <div
            v-for="(route, index) in routes"
            :key="index"
            :style="{
              height: `${18 + 72 * index}px`,
              width: `calc(100% - ${4 * (routes.length - index - 1)}px - 4px)`,
              margin: `0 ${2 * (routes.length - index - 1) + 1}px`
            }"
            class="route-line route-responsive"
          />
          <div class="route-wrapper">
            <div
              v-for="(route, index) in routes"
              :key="route.hops[0].pool.address"
              class="route"
            >
              <div
                class="arrow-wrapper"
                :style="{
                  'margin-top': `${2 * index}px`
                }"
              >
                <img
                  v-if="_isThemeGame"
                  src="~@/assets/icon/game/arrow-routing-1.png"
                  style="width: 5px; margin-top: 2px"
                />
                <Icon
                  v-else
                  class="arrow-icon horizontal"
                  name="triangle"
                  size="6"
                />
              </div>
              <div class="hops">
                <div
                  v-for="hop in route.hops"
                  :key="hop.pool.address"
                  class="hop"
                >
                  <a
                    :href="getPoolLink(hop.pool.address, type)"
                    target="_blank"
                  >
                    <AssetIcon
                      v-for="token in hop.pool.tokens"
                      :key="token.address"
                      :address="token.address"
                      class="asset-icon-small"
                    />
                  </a>
                </div>
              </div>
              <div class="share">
                {{ formatShare(route.share) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BigNumber from 'bignumber.js';
import { getAddress } from '@ethersproject/address';

import AssetIcon from '@/components/swap/AssetIcon.vue';
import { getPoolLink } from '@/utils/helpers';

export default {
  components: {
    AssetIcon
  },
  props: {
    addressIn: {
      type: String,
      required: true
    },
    amountIn: {
      type: String,
      required: true
    },
    addressOut: {
      type: String,
      required: true
    },
    amountOut: {
      type: String,
      required: true
    },
    pools: {
      type: Array,
      required: true
    },
    swaps: {
      type: Array,
      required: true
    },
    type: {
      type: String,
      require: true
    }
  },
  data() {
    return {
      visible: false
    };
  },
  computed: {
    input() {
      const metadata = this.$store.getters['assets/metadata'];
      const symbol = metadata[this.addressIn].symbol;
      return {
        amount: this.amountIn,
        address: this.addressIn,
        symbol
      };
    },
    output() {
      const metadata = this.$store.getters['assets/metadata'];
      const symbol = metadata[this.addressOut].symbol;
      return {
        amount: this.amountOut,
        address: this.addressOut,
        symbol
      };
    },
    routes() {
      if (this.pools.length === 0 || this.swaps.length === 0) {
        return [];
      }

      const totalSwapAmount = this.swaps.reduce((total, rawHops) => {
        return total.plus(rawHops[0].swapAmount || '0');
      }, new BigNumber(0));
      const routes = this.swaps.map(rawHops => {
        const swapAmount = new BigNumber(rawHops[0].swapAmount || '0');
        const share = swapAmount.div(totalSwapAmount).toNumber();
        const hops = rawHops.map(rawHop => {
          const { swapAmount } = rawHop;
          const tokenIn = getAddress(rawHop.tokenIn);
          const tokenOut = getAddress(rawHop.tokenOut);
          const rawPool = this.pools.find(pool => pool.id === rawHop.pool);
          if (!rawPool) {
            return {};
          }
          const totalWeight = new BigNumber(rawPool.totalWeight);
          const pool = {
            address: rawPool.id,
            tokens: rawPool.tokens
              .map(token => {
                const address = getAddress(token.address);
                const weight = new BigNumber(token.denormWeight);
                const share = weight.div(totalWeight).toNumber();
                return {
                  address,
                  share
                };
              })
              .sort((a, b) => {
                if (a.address === tokenIn || b.address === tokenOut) {
                  return -1;
                }
                if (a.address === tokenOut || b.address === tokenIn) {
                  return 1;
                }
                return a.share - b.share;
              })
              .filter((token, index, tokens) => {
                // Show first 2 and last 2 tokens
                return index < 2 || index > tokens.length - 3;
              })
          };
          return {
            pool,
            tokenIn,
            tokenOut,
            swapAmount
          };
        });
        return {
          share,
          hops
        };
      });

      return routes;
    }
  },
  methods: {
    toggleVisibility() {
      this.visible = !this.visible;
    },
    formatShare(share) {
      return `${(share * 100).toFixed(2)}%`;
    },
    getPoolLink
  }
};
</script>

<style lang="scss" scoped>
div {
  --line-color: var(--text-color);
}

.routing-header {
  display: flex;
  font-size: 14px;
  color: var(--swap-balance-text-color);
  align-items: center;
  cursor: pointer;
  margin-top: 20px;
}

.toggle-icon {
  margin-left: 7px;
  display: flex;
  align-items: center;
  margin-top: 4px;
}

.toggle-icon.flipped {
  transform: rotate(180deg);
}

.no-data-label,
.body {
  margin-top: 20px;
}
.no-data-label {
  color: var(--swap-balance-text-color);
}

.pair-amount {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-tiny);
  color: var(--swap-balance-text-color);
}

.pair-icon-wrapper {
  position: relative;
  margin-top: 8px;
}

.pair-line {
  position: absolute;
  width: calc(100% - 72px);
  height: 50%;
  margin: 0 36px;
  border-bottom: 1px dashed var(--line-color);
}

.game-pair-line.pair-line {
  border-bottom: 2px dashed var(--line-color);
}

.pair-icon {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
}

.asset-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.output-asset {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.arrows {
  display: flex;
  justify-content: space-between;
}

.arrow-icon {
  color: var(--text-color);
  width: 9px;
  height: 6px;
  transform: rotate(180deg);
  display: flex;
}

.arrow-icon.reverted {
  transform: none;
}

.arrow-icon.horizontal {
  width: 6px;
  transform: rotate(90deg);
  margin-top: 2px;
}

.routes {
  position: relative;
  margin: 6px 16px;
}

.route-line {
  position: absolute;
  border-left: 1px solid var(--line-color);
  border-right: 1px solid var(--line-color);
  border-bottom: 1px solid var(--line-color);
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}

.route-wrapper {
  position: inherit;
  z-index: 1;
}

.route {
  display: flex;
  justify-content: space-between;
}

.route:not(:first-child) {
  margin-top: 39px;
}

.arrow-wrapper {
  width: 42px;
  margin-left: 16px;
  display: flex;
  align-items: center;
}

.hops {
  display: flex;
}

.hop {
  padding: 6px;
  display: flex;
  background: var(--background-primary);
  border-radius: var(--border-radius-small);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  a {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.hop:not(:first-child) {
  margin-left: 16px;
}

.asset-icon-small {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: white;
}

.asset-icon-small:not(:first-child) {
  margin-left: 6px;
}

.share {
  font-size: var(--font-size-tiny);
  width: 42px;
  margin-right: 16px;
  text-align: right;
  color: var(--swap-balance-text-color);
}

.routing-header.game {
  font-size: 12px !important;
}

.no-data-label.game {
  font-size: 10px !important;
}
@media only screen and (max-width: 768px) {
  .hop {
    a {
      max-width: 50px;
      flex-wrap: wrap;
    }
  }
  .asset-icon-small:not(:first-child) {
    margin: 0px;
  }
}
</style>
