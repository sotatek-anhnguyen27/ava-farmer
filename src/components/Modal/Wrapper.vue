<template>
  <UiModal
    :open="open"
    @close="$emit('close')"
    style="max-width: 440px;"
    :class="`modal-wrapper modal-wrap ${_isThemeGame ? 'game' : ''}`"
  >
    <UiModalForm @submit="handleSubmit" class="text-header-wrapper">
      <template slot="header">
        <h3
          v-text="$t(title)"
          style="font-size: 22px; margin: 0 !important;"
          class="text-header"
        />
      </template>
      <div class="m-4 rounded-2">
        <div :class="`mb-2 text-wrapper ${_isThemeGame ? 'game pb-2' : ''}`">
          {{ $t('send') }}
        </div>
        <div
          :class="
            `d-flex flex-items-center mb-3 input-wrapper  ${
              _isThemeGame ? 'game-border' : ''
            }`
          "
        >
          <currency-input
            v-model="amount"
            :class="
              `${
                isValid ? 'text-input-wrapper' : 'text-input-wrapper text-red'
              } ${_isThemeGame ? 'game query-input game-placeholder' : ''}`
            "
            :max="balance"
            type="text"
            step="any"
            class="cards__input-number flex-auto px-0"
            placeholder="0.0"
            :precision="18"
            @keyup="handleInputChange(amount)"
            style="height: 55px;"
          />
          <div class="text-label-right">
            <a @click="handleMax()" class="mx-3 d-flex">
              <UiLabel
                v-text="$t('max')"
                :class="`${_isThemeGame ? 'game' : ''}`"
              />
            </a>
            <div :class="`text-input-wrapper ${_isThemeGame ? 'game' : ''}`">
              {{ symbols.tokenIn }}
            </div>
          </div>
        </div>
        <div :class="`mb-2 text-wrapper ${_isThemeGame ? 'game pb-2' : ''}`">
          <pair-toggle @toggle="toggleSide" style="margin: 0 auto" />
          <div>{{ $t('receive') }}</div>
        </div>
        <div
          :class="
            `d-flex flex-items-center mb-2 input-wrapper ${
              _isThemeGame ? 'game-border' : ''
            }`
          "
        >
          <input
            v-model="amount"
            :class="
              `${
                isValid ? 'text-input-wrapper' : 'text-input-wrapper text-red'
              } ${_isThemeGame ? 'game query-input game-placeholder' : ''}`
            "
            type="text"
            step="any"
            class="cards__input-number flex-auto px-0"
            placeholder="0.0"
            @input="handleInputChange(amount)"
            style="height: 55px;"
          />
          <div
            :class="
              `text-input-wrapper text-label-right ${
                _isThemeGame ? 'game' : ''
              }`
            "
          >
            {{ symbols.tokenOut }}
          </div>
        </div>
        <div
          v-text="$t('ethBuffer', { systemCoin: config.systemCoin.symbol })"
          class="text-yellow text-center mt-3"
          v-if="!etherLeft"
        />
      </div>
      <template slot="footer">
        <div class="col-6 float-left pr-2 pl-20">
          <UiButton
            :requireLogin="true"
            :disabled="loading || !amount || !isValid"
            :loading="loading"
            type="submit"
            :class="
              `button-wrapper btn ${_isThemeGame ? 'game-border-btn-add' : ''} `
            "
          >
            {{ $t('confirm') }}
          </UiButton>
        </div>
        <div
          class="col-6 float-left pl-2 pr-20"
          :style="{ paddingRight: !_isThemeGame ? 55 + 'px' : '' }"
        >
          <UiButton
            @click="$emit('close')"
            type="button"
            :class="
              `btn button-cancel ${_isThemeGame ? 'game-border-btn-add' : ''} `
            "
          >
            {{ $t('cancel') }}
          </UiButton>
        </div>
      </template>
    </UiModalForm>
  </UiModal>
</template>

<script>
import config from '@/config';
import { validateNumberInput, ValidationError } from '@/helpers/validation';
import { normalizeBalance } from '@/helpers/utils';
import { mapActions } from 'vuex';
import PairToggle from '@/components/swap/PairToggle';
import { BNB_KEY } from '@/utils/helpers';
import CurrencyInput from '../CurrencyInput.vue';

const GAS_BUFFER_ERROR = 0.01;
const GAS_BUFFER_WARNING = 0.04;

export default {
  props: ['open', 'side'],
  data() {
    return {
      currentSide: 1,
      amount: '',
      loading: false
    };
  },
  components: {
    PairToggle,
    CurrencyInput
  },
  watch: {
    open() {
      if (this.side) this.currentSide = this.side;
      this.amount = '';
    }
  },
  computed: {
    coinSymbol() {
      return config.systemCoin.symbol;
    },
    wrapSymbol() {
      return config.systemCoin.wrap;
    },
    title() {
      return this.currentSide === 2
        ? `unwrap${this.wrapSymbol}To${this.coinSymbol}`
        : `wrap${this.coinSymbol}To${this.wrapSymbol}`;
    },
    symbols() {
      return {
        tokenIn: this.currentSide === 2 ? this.wrapSymbol : this.coinSymbol,
        tokenOut: this.currentSide === 2 ? this.coinSymbol : this.wrapSymbol
      };
    },
    balance() {
      let balance = this.$store.state.account.balances[BNB_KEY] || '0';
      if (this.currentSide === 2)
        balance =
          this.$store.state.account.balances[this.config.addresses.weth] || '0';
      return normalizeBalance(balance, 18);
    },
    isValid() {
      if (this.loading) {
        return true;
      }

      const error = validateNumberInput(this.amount);
      if (error !== ValidationError.NONE) return false;
      return this.currentSide === 1
        ? !this.balance.minus(GAS_BUFFER_ERROR).lt(this.amount)
        : !this.balance.lt(this.amount);
    },
    etherLeft() {
      return (
        this.currentSide === 2 ||
        this.balance.isZero() ||
        !this.balance.minus(GAS_BUFFER_WARNING).lt(this.amount)
      );
    }
  },
  methods: {
    ...mapActions(['wrap', 'unwrap']),
    async handleSubmit() {
      this.loading = true;

      if (this.currentSide === 1) await this.wrap(this.amount);
      if (this.currentSide === 2) await this.unwrap(this.amount);

      this.$emit('close');
      this.loading = false;
    },
    handleInputChange(value) {
      this.amount = value && this._validInputNumber(value);
    },
    handleMax() {
      const maxAllowedAmount =
        this.currentSide === 1
          ? this.balance.minus(GAS_BUFFER_ERROR)
          : this.balance;
      this.amount = maxAllowedAmount.isNegative()
        ? '0'
        : maxAllowedAmount.toString();
    },
    toggleSide() {
      this.currentSide = this.currentSide === 1 ? 2 : 1;
      this.amount = '';
      this.loading = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.pl-20 {
  padding-left: 20px;
}

.pr-20 {
  padding-right: 20px;
}

input {
  ::placeholder {
    font-size: 22px;
  }
}
.modal-wrapper.game {
  max-width: inherit !important;
}

.text-header {
  color: var(--text-color);
}

.text-wrapper {
  color: var(--text-btn-search) !important;
  font-family: $font-bold;
  font-size: 16px;
  line-height: 20px;
}

.text-wrapper.game {
  font-size: 12px;
}

.text-input-wrapper {
  color: var(--text-color);
  font-family: $font-bold;
}

.text-input-wrapper.game {
  font-size: 14px !important;
  height: 40px !important;
  display: flex;
  align-items: center;

  @media only screen and (max-width: 768px) {
    font-size: 12px !important;
  }
}

.input-wrapper {
  box-shadow: inset 1px 2px 3px var(--box-shadow-input);
  border-radius: 5px;
  border: 1px solid var(--border-input);
  background: var(--input-background);
  padding-left: 20px !important;
  padding-right: 20px !important;
  margin-bottom: 15px !important;

  input {
    font-size: 20px !important;
    max-width: 180px !important;

    @media only screen and (max-width: 768px) {
      max-width: 140px !important;
    }
  }
}

.input-wrapper.game-border {
  border-radius: 0 !important;
}

.text-label-right {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  align-items: center;
  font-size: 20px;
  line-height: 35px;
}

.btn {
  min-width: 150px !important;

  @media only screen and (max-width: 768px) {
    min-width: 100px !important;
  }
}

.button-wrapper.button {
  background: $btn-bg-color !important;
  color: $secondary-button-text !important;
  margin-bottom: 30px;
  font-family: $font-bold !important;
  font-size: 16px !important;
  margin-left: 25px;
  border: 0 !important;
  &:enabled {
    &:hover {
      transition: none;
      background: $btn-bg-hover-color !important;
    }
  }
  &:disabled {
    background: $btn-bg-color;
    opacity: 0.4;
  }
}

.button-wrapper.game-border-btn-add.button,
.button-cancel.game-border-btn-add.button {
  border-radius: 0 !important;
  font-family: $font-forward !important;
  height: 30px !important;
  margin-top: 20px;
  margin-left: 0 !important;
  border: 0 !important;
  font-size: 12px !important;

  &:hover {
    background: $game-btn-hover-color !important;
    color: $text-white;
    border: 0 !important;
  }
}

.button-wrapper.game-border-btn-add.button {
  background: $color-primary !important;
}

.button-cancel {
  font-size: 16px;
  border: 2px solid $color-primary;
  color: $color-primary;
  background: none;

  &:hover {
    border: 2px solid $btn-bg-hover-color;
    color: $secondary-button-text;
    background: $btn-bg-hover-color;
  }
}
</style>
