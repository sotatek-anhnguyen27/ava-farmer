<template>
  <UiModal
    :open="open"
    @close="$emit('closeModalWarningNFTFarm')"
    style="max-width: 380px;"
    class="modal-stake"
    :class="_isThemeGame ? 'game' : ''"
  >
    <template #default>
      <div class="header" :class="_isThemeGame && 'game-header'" v-html="$t('warning_harvest_reward_type.title')"></div>
      <div class="content">
        <div class="flex" :class="_isThemeGame ? 'game' : ''">
          <div
            class="text-color text desc"
            :class="_isThemeGame && 'game-text'"
          >
            <p>🚨 {{ $t('warning_harvest_reward_type.disclaimers')}}:</p>
            <p>{{ $t('warning_harvest_reward_type.disclaimer1') }}</p>
            <p>{{ $t('warning_harvest_reward_type.disclaimer2') }}</p>
          </div>
        </div>
        <div class="button-flex" @click="$emit('onTurnOffNFTFarm')">
          <UiButton
            :requireLogin="true"
            type="submit"
            class="button-wrapper button"
            :class="`${_isThemeGame ? 'game-border-btn-add' : ''}`"
          >
            {{ $t('warning_harvest_reward_type.button') }}
          </UiButton>
        </div>
      </div>
    </template>
  </UiModal>
</template>
<script>
export default {
  props: {
    open: {
      type: Boolean,
      require: true,
      default: false
    },
    pid: {
      type: Number
    }
  }
};
</script>
<style lang="scss" scoped>
.desc {
  font-family: Lato-Regular;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
}
.warning-stake {
  font-family: Lato-Regular;
  font-weight: 500;
  font-size: 13px;
  line-height: 18px;
  margin-top: 10px;
}
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
  width: 100%;
  display: flex;
  justify-content: center;
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
  width: 100%;

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
  width: 220px;
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
