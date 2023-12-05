<template>
  <a :class="`checkbox ${_isThemeGame ? 'mb-2' : ''}`" style="cursor: inherit">
    <span @click="$emit('change')" style="cursor: pointer">
      <Icon
        class="checkbox"
        :name="checked ? 'checkbox-on' : 'checkbox-off'"
        size="24"
        v-if="!_isThemeGame"
      />
      <img
        v-if="_isThemeGame && !checked"
        src="~@/assets/icon/game/icon-checkbox.png"
        style="width: 20px"
      />
      <img
        v-if="_isThemeGame && checked"
        src="~@/assets/icon/game/icon-checked.png"
        style="width: 20px"
      />
    </span>
    <slot />
  </a>
</template>

<script>
export default {
  props: {
    checked: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style lang="scss">
.checkbox {
  .iconfont {
    color: $info;
  }

  &.error {
    .iconfont {
      color: $error;
    }
  }
}
</style>
