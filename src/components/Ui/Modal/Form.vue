<template>
  <form
    @submit.prevent="$emit('submit')"
    class="d-flex flex-column overflow-hidden"
  >
    <div v-if="$slots.header" class="p-4 text-center form-search">
      <slot name="header" />
    </div>
    <div class="modal-body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="text-center">
      <slot name="footer" />
    </div>
  </form>
</template>

<style scoped lang="scss">
.modal-select-token {
  .form-search {
    background-color: var(--color-table-pooloverviwe);
    padding-bottom: 20px !important;
  }
}

.modal-select-token.game-modal-select-token,
.modal-wrapper.game,
.modal-setting-pool.game {
  .form-search {
    background-color: #ff9342 !important;
    position: relative;
    z-index: 1;

    &:after {
      content: '';
      height: 65%;
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

.modal-wrapper.game {
  .form-search {
    padding-bottom: 30px !important;
    padding-top: 30px !important;
  }
}

.text-header-wrapper {
  .form-search {
    color: var(--text-color) !important;
    font-family: $font-bold;
    font-size: 22px !important;
    line-height: 35px;
    text-align: start !important;
    padding-bottom: 0px !important;
    background: var(--swap-btn-background);
    padding-left: 40px !important;
    padding-top: 20px !important;
    padding-bottom: 20px !important;
  }
}

.text-header-activity {
  .form-search {
    color: var(--text-color) !important;
    font-family: $font-bold;
    font-size: 22px !important;
    line-height: 35px;
    text-align: start !important;
    padding-bottom: 0px !important;
    background: var(--swap-btn-background);
    padding-left: 40px !important;
    padding-top: 20px !important;
    padding-bottom: 20px !important;
  }
}
</style>
