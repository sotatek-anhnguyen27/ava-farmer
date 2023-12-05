<template>
  <div>
    <UiModal
      :open="open"
      @close="$emit('closeStakeModal')"
      style="max-width: 480px;"
      class="modal-stake"
      :class="_isThemeGame ? 'game' : ''"
    >
      <template #default>
        <div class="header" :class="_isThemeGame && 'game-header'">
          {{ actionType }} {{ isTopSinglePool ? $t('TOP') : $t('lpTokens') }}
        </div>
        <div class="content">
          <div class="flex" :class="_isThemeGame ? 'game' : ''">
            <div class="text-color text" :class="_isThemeGame && 'game-text'">
              {{ actionType }}
            </div>
            <div class="balance" :class="_isThemeGame && 'game-text'">
              {{ $t('balance') }}: {{ displayToken }}
            </div>
          </div>
          <div
            class="d-flex flex-items-center width-full input-wrapper"
            :class="_isThemeGame ? 'game-btn-input-2' : ''"
          >
            <currency-input
              v-model="amount"
              autofocus
              :max="tokenBalance"
              type="text"
              class="cards__input-number flex-auto px-0 text-input-wrapper"
              :class="_isThemeGame ? 'game-placeholder game-swap-input' : ''"
              placeholder="0.0"
              :precision="18"
              @keyup="handleInputChange(amount)"
            />
            <div class="text-label-right">
              <a class="d-flex" @click="handleMax">
                <UiLabel
                  v-text="$t('max')"
                  class="max-btn"
                  :class="_isThemeGame && 'game-max-btn'"
                />
              </a>
              <div
                class="text-input-wrapper"
                :class="_isThemeGame && 'game-text ml-2'"
              >
                {{ isTopSinglePool ? 'TOP' : $t('lp') }}
              </div>
            </div>
          </div>
          <div :class="_isThemeGame && 'game-text'" style="margin-top:11px;">
            <div
              v-if="error"
              class="error"
              :class="_isThemeGame && 'game-error'"
            >
              {{ error.text }}
              <!-- <a
                v-show="error.type !== 2 && !isTopSinglePool"
                :href="liquidityUrl"
                target="_blank"
                class="error url"
                :class="_isThemeGame && 'game-error'"
                >: {{ $t('getPoolToken') }}</a
              > -->
            </div>
          </div>
          <div v-if="actionType === 'Unstake'">
            <MessageError
              v-if="true"
              :text="$t('tokenPlayWarning')"
              class="mt-4"
            />
          </div>
          <div class="button-flex">
            <UiButton
              :requireLogin="true"
              type="submit"
              class="button-wrapper button"
              :class="
                `${(error || isLoading || !amount) && 'disable'} ${
                  _isThemeGame ? 'game-border-btn-add' : ''
                }`
              "
              @click="actionType === 'Stake' ? onStake() : confirmUnStake()"
            >
              {{ isLoading ? 'Pending Confirmation' : $t('confirm') }}
            </UiButton>

            <UiButton
              @click="$emit('closeStakeModal')"
              type="button"
              class="button button-cancel"
              :class="`${_isThemeGame ? 'game-border-btn-add' : ''}`"
            >
              {{ $t('cancel') }}
            </UiButton>
          </div>
          <a class="center" :href="liquidityUrl" target="_blank">
            <template v-if="!isTopSinglePool">
              <div>{{ $t('getPoolToken') }}</div>
              <Icon v-if="!_isThemeGame" name="external-link link" />
              <img
                v-else
                src="~/@/assets/icon/game/link.png"
                class="icon-link-game"
              />
            </template>
          </a>
        </div>
      </template>
    </UiModal>
  </div>
</template>
<script>
import BigNumber from 'bignumber.js';
import Helper from '@/helpers/BlockchainHelper';
import { getFullDisplayBalance } from '@/utils/price';
import CurrencyInput from '@/components/CurrencyInput.vue';
import config from '@/config';
import abi from '@/helpers/abi';

export default {
  components: { CurrencyInput },
  data() {
    return {
      amount: '',
      message: '',
      isLoading: false
    };
  },
  props: {
    actionType: {
      require: true,
      type: String
    },
    open: {
      type: Boolean,
      require: true,
      default: false
    },
    label: {
      type: String
    },
    stakedBalance: {
      type: String
    },
    tokenBalance: {
      type: String
    },
    pid: {
      type: Number
    },
    farmData: {
      required: true
    },
    liquidityUrl: {
      type: String
    },
    isTopSinglePool: {
      default: false
    }
  },
  watch: {
    open: async function() {
      this.amount = '';
      this.isLoading = false;
      this.openWarningUnstakeFarm = false;
    }
  },
  computed: {
    error() {
      if (this.fullToken <= 0) return { type: 1, text: 'No Token To Stake' };
      if (this.amount <= 0)
        return { type: 2, text: this.$t('tokenAmountInvalid') };
      if (parseFloat(this.amount) > parseFloat(this.fullToken))
        return { type: 3, text: 'Not Enough Token To Stake' };
      return null;
    },
    fullToken() {
      return this.actionType === 'Stake'
        ? getFullDisplayBalance(
            this.tokenBalance ? new BigNumber(this.tokenBalance) : 0
          )
        : getFullDisplayBalance(
            this.stakedBalance ? new BigNumber(this.stakedBalance) : 0
          );
    },
    displayToken() {
      return !new BigNumber(this.fullToken).isZero() && this.fullToken < 1e-4
        ? '<0.0001'
        : this._num(this.fullToken);
    }
  },

  methods: {
    handleMax() {
      this.amount = this.fullToken;
    },
    handleInputChange(value) {
      this.amount = value && this._validInputNumber(value);
    },
    async onStake() {
      if (this.error || this.isLoading || !this.amount) return;

      const provider = await this.$store.getters['account/provider'];

      this.isLoading = true;
      this.$emit('loadingStatusUpdated', 'stake', true);
      this.$emit('closeStakeModal');

      try {
        await Helper.stake(
          provider,
          config.addresses.tokenMasterChef,
          this.amount,
          this.pid,
          this.isTopSinglePool,
          abi['TokenFarmMasterChef']
        );
        this.$root.$emit('UPDATE_TOKEN_FARM_DATA');
        this.$root.$emit('UPDATE_TOKEN_FARM_USER_DATA');
      } catch (e) {
        console.error(
          `Action onStake has error ${e.message}`,
          JSON.stringify(e)
        );
      } finally {
        this.isLoading = false;
        this.$emit('loadingStatusUpdated', 'stake', false);
      }
    },
    isGameNFT(poolId) {
      return config.gameNftFarm.includes(Number(poolId));
    },
    async confirmUnStake() {
      await this.onUnStake();
    },
    async onUnStake() {
      if (this.error || this.isLoading || !this.amount) return;

      const provider = await this.$store.getters['account/provider'];

      this.isLoading = true;
      this.$emit('loadingStatusUpdated', 'unstake', true);
      this.$emit('closeStakeModal');

      try {
        await Helper.unstake(
          provider,
          config.addresses.tokenMasterChef,
          this.amount,
          this.pid,
          this.isTopSinglePool,
          abi['TokenFarmMasterChef']
        );
        this.$root.$emit('UPDATE_TOKEN_FARM_DATA');
        this.$root.$emit('UPDATE_TOKEN_FARM_USER_DATA');
      } catch (e) {
        console.error(
          `Action onUnStake has error ${e.message}`,
          JSON.stringify(e)
        );
      } finally {
        this.isLoading = false;
        this.$emit('loadingStatusUpdated', 'unstake', false);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.content {
  padding: 20px 40px 35px 40px;
  font-size: 13px;
  line-height: 20px;
  flex-direction: column;
  display: flex;
}
.text-color {
  color: var(--text-color);
  opacity: 0.5;
}
.flex {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  margin-bottom: 5px;
  @media only screen and (max-width: 768px) {
    .text {
      color: var(--text-color);
      font-size: 13px;
    }
  }
}
.disable {
  opacity: 0.3;
  cursor: not-allowed !important;
}
.button-flex {
  display: flex;
  justify-content: space-between;
}
.max-btn {
  height: 27px !important;
  font-size: 14px !important;
  line-height: 24px !important;
  padding: 0 13px !important;
  margin-right: 5px;
}

.game-max-btn {
  font-size: 9px !important;
  height: 24px !important;
}

.center {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: var(--link-color);
  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }
}
.balance {
  color: var(--text-color);
}
.hide {
  visibility: hidden;
}
.header {
  font-weight: bold;
  font-size: 22px;
  line-height: 35px;
  color: var(--text-color);
  padding: 20px 40px;
  background: var(--tab-background);
}

.text-input-wrapper {
  color: var(--text-color);
  font-family: $font-bold;
  font-size: 18px;
  @media only screen and (max-width: 768px) {
    margin-left: 10px;
  }
}

.input-wrapper {
  box-shadow: inset 1px 2px 3px var(--box-shadow-input);
  border-radius: 5px;
  border: 1px solid var(--border-input);
  background: var(--input-background);
  padding-left: 20px !important;
  padding-right: 20px !important;
  font-size: 22px !important;
  height: 55px;

  input {
    font-size: 22px !important;
    max-width: 180px !important;
    height: 55px;

    @media only screen and (max-width: 768px) {
      max-width: 135px !important;
    }
  }
}

.game-swap-input {
  height: inherit !important;
}
::placeholder {
  font-size: 22px !important;
}
.error {
  font-size: 14px;
  line-height: 15px;
  color: #eb625b;
}

.game-error.error {
  @media only screen and (max-width: 768px) {
    font-size: 9px !important;
  }
  font-size: 11px !important;
}
.url {
  &:hover {
    text-decoration: underline !important;
  }
}
.text-label-right {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  align-items: center;
  font-size: 14px;
  line-height: 20px;
}

.button {
  min-width: 150px !important;

  @media only screen and (max-width: 768px) {
    min-width: 100px !important;
  }
}

.button-wrapper.button {
  background: $color-primary !important;
  color: $secondary-button-text !important;
  margin: 15px 0 30px 0;
  font-family: $font-bold !important;
  font-size: 16px !important;
  border: 0 !important;
  width: 190px;

  &:enabled {
    &:hover {
      background: $game-btn-hover-color !important;
    }
  }

  &.disable {
    background: $color-primary;
    opacity: 0.4;

    &:hover {
      background: $color-primary !important;
    }
  }

  @media only screen and (max-width: 768px) {
    width: 150px;
    &:hover {
      background: $color-primary !important;
      color: $secondary-button-text !important;
    }
  }
}

.button-cancel {
  margin: 15px 0 30px 0;
  width: 190px;
  font-size: 16px;
  color: $color-primary;
  border: 2px solid $color-primary !important;
  background-color: inherit !important;

  &:hover {
    background: $color-primary !important;
  }

  @media only screen and (max-width: 768px) {
    width: 150px;
    &:hover {
      background-color: inherit !important;
      color: $color-primary !important;
    }
  }
}

.game-btn-input-2 {
  border-radius: 0 !important;
  margin: 20px 0 !important;

  input {
    font-family: $font-forward !important;
    font-size: 14px !important;
    padding-top: 5px;
    line-height: 30px;
  }
}

.game-border-btn-add.button {
  width: 150px;
  margin: 30px;
  font-family: $font-forward !important;
  height: 35px !important;
  font-size: 12px !important;
}

.modal-stake.game {
  max-width: inherit !important;
}

@media only screen and (max-width: 768px) {
  .flex.game {
    font-size: 10px !important;
  }

  .max-btn.game-border-button-max {
    font-size: 9px !important;
    padding: 0 5px !important;
    height: 20px !important;
    line-height: 20px !important;
  }

  .button.game-border-btn-add {
    min-width: 110px !important;
    margin: 30px 14px !important;
    font-size: 12px !important;
  }

  .modal-stake.game {
    .header {
      font-size: 18px !important;
    }
  }
}

.modal-stake.game {
  .header {
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
}

.game-header {
  font-size: 16px !important;
}

.game-text {
  font-size: 12px !important;
  font-family: $font-forward;
}
</style>
