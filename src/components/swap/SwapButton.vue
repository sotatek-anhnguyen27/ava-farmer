<template>
  <button
    :class="`${disabled ? 'btn-disable' : ''}`"
    class="swap-btn"
    @click="handleClick"
    :disabled="disabled"
  >
    <UiLoading v-if="loading" />
    <span v-else>{{ text }}</span>
  </button>
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
        return `${this.$t('unlock')} ${this.getSymbol(this.addressIn)}`;
      }
      if (this.type === Type.Swap) {
        return this.$t('swap');
      }
      return '';
    },
    isUnlocked() {
      const { allowances } = this.$store.state.account;
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
      const exchangeProxyAddress = config.kalancer.addresses.exchangeProxy;
      if (!allowances[exchangeProxyAddress]) {
        return true;
      }
      const allowance = allowances[exchangeProxyAddress][this.addressIn];
      if (!allowance) {
        return true;
      }
      const decimals = metadata[this.addressIn].decimals;
      if (!decimals) {
        return true;
      }
      const allowanceNumber = new BigNumber(allowance);
      const allowanceRaw = scale(allowanceNumber, -decimals);
      return allowanceRaw.gte(this.amountIn);
    }
  },
  methods: {
    getSymbol(address) {
      const assets = this.$store.getters['assets/metadata'];
      const asset = assets[address];
      if (!asset) {
        return '';
      }
      return asset.symbol;
    },
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
.game-button {
  border-radius: 0 !important;
  display: flex;
  justify-content: center;
  width: calc(100% - 20px);
  background: $color-primary;
  font-size: 16px;
  margin-top: 50px;
  margin-bottom: 50px;
  position: relative;
  height: 25px !important;
  font-family: $font-forward;
  border: 0 !important;

  &:enabled {
    &:hover {
      background: $game-btn-hover-color !important;
    }
  }
  &:hover {
    border: 0 !important;
  }

  @media only screen and (max-width: 768px) {
    font-size: 14px !important;
    height: 20px !important;
  }
}
.btn-disable {
  opacity: 0.4;
  cursor: not-allowed;
}
@media only screen and (max-width: 768px) {
  .swap-btn {
    height: 50px;
    font-size: 18px;
  }
}
</style>
