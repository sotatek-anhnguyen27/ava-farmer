<template>
  <div
    v-if="pool"
    v-bind:class="[_isThemeGame ? 'game-pool-boxes' : 'pool-boxes']"
  >
    <div class="col-12 float-left column-pool-header game">
      <div class="rounded-0 rounded-md-1 mx-0 mx-md-2">
        <p
          :class="_isThemeGame ? 'game-pool-info' : 'pool-info'"
          v-text="forKurve ? `${pool.liquidity}` : _num(pool.liquidity, 'usd')"
        />
        <p
          v-text="
            forKurve
              ? `${$t('liquidity')} ${
                  !pool.usingTracked ? $t('untracked') : ''
                }`
              : $t('liquidity')
          "
          :class="`mb-0 sub-title-pool ${_isThemeGame ? 'game-font-size' : ''}`"
        />
      </div>
    </div>
    <div class="col-12 float-left column-pool-header">
      <div class="rounded-0 rounded-md-1 mx-0 mx-md-2">
        <p
          :class="_isThemeGame ? 'game-pool-info' : 'pool-info'"
          v-text="
            forKurve ? `${pool.volume}` : _num(pool.lastSwapVolume, 'usd')
          "
        />
        <p
          v-html="
            forKurve
              ? `${$t('volume24')} ${pool.usingUtVolume ? $t('untracked') : ''}`
              : $t('volume24')
          "
          :class="`mb-0 sub-title-pool ${_isThemeGame ? 'game-font-size' : ''}`"
        />
      </div>
    </div>
    <div class="col-12 float-left column-pool-header">
      <div class="rounded-0 rounded-md-1 mx-0 mx-md-2">
        <p
          :class="_isThemeGame ? 'game-pool-info' : 'pool-info'"
          v-text="forKurve ? pool.fees : _num(pool.swapFee, 'percent')"
        />
        <p
          v-html="forKurve ? $t('swapFee24h') : $t('swapFee')"
          :class="`mb-0 sub-title-pool ${_isThemeGame ? 'game-font-size' : ''}`"
        />
      </div>
    </div>
    <div class="col-12 float-left column-pool-header">
      <div class="rounded-0 rounded-md-1 mx-0 mx-md-2">
        <p
          :class="_isThemeGame ? 'game-pool-info' : 'pool-info'"
          v-text="poolSharePercentAsText"
        />
        <p
          class="tooltipped tooltip-balance tooltipped-n"
          :aria-label="poolShareBalanceAsText(true)"
          :class="
            _isThemeGame
              ? 'game-pool-info game-pool-share game-tooltip'
              : 'pool-info pool-share'
          "
          v-text="poolShareBalanceAsText()"
        />
        <p
          v-text="$t('myPoolShare')"
          :class="`mb-0 sub-title-pool ${_isThemeGame ? 'game-font-size' : ''}`"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { getAddress } from '@ethersproject/address';
import { normalizeBalance } from '@/helpers/utils';
import BigNumber from '@/helpers/bignumber';
import { formattedNum } from '@/utils';

export default {
  props: {
    pool: {
      type: Object,
      required: true
    },
    bPool: {
      type: Object,
      default: null
    },
    forKurve: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    poolTokenBalance() {
      const bptAddress = this.bPool.getBptAddress();
      const balance = this.$store.state.account.balances[
        getAddress(bptAddress)
      ];
      return normalizeBalance(balance || '0', 18);
    },
    totalShares() {
      return parseFloat(this.bPool.metadata.totalShares);
    },
    poolSharePercent() {
      if (
        (!this.pool.finalized && !this.bPool.isCrp()) ||
        !this.poolTokenBalance
      )
        return 0;
      return (1 / this.totalShares) * this.poolTokenBalance;
    },
    poolSharePercentAsText() {
      if (this.forKurve) {
        if (this.pool.poolTokenPercentage) {
          const percent = this._num(this.pool.poolTokenPercentage, 'percent');
          return `${percent}`;
        } else {
          return '-';
        }
      }
      if (new BigNumber(this.poolSharePercent).isEqualTo(0)) {
        return '-';
      }
      return `${this._checkMyPoolSharePercent(this.poolSharePercent)}`;
    }
  },
  methods: {
    poolShareBalanceAsText(notShort) {
      if (this.forKurve) {
        if (this.pool.poolTokenPercentage) {
          if (notShort) {
            return `(${new BigNumber(this.pool.userPoolBalance)
              .decimalPlaces(6)
              .toString()} BPT)`;
          }
          const poolShare = parseFloat(
            new BigNumber(this.pool.userPoolBalance).toString()
          );
          return poolShare < 0.0001 && poolShare > 0
            ? '(< 0.0001 BPT)'
            : `(${this._shorten(
                new BigNumber(this.pool.userPoolBalance)
                  .decimalPlaces(6)
                  .toString(),
                8
              )} BPT)`;
        } else {
          return '';
        }
      }
      if (new BigNumber(this.poolSharePercent).isEqualTo(0)) {
        return '';
      }
      if (notShort) {
        return `(${formattedNum(this.poolTokenBalance)} BPT)`;
      }
      return `(${this._shorten(formattedNum(this.poolTokenBalance), 8)} BPT)`;
    }
  }
};
</script>
<style lang="scss" scoped>
.pool-info {
  font-size: 18px;
  color: var(--pool-text-color);
  margin-bottom: 0;
}
.pool-share.pool-info {
  font-size: 13px;
}

.game-pool-info {
  font-size: 10px;
  color: var(--pool-text-color);
  margin-bottom: 5px;
}

.game-pool-share.game-pool-info {
  font-size: 9px;
}

.game-font-size {
  font-size: 10px;
}
.pool-boxes {
  flex: 1 !important;
  display: flex !important;
  flex-wrap: wrap !important;
}

.game-pool-boxes {
  flex: 1 !important;
  flex-wrap: wrap !important;
}

.sub-title-pool {
  color: var(--text-color);
  opacity: 0.3;
}

.column-pool-header {
  flex: 0 0 25% !important;
  max-width: 25% !important;
}

@media only screen and (max-width: 768px) {
  .pool-boxes {
    min-width: 100vw;
    .column-pool-header {
      min-width: 50vw;
      text-align: center;
      margin-top: 15px;
    }
  }
  .game-pool-boxes {
    display: flex;
    padding-top: 1rem;
    min-width: 100vw;
    .column-pool-header {
      min-width: 50vw;
      text-align: center;
      margin-top: 15px;
    }
  }
}
</style>
