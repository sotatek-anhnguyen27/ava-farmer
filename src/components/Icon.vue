<template>
  <i
    class="iconfont"
    :class="`icon-${name}`"
    :style="size ? `font-size: ${size}px; line-height: ${size}px;` : ''"
  />
</template>

<script>
export default {
  props: ['name', 'size']
};
</script>

<style scoped lang="scss">
.iconfont {
  font-size: 16px;
  line-height: 16px;
  vertical-align: baseline;
}
.icon-close {
  color: rgba(0, 0, 0, 0.5);
}
.modal-select-token,
.modal-liquidity,
.modal-account {
  .icon-close {
    color: var(--text-color);
  }
}

.iconfont.icon-wallet {
  margin: 0 13px;
  line-height: 16px !important;
}

.icon-twitter,
.icon-discord {
  padding-top: 5px;
}
.icon-alarm {
  background-color: #fff;
}

.icon-add {
  font-family: $font-bold;
  font-size: 13px;
  margin-right: 10px;
}

.icon-remove {
  font-family: $font-bold;
  font-size: 13px;
  margin-right: 10px;
  line-height: 1;
}

.icon-lock,
.icon-unlock {
  color: $color-primary;
}

.icon-checkbox-off {
  color: var(--button-color-checkbox-create) !important;
}

.icon-warning {
  font-size: 22px;
  line-height: 22px;
}
</style>
