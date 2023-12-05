<template>
  <ModalBase
    :title="$t('settings')"
    :open="open"
    @close="close"
    :class="'setting-modal'"
  >
    <template #default>
      <div class="section" :class="!_isThemeGame ? '' : 'game-header'">
        <div class="section-header">
          {{ $t('slippageTolerance') }}
          <span
            class="tooltipped tooltipped-n"
            :class="_isThemeGame ? 'game-tooltip' : ''"
            :aria-label="$t('revertWarning')"
          >
            <Icon
              v-if="!_isThemeGame"
              name="help"
              size="14"
              class="help-icon"
            />
            <img v-else src="~/@/assets/icon/game/help.png" />
          </span>
        </div>
        <div class="section-body">
          <div class="slippage-options">
            <div
              v-for="option in slippageOptions"
              :key="option"
              class="slippage-option"
              v-bind:class="[
                { selected: (slippage === option) & !isCustomSlippage },
                _isThemeGame ? 'game-border-slippage-option' : ''
              ]"
              @click="setSlippage(option)"
            >
              {{ formatSlippage(option) }}
            </div>
            <div class="input-wrapper">
              <input
                v-model="slippageInput"
                @input="handleSlippageInput"
                class="cards__input-number slippage-option"
                v-bind:class="[
                  { selected: isCustomSlippage },
                  !_isThemeGame
                    ? ''
                    : 'game-placeholder-setting game-btn-input-setting'
                ]"
                placeholder="0.5"
                type="number"
              />
              <span :class="!_isThemeGame ? 'unit' : 'game-unit'">%</span>
            </div>
          </div>
        </div>
        <div
          class="d-flex flex-items-center p-2 warning-box message slippage-warning"
          :class="_isThemeGame && 'game-border-message-warning'"
        >
          <Icon name="info" size="22" class="mr-2 icon-format icon-warning" />

          <div style="margin-top: 2px">
            {{ `${$t('slippageWarning', { min: 0.1, max: 50 })}` }}
          </div>
        </div>
      </div>
    </template>
  </ModalBase>
</template>

<script>
import { validateNumberInput, ValidationError } from '@/utils/validation';
import Storage from '@/utils/storage';
import ModalBase from '@/components/swap/modals/ModalBase.vue';

export default {
  components: {
    ModalBase
  },
  props: {
    open: {
      type: Boolean,
      required: true
    },
    forKurve: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      slippageOptions: [0.001, 0.002, 0.005, 0.01],
      slippage: 0,
      slippageInput: '',
      deadline: ''
    };
  },
  computed: {
    isCustomSlippage() {
      return !this.slippageOptions.includes(this.slippage);
    }
  },
  watch: {
    slippageInput() {
      this.slippageInput =
        this.slippageInput && this.slippageInput.toString().replace('-', '');
      const validation = validateNumberInput(this.slippageInput);
      if (validation !== ValidationError.NONE) {
        return;
      }
      const slippageNumber = parseFloat(this.slippageInput) / 100;
      if (slippageNumber >= 50) {
        return this.setSlippage(50);
      }
      this.setSlippage(slippageNumber);
    },
    deadline() {
      const validation = validateNumberInput(this.deadline);
      if (validation !== ValidationError.NONE) {
        return;
      }
      const deadlineNumber = parseFloat(this.deadline);
      if (deadlineNumber < 1) {
        return;
      }
      this.setDeadline(deadlineNumber);
    }
  },
  methods: {
    handleSlippageInput() {
      this.slippageInput =
        this.slippageInput && this._validInputNumber(this.slippageInput);

      if (Math.abs(this.slippageInput) > 50) {
        this.slippageInput = 50;
      }
      this.slippageInput = parseFloat(this.slippageInput);
      const validation = validateNumberInput(this.slippageInput);
      if (validation !== ValidationError.NONE) {
        return;
      }
      const slippageNumber = parseFloat(this.slippageInput) / 100;
      if (slippageNumber > 0.5) {
        return this.setSlippage(0.5);
      }
      if (slippageNumber < 0.001) {
        this.slippageInput = 0.1;
        return this.setSlippage(0.001);
      }
      this.setSlippage(slippageNumber);
    },
    close() {
      return this.$store.dispatch('closeSettingsModal');
    },
    formatSlippage(slippageNumber) {
      return `${(slippageNumber * 100).toFixed(1)}%`;
    },
    setSlippage(slippageNumber) {
      this.slippage = slippageNumber;
      Storage.saveSlippage(this.slippage);
      this.$emit('slippage-change', this.slippage);
    },
    setDeadline(deadlineNumber) {
      this.deadline = deadlineNumber;
      Storage.saveDeadline(this.deadline);
    },
    clearAssets() {
      Storage.clearAssets();
    }
  },
  mounted() {
    const slippageNumber = Storage.getSlippage();
    this.slippage = slippageNumber;
    const deadlineNumber = Storage.getDeadline();
    this.deadline = deadlineNumber;
    if (this.isCustomSlippage) {
      this.slippageInput = (this.slippage * 100).toFixed(1);
    }
  }
};
</script>

<style lang="scss">
.icon-warning {
  line-height: 0 !important;
}
.slippage-warning {
  margin-top: 16px;
}
.game-border-popup {
  .game-border-message-warning {
    font-family: $font-forward !important;
    font-size: 10px !important;
    margin-bottom: 0 !important;
  }
}

.section-header {
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 8px;
  color: var(--swap-balance-text-color);
}

.section.game-header {
  .section-header {
    font-size: 12px;
  }
}

.section-body {
  display: flex;
  align-items: center;
  .transaction-deadline {
    text-align: right !important;
    padding: 0 11px !important;
    font-size: 14px;
    width: 73px;
  }
}

.slippage-options {
  display: flex;
}

.slippage-option {
  padding: 4px 9px;
  margin-right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 84px;
  height: 30px;
  border: 1px solid var(--pool-label-border);
  border-radius: 9999px;
  color: var(--text-color);
  background: var(--slippage-option-background);
  cursor: pointer;

  &:hover {
    background: $line-hover-color;
  }
}

.slippage-option.game-border-slippage-option {
  margin-top: 10px;
  border: none;
  border-radius: 0px;
  font-size: 12px;
  height: 22px;
}

input.slippage-option {
  padding: 0;
  outline: none;
  font-size: 16px;
  text-align: center;
  cursor: text;
  box-shadow: inset 1px 2px 3px rgba(0, 0, 0, 0.075);
  border-radius: 100px;
  background: var(--input-background);
  text-align: left;
  padding-left: 13px;
  padding-right: 22px;

  &:hover {
    background: var(--input-background) !important;
  }
}

input.slippage-option.game-btn-input-setting {
  margin-top: 10px;
  border: none;
  border-radius: 0px;
  font-size: 12px;
  height: 22px;
}

.slippage-option.selected {
  background: $color-primary;
  color: $text-white;
  border: none;

  &:hover {
    background: $color-primary !important;
  }
}

.game-border-slippage-option.selected {
  margin-top: 10px !important;
  background: $color-primary;
  color: $text-white;
  border: none;

  &:hover {
    background: $game-btn-hover-color !important;
  }
}

.transaction-unit {
  color: var(--setting-color);
}

.input-wrapper {
  position: relative;
  .unit {
    position: absolute;
    color: var(--tab-label-color);
    right: 15px;
    font-size: 14px;
    top: 5px;
  }

  .game-unit {
    position: absolute;
    color: var(--tab-label-color);
    right: 15px;
    font-size: 10px;
    top: 15px;
  }
}

.setting-modal {
  .modal {
    height: 220px;
    width: 380px;
    padding: 25px 20px;
    overflow: visible;
    .header {
      padding: 0;
      font-size: 18px;
      min-height: 35px;
      .icon-close-modal {
        display: none;
      }
    }
    .modal-body {
      overflow: visible;
      padding: 0;
      .section {
        margin-bottom: 0;
        margin-top: 20px;
      }
    }
  }
}
.help-icon {
  color: var(--color-tooltip);
  margin-left: 4px;
  cursor: pointer;
}

.game-header {
  font-size: 14px !important;
  font-family: $font-forward;
}

.game-tooltip.tooltipped {
  &:after {
    font-family: $font-forward;
    font-size: 9px !important;
    line-height: 2;
  }
}
.game-toggle-select.game-tooltip.tooltipped {
  &:after {
    right: 15% !important;
  }
}

@media only screen and (max-width: 768px) {
  .setting-modal {
    .modal {
      width: 343px !important;
      padding: 25px 10px;
      border-radius: 20px;
      .section {
        margin-bottom: 15px;
        .section-header {
          margin-bottom: 5px;
        }
      }
      .slippage-option {
        max-width: 72px;
        font-size: 14px;
      }
      .game-border-slippage-option {
        max-width: 40px !important;
        font-size: 10px;
        height: 20px;
      }
      .game-btn-input-setting {
        max-width: 70px !important;
        font-size: 10px;
        height: 20px;
      }
      .modal-body {
        width: calc(100% - 20px);
      }
      .header {
        width: calc(100% - 20px);
      }
    }
  }
}
</style>
