<template>
  <div
    id="warning-slippage"
    class="d-flex flex-items-center p-2 warning-slippage"
    v-bind:class="[
      { 'info-box': !isWarning, 'warning-box': isWarning },
      _isThemeGame && 'game-border-message-warning'
    ]"
  >
    <Icon
      v-if="isWarning && !_isThemeGame"
      name="warning"
      size="22"
      class="mr-4 text-slippage"
    />
    <img
      v-if="isWarning && _isThemeGame"
      src="~/@/assets/icon/game/warning.png"
      style="width: 30px;"
      class="mr-4 text game-text"
    />
    <Icon
      v-if="!isWarning && !_isThemeGame"
      name="info"
      size="22"
      class="mr-4 text-slippage"
    />
    <img
      v-if="!isWarning && _isThemeGame"
      src="~/@/assets/icon/game/slippage.png"
      style="width: 30px;"
      class="mr-4 text game-text"
    />
    {{ text }}
  </div>
</template>

<script>
export default {
  props: ['value', 'isDeposit'],
  computed: {
    text() {
      const action = this.isDeposit ? this.$t('adding') : this.$t('removing');
      const percentage = this._num(this.value, 'percent');
      return `${action} ${this.$t('liquidityIncurs')} ${percentage} ${this.$t(
        'ofSlippage'
      )}`;
    },
    isWarning() {
      return this.value.gte(0.01);
    }
  }
};
</script>

<style scoped lang="scss">
#warning-slippage {
  border-radius: 5px;
  background: $panel-background-warning;
  color: $warning;
  font-family: $font-weight-semibold;
  font-size: 14px;
  line-height: 20px;
  margin-top: 10px;
  margin-bottom: 0 !important;
}

#warning-slippage.game-border-message-warning {
  background: $game-warning-bg-color !important;
  border-radius: 0px !important;
  font-family: $font-forward;
  font-size: 10px;
}

.text-slippage {
  margin-left: 20px;
  color: $text-warning;
  display: inline-flex;
  align-items: center;
  margin-right: 15px !important;
  @media only screen and (max-width: 768px) {
    margin-left: 10px !important;
    margin-right: 10px !important;
  }
}

.text-slippage.game-text {
  margin-left: 0px !important;
  @media only screen and (max-width: 768px) {
    margin-left: 0px !important;
    margin-right: 10px !important;
  }
}
</style>
