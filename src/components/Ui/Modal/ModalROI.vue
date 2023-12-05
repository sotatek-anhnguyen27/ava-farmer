<template>
  <UiModal
    :open="open"
    @close="$emit('closeRoiModal')"
    class="modal-roi"
    :class="_isThemeGame ? '' : 'max-width-modal'"
  >
    <template #default>
      <div :class="`header ${_isThemeGame && 'game-header'}`">
        {{ $t('roi') }}
      </div>
      <div :class="`content ${_isThemeGame && 'game'}`">
        <div class="detail">
          <div :class="`title ${_isThemeGame && 'game-title'}`">
            <div class="category">{{ $t('timeframe') }}</div>
            <div class="category-detail">{{ $t('roi') }}</div>
            <div
              class="category-detail"
              v-if="earnedType && earnedType === 'TOP'"
            >
              {{ $t('TOPPer1000') }}
            </div>
            <div class="category-detail" v-else>{{ $t('buniPer1000') }}</div>
          </div>
          <div class="data">
            <div :class="`row-data ${_isThemeGame && 'game-row-data'}`">
              <div class="category">1d</div>
              <div class="category-detail">
                {{
                  _num(
                    calApyModalRoi(
                      data.buniEarnedPerThousand1D,
                      data.oneThousandDollarsWorthOfBuni
                    ) / 100,
                    'percent'
                  )
                }}
              </div>
              <div class="category-detail">
                {{ _num(parseFloat(data.buniEarnedPerThousand1D)) }}
              </div>
            </div>
            <div :class="`row-data ${_isThemeGame && 'game-row-data'}`">
              <div class="category">7d</div>
              <div class="category-detail">
                {{
                  _num(
                    calApyModalRoi(
                      data.buniEarnedPerThousand7D,
                      data.oneThousandDollarsWorthOfBuni
                    ) / 100,
                    'percent'
                  )
                }}
              </div>
              <div class="category-detail">
                {{ _num(parseFloat(data.buniEarnedPerThousand7D)) }}
              </div>
            </div>
            <div :class="`row-data ${_isThemeGame && 'game-row-data'}`">
              <div class="category">30d</div>
              <div class="category-detail">
                {{
                  _num(
                    calApyModalRoi(
                      data.buniEarnedPerThousand30D,
                      data.oneThousandDollarsWorthOfBuni
                    ) / 100,
                    'percent'
                  )
                }}
              </div>
              <div class="category-detail">
                {{ _num(parseFloat(data.buniEarnedPerThousand30D)) }}
              </div>
            </div>
            <div :class="`row-data ${_isThemeGame && 'game-row-data'}`">
              <div class="category">365d(APR)</div>
              <div class="category-detail">
                {{
                  _num(
                    calApyModalRoi(
                      data.buniEarnedPerThousand365D,
                      data.oneThousandDollarsWorthOfBuni
                    ) / 100,
                    'percent'
                  )
                }}
              </div>
              <div class="category-detail">
                {{ _num(parseFloat(data.buniEarnedPerThousand365D)) }}
              </div>
            </div>
          </div>
        </div>
        <div :class="`description ${_isThemeGame && 'game-description'}`">
          {{ $t('roiDescription') }}
        </div>
        <a
          v-if="!isBuniFarm && !isSinglePool"
          class="center"
          :href="liquidityUrl"
          target="_blank"
        >
          <div class="external-link">{{ $t('getPoolToken') }}</div>
          <Icon v-if="!_isThemeGame" name="external-link" class="ml-1 link" />
          <img
            v-else
            src="~/@/assets/icon/game/link.png"
            class="icon-link-game"
          />
        </a>
      </div>
    </template>
  </UiModal>
</template>
<script>
import { apyModalRoi } from '@/helpers/compoundApyHelpers';
export default {
  props: {
    open: {
      type: Boolean,
      required: true
    },
    apy: {
      type: Number
    },
    buniPrice: {
      type: Number
    },
    liquidityUrl: {
      type: String
    },
    isBuniFarm: {
      type: Boolean,
      default: false
    },
    earnedType: {
      type: String,
      default: null
    },
    isSinglePool: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    data() {
      const oneThousandDollarsWorthOfBuni = 1000 / this.buniPrice;
      const buniEarnedPerThousand1D = this.calBuniEarnedPerThousandDollarsByApr(
        {
          numberOfDays: 1,
          farmApy: this.apy,
          buniPrice: this.buniPrice
        }
      );
      const buniEarnedPerThousand7D = this.calBuniEarnedPerThousandDollarsByApr(
        {
          numberOfDays: 7,
          farmApy: this.apy,
          buniPrice: this.buniPrice
        }
      );
      const buniEarnedPerThousand30D = this.calBuniEarnedPerThousandDollarsByApr(
        {
          numberOfDays: 30,
          farmApy: this.apy,
          buniPrice: this.buniPrice
        }
      );
      const buniEarnedPerThousand365D = this.calBuniEarnedPerThousandDollarsByApr(
        {
          numberOfDays: 365,
          farmApy: this.apy,
          buniPrice: this.buniPrice
        }
      );
      return {
        oneThousandDollarsWorthOfBuni,
        buniEarnedPerThousand365D,
        buniEarnedPerThousand30D,
        buniEarnedPerThousand7D,
        buniEarnedPerThousand1D
      };
    }
  },
  methods: {
    calBuniEarnedPerThousandDollarsByApr({ numberOfDays, farmApy, buniPrice }) {
      const timesCompounded = 365;
      const apyAsDecimal = farmApy / 100;

      //   Calculate the starting Buni balance with a dollar balance of $1000.
      const principal = 1000 / buniPrice;

      const finalAmount =
        principal * (1 + numberOfDays * (apyAsDecimal / timesCompounded));
      const roundToTwoDp = number => Math.round(number * 100) / 100;

      const interestEarned = finalAmount - principal;
      return roundToTwoDp(interestEarned);
    },
    calApyModalRoi(amountEarned, amountInvested) {
      return apyModalRoi({ amountEarned, amountInvested });
    }
  }
};
</script>
<style lang="scss" scoped>
.content {
  padding: 20px 40px 35px 40px;
  font-size: 13px;
  line-height: 20px;
  @media only screen and (max-width: 768px) {
    padding: 20px 20px 35px 20px;
  }
}
.data {
  margin-top: 10px;
  border-bottom: 1px solid var(--border-search);
  padding-bottom: 15px;
}
.center {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 25px;
  font-size: 14px;
  color: #77bd41;
  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }
}
.row-data {
  color: var(--text-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  line-height: 26px;
}

.game-row-data.row-data {
  font-size: 10px;
}
.header {
  font-weight: bold;
  font-size: 22px;
  line-height: 35px;
  color: var(--text-color);
  padding: 20px 40px;
  background: var(--tab-background);
}

.game-header.header {
  font-family: $font-forward;

  background-color: #ff9342 !important;
  position: relative;
  z-index: 1;

  &:after {
    content: '';
    height: 50%;
    width: calc(100% - 8px);
    background-color: #f4791a;
    box-shadow: 0 -8px #f4791a, 0 0 0 4px #f4791a !important;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 0;
    z-index: -1;
  }
}
.title {
  display: flex;
  justify-content: space-between;
  color: var(--text-btn);
}

.game-title {
  font-size: 11px;
}
.category {
  width: 33%;
  @media only screen and (max-width: 768px) {
    font-size: 12px !important;
  }
}

.category-detail {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 5px;
  @media only screen and (max-width: 768px) {
    font-size: 12px !important;
  }
}

.title.game-title {
  @media only screen and (max-width: 768px) {
    .category-detail,
    .category {
      font-size: 11px !important;
    }
  }
}
.external-link {
  color: var(--link-color);
  font-size: 11px !important;
}
.description {
  margin-top: 15px;
  font-size: 13px;
  color: var(--text-color-checkbox);
  line-height: 18px;
}

.game-description.description {
  font-size: 10px;
}

.max-width-modal {
  max-width: 440px;
}
</style>
