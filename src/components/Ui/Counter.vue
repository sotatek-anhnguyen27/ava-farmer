<template>
  <span :class="_isThemeGame ? 'game-border-counter' : 'Counter'">
    <slot />
  </span>
</template>

<style scoped lang="scss">
.Counter {
  display: inline-block;
  padding: 0 6px;
  height: 24px;
  line-height: 22px;
  color: var(--counter-text-color);
  min-width: 25px;
  border: 1px solid var(--counter-border);
  text-align: center;
  background-color: $counter-bg-color;
  border-radius: 11px;
}

.game-border-counter {
  font-size: 10px;
  display: inline-block;
  padding: 0 6px;
  height: 14px;
  line-height: 15px;
  color: $text-white;
  min-width: 25px;
  text-align: center;
  background-color: $color-primary;

  @media only screen and (max-width: 768px) {
    font-size: 7px;
    padding: 0;
    line-height: 11px;
    min-width: 15px;
    height: 11px;
  }
}
</style>
