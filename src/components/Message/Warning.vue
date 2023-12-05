<template>
  <div
    id="warning"
    class="d-flex flex-items-center p-2 text-left"
    :class="_isThemeGame && 'game-border-message-warning'"
  >
    <div>
      <Icon v-if="!_isThemeGame" name="warning" size="22" class="mr-4 text" />
      <img
        v-else
        src="~/@/assets/icon/game/warning.png"
        style="width: 30px;"
        class="mr-4 text game-text"
      />
    </div>
    <div>{{ text }}</div>
  </div>
</template>

<script>
export default {
  props: ['text']
};
</script>

<style scoped lang="scss">
#warning {
  border-radius: 5px;
  background: $panel-background-warning;
  color: $warning;
  font-family: $font-weight-semibold;
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 10px;
}

#warning.game-border-message-warning {
  background: $game-warning-bg-color !important;
  border-radius: 0px !important;
  font-family: $font-forward;
  font-size: 10px;

  @media only screen and (max-width: 768px) {
    margin-left: 8px !important;
    margin-right: 8px !important;
  }
}

.text {
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

.text.game-text {
  margin-left: 0px !important;
  @media only screen and (max-width: 768px) {
    margin-left: 0px !important;
    margin-right: 10px !important;
  }
}
</style>
