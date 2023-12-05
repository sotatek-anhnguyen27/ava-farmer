<template>
  <div>
    <div>
      <asset-input
        :address="addressIn || config.kalancer.pair.inputAsset"
        :amount="amountIn"
        :modal-key="'input'"
        :type="$t('from')"
        :loading="swapsLoading && !isExactIn"
        @change="value => handleAmountChange(true, value)"
        @openAssetModal="value => onOpenAssetModal(value)"
        :balance="balanceLabel.balanceInNumberLb"
        :transactionPending="transactionPending"
      />
    </div>
    <div class="rate-wrapper">
      <pair-toggle @toggle="toggle" :transactionPending="transactionPending" />
    </div>
    <div>
      <asset-input
        :address="addressOut || config.kalancer.pair.outputAsset"
        :amount="amountOut"
        :modal-key="'output'"
        :type="$t('to')"
        :loading="swapsLoading && isExactIn"
        @change="value => handleAmountChange(false, value)"
        @openAssetModal="value => onOpenAssetModal(value)"
        :balance="balanceLabel.balanceOutNumberLb"
        :transactionPending="transactionPending"
      />
    </div>
    <div class="impact-rate" :class="_isThemeGame ? 'game' : ''">
      <div
        v-show="slippageLabel.text"
        class="info-label"
        :class="{
          warning: slippageLabel.style === 'Warning',
          error: slippageLabel.style === 'Error'
        }"
      >
        {{ slippageLabel.text }}
      </div>
      <div class="rate-message" v-if="isAuthenticated && !wrongNetwork">
        <span class="rate-label" @click="toggleRate">
          {{ rateMessage }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import BigNumber from 'bignumber.js';
import AssetInput from '@/components/swap/AssetInput';
import PairToggle from '@/components/swap/PairToggle';
import config from '@/config';
import { scale } from '@/utils/helpers';
import {
  SwapValidation,
  validateNumberInput,
  ValidationError
} from '@/utils/validation';

const SLIPPAGE_WARNING = 0.02;

export default {
  name: 'SwapPair',
  components: { AssetInput, PairToggle },
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
    isExactIn: {
      type: Boolean,
      required: true
    },
    slippage: {
      type: Number,
      required: true
    },
    swapsLoading: {
      type: Boolean,
      required: true
    },
    validation: {
      type: Number,
      required: true
    },
    transactionPending: {
      type: Boolean,
      required: true
    }
  },

  data() {
    return {
      isInRate: true
    };
  },
  computed: {
    wrongNetwork() {
      return this.$store.state.account.wrongNetwork;
    },
    slippageLabel() {
      if (this.slippage === 0) {
        return {
          text: '',
          style: 'Normal'
        };
      }
      if (this.slippage < 0.0001) {
        return {
          text: this.$t('priceImpact') + ': 0.01%',
          style: 'Normal'
        };
      }
      const text =
        this.$t('priceImpact') + `: ${(this.slippage * 100).toFixed(2)}%`;
      const style = this.slippage < SLIPPAGE_WARNING ? 'Normal' : 'Warning';
      return {
        text,
        style
      };
    },
    balanceLabel() {
      const { balances } = this.$store.state.account;
      const metadata = this.$store.getters['assets/metadata'];
      if (!balances || !metadata) {
        return {
          text: '',
          style: 'Normal'
        };
      }

      const assetMetadata = metadata[this.addressIn];
      const assetMetadatOut = metadata[this.addressOut];
      const balance = balances[this.addressIn];
      const balanceOut = balances[this.addressOut];

      if (!assetMetadata || !balance) {
        return {
          text: '',
          style: 'Normal'
        };
      }

      const balanceNumber = new BigNumber(balance);
      const balanceOutNumber = new BigNumber(balanceOut);
      const assetDecimals = assetMetadata.decimals;
      const assetOutDecimals = assetMetadatOut.decimals;
      const balanceShortNumber = scale(balanceNumber, -assetDecimals);
      const balanceOutShortNumber = scale(balanceOutNumber, -assetOutDecimals);

      const text = `Balance: ${balanceShortNumber.toFixed(config.precision)}`;
      const balanceInNumberLb = parseFloat(
        balanceShortNumber.toFixed(config.precision)
      );
      const balanceOutNumberLb = parseFloat(
        balanceOutShortNumber.toFixed(config.precision)
      );

      const error = validateNumberInput(this.amountIn);
      const style =
        error == ValidationError.NONE && balanceShortNumber.lt(this.amountIn)
          ? 'Error'
          : 'Normal';
      return {
        text,
        style,
        balanceInNumberLb,
        balanceOutNumberLb
      };
    },
    rateMessage() {
      if (
        this.validation === SwapValidation.EMPTY_INPUT ||
        this.validation === SwapValidation.INVALID_INPUT ||
        this.validation === SwapValidation.NO_SWAPS
      ) {
        return '';
      }
      const metadata = this.$store.getters['assets/metadata'];
      const assetIn = metadata[this.addressIn];
      const assetOut = metadata[this.addressOut];
      if (!assetIn || !assetOut) {
        return '';
      }
      const assetInAmount = new BigNumber(this.amountIn);
      const assetOutAmount = new BigNumber(this.amountOut);
      const rate = this.isInRate
        ? assetOutAmount.div(assetInAmount)
        : assetInAmount.div(assetOutAmount);
      const rateString = +rate.toFixed(8);
      return this.isInRate
        ? `1 ${assetIn.symbol} = ${rateString} ${assetOut.symbol}`
        : `1 ${assetOut.symbol} = ${rateString} ${assetIn.symbol}`;
    }
  },
  methods: {
    handleAmountChange(exactIn, amount) {
      amount = amount ? new BigNumber(amount).toString() : '';
      this.$emit('update-is-exact-in', exactIn);
      this.$emit('change', amount);
      if (exactIn) {
        this.$emit('update-amount-in', amount);
      } else {
        this.$emit('update-amount-out', amount);
      }
    },
    toggle() {
      this.$emit('update-is-exact-in', !this.isExactIn);
      this.$emit('update-address-in', this.addressOut);
      this.$emit('update-address-out', this.addressIn);
      this.$emit('update-amount-out', this.amountIn);
      this.$emit('update-amount-in', this.amountOut);
      this.$emit('change', this.amountOut);
    },
    toggleRate() {
      this.isInRate = !this.isInRate;
    },
    onOpenAssetModal(value) {
      const isExactIn = value === 'input';

      this.$emit('update-is-exact-in', isExactIn);
    }
  }
};
</script>

<style scoped lang="scss">
.info-label {
  font-size: 14px;
  color: var(--button-color-checkbox);
}

.info-label.warning {
  color: #ff9a1a;
  padding: 0 !important;
  margin: 0 !important;
}
.info-label.error {
  color: #ff5b4c;
}
.impact-rate {
  display: flex;
  align-self: center;
  margin-top: 14px;
  justify-content: space-between;
}
.label {
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  color: #718b98;
  font-size: 14px;
}

.impact-rate.game {
  .info-label,
  .rate-label {
    font-size: 11px !important;
  }
}

@media only screen and (max-width: 768px) {
  .impact-rate.game {
    .info-label,
    .rate-label {
      font-size: 9px !important;
    }
  }

  .impact-rate {
    .info-label,
    .rate-label {
      font-size: 12px !important;
    }
  }
}

.rate-wrapper {
  margin: 15px 0 5px 0;
  display: flex;
  justify-content: center;
}

.rate-message {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: $color-primary;
  cursor: pointer;
}

.rate-label {
  max-width: 320px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
