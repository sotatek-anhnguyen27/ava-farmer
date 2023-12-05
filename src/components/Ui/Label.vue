<template>
  <span
    class="Label v-align-middle"
    :class="_isThemeGame && 'game-border-button-max'"
  >
    <slot />
  </span>
</template>

<style scoped lang="scss">
.label,
.Label {
  border-radius: 100px;
  border: 1px solid $counter-btn-bg-color;
  background: $counter-btn-bg-color;
  color: $secondary-button-text;
  font-size: 12px;
  text-transform: capitalize;
  font-family: $font-bold;
  padding: 0 9px;
  height: 24px;
  line-height: 24px;
  box-shadow: none;
  @media only screen and (max-width: 768px) {
    font-size: 10px;
    line-height: 22px;
    padding: 0 5px;
    background: $counter-btn-bg-hover-color !important;
    &:hover {
      background: $counter-btn-bg-hover-color !important;
      border: 0;
    }
  }
  &:hover {
    background: $counter-btn-bg-hover-color !important;
    border: 1px solid $counter-btn-bg-hover-color !important;
  }
}

.Label.pool-label {
  background: #896f5d !important;
}

.game-border-button-max {
  border-radius: 0px !important;
  background: $counter-btn-bg-color;
  color: $secondary-button-text;
  font-size: 9px;
  text-transform: capitalize;
  font-family: $font-forward;
  padding: 0 9px;
  height: 24px;
  line-height: 24px;
  box-shadow: none;
  @media only screen and (max-width: 768px) {
    font-size: 9px;
    line-height: 18px;
    padding: 0 5px;
    width: 40px;
    height: 18px;
  }
  &:hover {
    background: $counter-btn-bg-hover-color !important;
    @media only screen and (max-width: 768px) {
      background: $counter-btn-bg-color !important;
    }
  }
}

.game-border-smart-pool {
  border-radius: 0px !important;
  background: $counter-btn-bg-color;
  color: $secondary-button-text;
  font-size: 8px;
  text-transform: capitalize;
  font-family: $font-forward;
  padding: 0 9px;
  height: 20px;
  line-height: 20px;
  box-shadow: none;
  margin-left: 10px;
  @media only screen and (max-width: 768px) {
    font-size: 9px;
    line-height: 18px;
    padding: 0 5px;
    width: 40px;
    height: 18px;
    margin-left: 10px;
  }
  &:hover {
    background: $counter-btn-bg-color !important;
    @media only screen and (max-width: 768px) {
      background: $counter-btn-bg-color !important;
    }
  }
}
</style>
