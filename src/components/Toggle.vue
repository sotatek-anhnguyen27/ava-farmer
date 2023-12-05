<template>
  <span
    :class="`${_isThemeGame ? 'toggle-game game-toggle-select' : 'toggle'}`"
  >
    <a
      v-for="(name, key) in options"
      :key="key"
      @click="value !== key && $emit('select', key)"
      v-bind:class="[
        value === key && 'active',
        value === key && _isThemeGame ? 'game-border-toggle-active' : ''
      ]"
      v-text="$t(`${name}`)"
    >
    </a>
  </span>
</template>

<script>
export default {
  props: ['value', 'options']
};
</script>

<style scoped lang="scss">
.toggle-game {
  font-family: $font-forward !important;
  margin-left: 10px;

  a {
    font-size: 11px !important;
  }

  @media only screen and (max-width: 767px) {
    a {
      font-size: 10px !important;
    }
  }
}

.game-toggle-select {
  display: inline-block;
  background: $game-toggle-bg-color;
  box-shadow: inset 1px 2px 3px var(--border-shadow-toggle);
  a {
    display: inline-block;
    height: 30px;
    line-height: 30px;
    color: black !important;
    padding: 0 20px;
    font-size: 15px;

    &:hover {
      color: $game-toggle-bg-hover-color !important;
    }
  }

  .active {
    color: $text-white !important;
    &:hover {
      // background: $color-primary !important;
      color: $text-white !important;
    }
  }
}

.game-border-toggle-active {
  background: #6f6f6f;
  height: 30px !important;
  line-height: 30px !important;
}

.toggle {
  display: inline-block;
  background: var(--bg-toggle);
  border-radius: 22px;
  font-family: $font-bold;
  box-shadow: inset 1px 2px 3px var(--border-shadow-toggle);
  border: 1px solid var(--border-search);
  a {
    display: inline-block;
    height: 35px;
    line-height: 35px;
    border-radius: 100px;
    color: var(--text-color) !important;
    padding: 0 20px;
    font-size: 15px;

    &:hover {
      color: var(--theme-mode-icon-hover) !important;
    }
  }

  .active {
    background: #8c4e2d !important;
    color: var(--toggle-active-text) !important;
    border: $color-primary;

    &:hover {
      color: var(--toggle-active-text) !important;
    }
  }
}
</style>
