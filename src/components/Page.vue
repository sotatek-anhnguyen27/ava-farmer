<template>
  <div class="px-0 px-md-5 py-4">
    <UiLoadingPage
      v-if="loading || (requireLogin && ui.authLoading)"
      class="big py-3"
    />
    <Block
      v-else-if="
        requireLogin && (!isAuthenticated || !this.$store.state.account.address)
      "
      :class="
        `p-4 text-center block-notification ${
          _isThemeGame ? 'game-border-table' : ''
        }`
      "
    >
      <h4 :class="`text-notification ${_isThemeGame ? 'game' : ''}`">
        {{ $t('notificationNeedConnect') }}
      </h4>
    </Block>
    <slot v-else />
  </div>
</template>

<script>
export default {
  props: {
    loading: Boolean,
    requireLogin: Boolean
  }
};
</script>
<style scoped lang="scss">
.text-notification {
  color: var(--text-color);
}

.block-notification {
  border: 1px solid var(--border-color) !important;
  margin: 0 25px;
}
</style>
