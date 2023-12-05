<template>
  <div class="d-flex justify-content-centers">
    <button
      class="swap-btn"
      v-bind:class="[
        disabled ? 'btn-disable' : '',
        _isThemeGame ? 'game-button' : ''
      ]"
      @click="handleClick"
      :disabled="disabled"
    >
      <span>{{ text }}</span>
    </button>
  </div>
</template>

<script>
import BigNumber from 'bignumber.js';

import config from '@/config';
import { BNB_KEY, scale } from '@/utils/helpers';
import { SwapValidation } from '@/utils/validation';

const Type = {
  Connect: 'Connect',
  Unlock: 'Unlock',
  Swap: 'Swap'
};

export default {
  name: 'KurveSwapButton',
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
    transactionPending: {
      type: Boolean,
      required: true
    },
    validation: {
      type: Number,
      required: true
    },
    approvalBalance: {
      type: String,
      required: true
    }
  },
  computed: {
    account() {
      const { connector, address } = this.$store.state.account;
      if (!connector || !connector.id || !address) {
        return '';
      }
      return address;
    },
    type() {
      if (!this.account) {
        return Type.Connect;
      }
      if (!this.isUnlocked) {
        return Type.Unlock;
      } else {
        return Type.Swap;
      }
    },
    disabled() {
      if (this.type === Type.Connect) {
        const { connector, address } = this.$store.state.account;
        return !!connector && !!connector.id && !address;
      } else {
        return (
          this.validation !== SwapValidation.NONE || this.transactionPending
        );
      }
    },
    text() {
      if (this.loading) {
        return this.actionText;
      }
      if (this.disabled) {
        return this.errorText;
      } else {
        return this.actionText;
      }
    },
    loading() {
      if (this.type === Type.Connect) {
        const { connector, address } = this.$store.state.account;
        return !!connector && !!connector.id && !address;
      } else {
        return this.transactionPending;
      }
    },
    errorText() {
      if (this.validation === SwapValidation.EMPTY_INPUT) {
        return this.$t('enterAmount');
      }
      if (this.validation === SwapValidation.INVALID_INPUT) {
        return this.$t('invalidAmount');
      }
      if (this.validation === SwapValidation.WRONG_NETWORK) {
        return this.$t('wrongNetwork');
      }
      if (this.validation === SwapValidation.SELECT_TOKEN) {
        return this.$t('selectToken');
      }
      if (this.validation === SwapValidation.INSUFFICIENT_BALANCE) {
        return this.$t('notEnoughFund');
      }
      if (this.validation === SwapValidation.PRICE_IMPACT_TOO_HIGH) {
        return this.$t('priceImpactHigh');
      }
      if (this.validation === SwapValidation.NO_SWAPS) {
        return this.$t('notEnoughLiquidity');
      }
      return '';
    },
    actionText() {
      if (this.type === Type.Connect) {
        return this.$t('connect');
      }
      if (this.type === Type.Unlock) {
        const assets = this.$store.getters['assets/metadata'];
        return `${this.$t('unlock')} ${assets[this.addressIn].symbol}`;
      }
      if (this.type === Type.Swap) {
        return this.$t('swap');
      }
      return '';
    },
    isUnlocked() {
      const metadata = this.$store.getters['assets/metadata'];
      if (!this.addressIn) {
        return true;
      }
      if (this.addressIn === BNB_KEY) {
        return true;
      }
      if (this.isWrapPair(this.addressIn, this.addressOut)) {
        return true;
      }
      if (!this.amountIn) {
        return true;
      }
      const decimals = metadata[this.addressIn].decimals;
      const allowanceNumber = new BigNumber(this.approvalBalance || 0);
      const allowanceRaw = scale(allowanceNumber, -decimals);
      return allowanceRaw.gte(this.amountIn);
    }
  },
  methods: {
    handleClick() {
      if (this.type === Type.Connect) {
        this.$store.dispatch('openAccountModal');
      } else if (this.type === Type.Unlock) {
        this.$emit('unlock');
      } else {
        this.$emit('swap');
      }
    },
    isWrapPair(assetIn, assetOut) {
      if (assetIn === BNB_KEY && assetOut === config.addresses.weth) {
        return true;
      }
      if (assetOut === BNB_KEY && assetIn === config.addresses.weth) {
        return true;
      }
      return false;
    }
  }
};
</script>
<style lang="scss" scoped>
.swap-btn {
  background: $btn-bg-color;
  height: 55px;
  color: $btn-text-color;
  border: 1.5px solid $color-primary;
  box-sizing: border-box;
  border-radius: 9999px;
  font-size: 20px;
  width: 100%;
  font-family: $font-bold;
  &:hover {
    background: $color-primary !important;
    border: 0 !important;
  }
}
.btn-disable {
  opacity: 0.4;
  cursor: not-allowed;
}

.game-button {
  border-radius: 0 !important;
  height: 25px !important;
  background: $color-primary;
  font-family: $font-forward;
  border: 0;
  margin-top: 45px !important;
  width: 93%;
  font-size: 16px !important;

  &:enabled {
    &:hover {
      background: $game-btn-hover-color !important;
      border: 0;
    }
  }
}

@media only screen and (max-width: 768px) {
  .swap-button {
    height: 50px !important;
    margin-bottom: 50px !important;
  }

  .game-button {
    font-size: 14px !important;
    height: 20px !important;
    padding: 0 20px !important;
  }
}
</style>
