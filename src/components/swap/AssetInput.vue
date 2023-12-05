<template>
  <div>
    <div class="info" :class="_isThemeGame ? 'mb-3 game' : ''">
      <div class="type-label">{{ type }}</div>
      <div class="balance">{{ $t('balance') }}: {{ _num(balance) }}</div>
    </div>

    <div v-bind:class="!_isThemeGame ? 'asset-input' : 'game-input-swap'">
      <div class="amount-wrapper">
        <div class="amount">
          <div class="input-wrapper">
            <div v-if="loading" class="loading" />
            <currency-input
              class="cards__input-number swap-input"
              :precision="getPrecision()"
              v-else
              type="text"
              v-model="amountData"
              :class="[!_isThemeGame ? '' : 'game-placeholder game-swap-input']"
              placeholder="0.0"
              ref="number"
              step="0.1"
            />
          </div>
          <div
            v-if="isMaxLabelShown"
            class="button max-button"
            @click="setMax"
            v-bind:class="[
              !_isThemeGame ? '' : 'game-border-button-max',
              transactionPending && 'disable'
            ]"
          >
            {{ $t('max') }}
          </div>
        </div>
      </div>
      <div
        class="asset-wrapper"
        @click="openModal"
        :class="transactionPending && 'disable'"
      >
        <div class="asset-meta">
          <div class="icon-wrapper">
            <AssetIcon
              class="asset-icon"
              :address="address"
              :class="_isThemeGame ? 'game-asset-icon' : ''"
            />
          </div>
          <span
            v-if="symbol.length <= 10"
            style="display: flex; align-items: center"
          >
            <span
              class="asset-symbol"
              :class="!_isThemeGame ? '' : 'game-asset-symbol-fontsize'"
            >
              {{ symbol }}
            </span>
          </span>

          <Tooltip v-else>
            <template #trigger>
              <span
                class="asset-symbol"
                :class="!_isThemeGame ? '' : 'game-asset-symbol-fontsize'"
                >{{ symbol }}</span
              >
            </template>
            <template #default>
              <div>{{ symbol }}</div>
            </template>
          </Tooltip>
        </div>
        <Icon
          v-if="!_isThemeGame"
          :name="'chevron-down'"
          class="chevron-down"
        />
        <img
          v-else
          src="~@/assets/icon/game/arrow-down-icon.png"
          style="width: 30px;"
        />
      </div>
    </div>
  </div>
</template>

<script>
import BigNumber from 'bignumber.js';
import { BNB_KEY, scale } from '@/utils/helpers';

import AssetIcon from '@/components/swap/AssetIcon.vue';
import Tooltip from '@/components/swap/Tooltip.vue';
import CurrencyInput from '@/components/CurrencyInput.vue';

export default {
  components: {
    AssetIcon,
    Tooltip,
    CurrencyInput
  },

  props: {
    modalKey: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    amount: {
      type: String,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      required: false,
      default: ''
    },
    balance: {
      type: Number,
      require: true,
      default: 0
    },
    transactionPending: {
      type: Boolean,
      default: false,
      require: true
    }
  },
  data() {
    return {
      amountData: this.amount
    };
  },
  watch: {
    amount() {
      if (new BigNumber(this.amountData).comparedTo(this.amount) === 0) {
        return null;
      }
      this.amountData = this.amount;
    },
    amountData() {
      this.handleInputChange(this.amountData);
    }
  },
  computed: {
    symbol() {
      const assets = this.$store.getters['assets/metadata'];
      const asset = assets[this.address];
      if (!asset) {
        return '';
      }
      return asset.symbol;
    },
    isMaxLabelShown() {
      if (this.modalKey !== 'input') {
        return false;
      }
      if (this.address === BNB_KEY) {
        return false;
      }
      const assets = this.$store.getters['assets/metadata'];
      const { balances } = this.$store.state.account;
      if (!balances) {
        return false;
      }
      const balance = balances[this.address];
      const assetMetadata = assets[this.address];
      if (!balance || !assetMetadata) {
        return false;
      }
      return true;
    }
  },
  methods: {
    getPrecision() {
      return this._hasLimitedDecimalToken(this.address) ? 6 : 18;
    },
    setMax() {
      const assets = this.$store.getters['assets/metadata'];
      const { balances } = this.$store.state.account;
      const balance = balances[this.address];
      const assetDecimals = assets[this.address].decimals;
      const balanceNumber = new BigNumber(balance);
      const amountNumber = scale(balanceNumber, -assetDecimals);
      const amount = amountNumber.toString();
      this.handleInputChange(amount);
    },
    handleInputChange(event) {
      let value = event;
      value = this._validInputNumber(value, this.getPrecision());
      if (new BigNumber(value).comparedTo(this.amount) !== 0) {
        this.$emit('change', value);
      }
    },
    openModal() {
      this.$emit('openAssetModal', this.modalKey);
      this.$store.dispatch('openAssetModal', this.modalKey);
    }
  }
};
</script>

<style lang="scss" scoped>
.disable {
  pointer-events: none;
  opacity: 0.5;
}
.asset-input {
  display: flex;
  justify-content: space-between;
  height: 65px;
  background: var(--input-background);
  border: 1px solid rgba(0, 0, 0, 0.075);
  box-sizing: border-box;
  box-shadow: inset 1px 2px 3px rgba(0, 0, 0, 0.075);
  border-radius: 5px;
}
.amount-wrapper {
  display: flex;
}
.asset-wrapper {
  width: 160px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  cursor: pointer;
}

.icon-wrapper {
  line-height: 30px;
}
.asset-wrapper:hover {
  background: $line-hover-color;
  border-bottom-right-radius: 0;
  border-top-right-radius: 0;
}

.asset-meta {
  display: flex;
  align-items: center;
}

.asset-icon {
  width: 23px;
  height: 23px;
  border-radius: 50%;
  margin-left: 10px;
}

.asset-symbol {
  display: block;
  max-width: 68px;
  margin-left: 8px;
  font-size: 20px;
  white-space: nowrap;
  overflow: hidden;
  color: var(--secondary-text-color);
  text-overflow: ellipsis;
  @media only screen and (max-width: 768px) {
    font-size: 13px !important;
    margin-left: 5px !important;
  }
}
.game-asset-symbol-fontsize {
  font-size: 14px !important;
  line-height: 1.75;
  margin-top: 5px;
}
.chevron-down {
  margin-left: 10px;
  margin-top: 4px;
  margin-right: 10px;
  font-size: 7px !important;
  color: var(--text-color);
}
.amount-wrapper {
  display: flex;
}
.amount {
  align-items: center;
  width: 240px;
  display: flex;
}

.input-wrapper {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  width: 180px;
}

.balance-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.loading {
  width: 100px;
  height: 29px;
  margin-left: 20px;
  margin-bottom: 4px;
  background: #21222c;
  animation-name: pulse;
  animation-duration: 2s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.2;
  }

  10% {
    opacity: 0.7;
  }

  100% {
    opacity: 0.2;
  }
}

.swap-input {
  padding-left: 20px;
  font-size: 28px;
  color: var(--secondary-text-color);
  border: none;
  background: transparent;
  text-align: left;
  outline: none;
  input::placeholder {
    opacity: 0.3;
    font-size: 28px;
    font-weight: 600;

    @media only screen and (max-width: 768px) {
      font-size: 20px;
    }
  }
}

.game-swap-input {
  font-size: 16px !important;
  input {
    ::-moz-placeholder {
      font-family: $font-forward !important;
    }
    ::placeholder {
      font-family: $font-forward !important;
    }
  }
}

input:not(:placeholder-shown) {
  opacity: 1;
}
.max-button {
  color: #fff;
  background: $counter-btn-bg-color;
  margin: auto;
  display: flex;
  border-radius: 100px;
  width: 57px;
  height: 28px;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  border: none;
  line-height: 28px;
  &:hover {
    background: $counter-btn-bg-hover-color !important;
    border: 0 !important;
  }
}

.game-border-button-max {
  font-size: 9px !important;
  width: 50px;
  height: 24px;
  border-radius: 0px;
  &:hover {
    background: $counter-btn-bg-hover-color !important;
    border: 0 !important;
  }
}

.info {
  display: flex;
  margin-bottom: 3px;
  justify-content: space-between;
  font-size: 16px;
}
.type-label {
  color: var(--type-label);
}
.balance {
  color: var(--swap-balance-text-color);
}

.info.game {
  .type-label {
    font-size: 13px;
  }

  .balance {
    font-size: 14px;
  }

  @media only screen and (max-width: 768px) {
    .type-label,
    .balance {
      font-size: 11px;
    }
  }
}

.chevron-icon {
  width: 12px;
  height: 12px;
  margin-right: 12px;
  margin-bottom: 12px;
}

@media only screen and (max-width: 768px) {
  .amount-wrapper {
    .amount {
      width: 150px;
      .input-wrapper {
        width: 130px;
      }
      .max-button {
        margin: auto;
        width: 45px;
        min-width: 45px;
        height: 24px;
        font-size: 10px;
        z-index: 1;
      }

      .game-border-button-max {
        height: 20px;
        &:hover {
          background: $counter-btn-bg-color !important;
          border: 0 !important;
        }
      }
    }
  }
  .asset-wrapper {
    width: 130px;
    justify-content: flex-end;
  }
  .swap-input {
    font-size: 20px;
  }
  .input {
    min-width: 100px;
    ::placeholder {
      font-size: 20px;
    }
  }
  .asset-symbol {
    font-size: 14px !important;
  }

  .game-asset-symbol-fontsize {
    font-size: 11px !important;
    padding-top: 5px;
    line-height: 20px;
  }

  .asset-icon {
    width: 17px;
    height: 17px;
    border-radius: 50%;
    margin-left: 10px;
  }
}

.game-input-swap {
  display: flex;
  justify-content: center;
  font-size: 14px !important;
  height: 45px !important;
  background: var(--input-background);
}

@media only screen and (max-width: 768px) {
  .info.game {
    font-size: 11px !important;
  }
}
</style>
