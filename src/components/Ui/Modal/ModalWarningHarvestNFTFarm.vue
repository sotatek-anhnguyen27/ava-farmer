<template>
  <UiModal
    :open="open"
    @close="$emit('closeModalWarningHarvestNFTFarm')"
    style="max-width: 770px;"
    class="modal-stake"
    :class="_isThemeGame ? 'game' : ''"
  >
    <template #default>
      <div class="header" :class="_isThemeGame && 'game-header'">
        {{ $t('harvestNFTTitle') }}
      </div>
      <div class="content">
        <div
          class="current-level"
          :class="!imgUrlNextLevel ? 'highest-level' : ''"
        >
          <div class="img-wrapper">
            <img :src="imgUrlCurLevel" />
          </div>
          <div
            v-if="imgUrlNextLevel"
            class="desc"
            :class="_isThemeGame ? 'game' : ''"
            v-html="
              `${$t('currentLevel', {
                currentLevelName: currentLevelName
              })}`
            "
          ></div>
        </div>
        <div v-if="imgUrlNextLevel" class="between-content">
          <div class="buni-to-next-level" :class="_isThemeGame ? 'game' : ''">
            {{ $t('earn') }} {{ _num(buniToNextLevel) }} BUNI <br />{{
              $t('toReceive')
            }}
          </div>
          <div class="img-wrapper">
            <img src="~@/assets/game_level/arrow-next-level.svg" />
          </div>
        </div>
        <div v-if="imgUrlNextLevel" class="next-level">
          <div class="img-wrapper">
            <img :src="imgUrlNextLevel" />
          </div>
          <div
            class="desc"
            :class="_isThemeGame ? 'game' : ''"
            v-html="
              `
              ${$t('nextLevel', {
                nextLevelName: nextLevelName
              })}`
            "
          ></div>
        </div>
      </div>
      <div class="button-flex">
        <UiButton
          @click="$emit('harvestNFTFarm')"
          :requireLogin="true"
          type="submit"
          class="button-wrapper button"
          style="width: 150px"
          :class="`${_isThemeGame ? 'game-border-btn-add' : ''}`"
        >
          <UiLoading v-if="loading" />
          <span v-else>{{ $t('harvestAnyWay') }}</span>
        </UiButton>

        <UiButton
          @click="$emit('closeModalWarningHarvestNFTFarm')"
          type="button"
          class="button button-cancel"
          style="width: 150px"
          :class="`${_isThemeGame ? 'game-border-btn-add' : ''}`"
        >
          {{ $t('cancel') }}
        </UiButton>
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
    imgUrlCurLevel: {
      type: String,
      require: true,
      default: ''
    },
    imgUrlNextLevel: {
      type: String,
      require: true,
      default: ''
    },
    buniToNextLevel: {
      type: Number,
      require: true,
      default: 0
    },
    currentLevelName: {
      type: String,
      require: true,
      default: ''
    },
    nextLevelName: {
      type: String,
      require: true,
      default: ''
    },
    loading: {
      type: Boolean,
      require: true,
      default: false
    }
  }
};
</script>
<style lang="scss" scoped>
.between-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .buni-to-next-level {
    background: linear-gradient(270deg, #ff8c06 0%, #f47820 100%);
    border-radius: 5px;
    border: 2px solid #ff9d2b;
    font-family: Lato-Bold;
    font-weight: 800;
    font-size: 12px;
    line-height: 14px;
    text-align: center;
    text-transform: capitalize;
    color: #ffffff;
    padding: 6px 12px;
  }
  .img-wrapper {
    width: 115px;
    margin-top: 16px;
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}
.button-wrapper,
.button-cancel {
  padding: 0 !important;
  white-space: nowrap;
  margin: 0 15px 45px 15px;
}
@media only screen and (max-width: 768px) {
  .img-wrapper {
    width: 120px !important;
    height: 160px !important;
  }
  .between-content {
    width: 20%;
    .img-wrapper {
      width: 30px !important;
      height: 30px !important;
    }
    .buni-to-next-level {
      padding: 6px 2px !important;
      font-size: 10px !important;
    }
  }
}
.highest-level {
  width: 100% !important;
}
.current-level,
.next-level {
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  .img-wrapper {
    width: 240px;
    height: 320px;
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}
.desc {
  margin-top: 10px;
  font-family: Lato-Regular;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: var(--text-color);
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
  display: flex;
  justify-content: space-between;
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
  font-family: $font-bold !important;
  font-size: 16px !important;
  border: 0 !important;

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
  width: 190px;
  font-size: 16px;
  color: $color-primary;
  border: 2px solid $color-primary !important;
  background-color: inherit !important;

  &:hover {
    background: $color-primary !important;
    color: #ffffff;
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
