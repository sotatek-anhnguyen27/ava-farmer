<template>
  <UiModal :open="open" @close="$emit('close')" class="custom-token-modal">
    <div class="modal-body p-6 d-flex flex-items-center text-red ">
      <Icon v-if="!_isThemeGame" name="warning" class="icon-warning" />
      <img
        v-else
        src="~/@/assets/icon/game/error.png"
        style="width: 30px;"
        class="icon-warning"
      />
      <div
        :class="_isThemeGame ? 'game-noti' : ''"
        v-html="$t('highRiskPool')"
      />
    </div>
  </UiModal>
</template>

<script>
export default {
  props: ['open']
};
</script>
<style lang="scss">
.custom-token-modal {
  .shell {
    color: $error;
    background-color: #f7e3e2;
  }
}
.icon-warning {
  margin-right: 1.5rem;
}
@media (max-width: 768px) {
  .icon-close-modal {
    padding: 0.7rem !important;
  }
  .icon-warning {
    margin-right: 0.5rem;
  }
}

.game-noti {
  line-height: 2;
  padding-right: 30px;
  font-family: $font-forward;
  font-size: 10px;
}
</style>
