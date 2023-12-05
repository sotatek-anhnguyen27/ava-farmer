<template>
  <UiModal
    :open="open"
    @close="close"
    style="max-width:500px;"
    :class="`modal-test-nest-warning ${_isThemeGame ? 'game' : ''}`"
  >
    <div class="modal-body">
      <div
        class="description text-center"
        :class="_isThemeGame ? 'game-theme' : ''"
      >
        <div class="warning-message">
          <Icon name="info" size="22" class="icon-warning" />
          <div class="message">
            {{ $t('KovanTestNetworkWarning') }}
          </div>
        </div>
        <br />
        <a
          class="get-buni-link"
          href="https://faucet.buni.finance/"
          target="_blank"
          >{{ $t('getFreeBuni') }}</a
        >
      </div>
    </div>
  </UiModal>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  props: ['open'],
  methods: {
    ...mapActions(['closeTestnetWarningModal']),

    close() {
      this.closeTestnetWarningModal();
    }
  }
};
</script>

<style lang="scss" scoped>
.modal-test-nest-warning.game {
  max-width: inherit !important;
  line-height: 28px;
}
.icon-warning {
  color: $warning;
  display: inline-block;
  margin-right: 8px;
  margin-bottom: 2px;
  @media only screen and (max-width: 768px) {
    margin-bottom: 8px;
  }
}
.message {
  display: inline-block;
}
.description {
  width: calc(100% - 32px);
  font-size: 14px;
  margin: 16px;
  color: var(--text-color);
}
.game-theme {
  padding-right: 46px;
  @media only screen and (max-width: 768px) {
    padding-right: 0;
  }
}
.warning-message {
  display: inline;
}
.get-buni-link {
  color: $color-primary;
}
</style>
