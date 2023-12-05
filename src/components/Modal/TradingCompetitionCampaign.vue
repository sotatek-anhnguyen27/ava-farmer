<template>
  <UiModal
    :open="open"
    @close="close"
    style="max-width:520px;"
    :class="`modal-test-nest-warning ${_isThemeGame ? 'game' : ''}`"
  >
    <div class="modal-body">
      <div
        class="description text-center"
        :class="_isThemeGame ? 'game-theme' : ''"
      >
        <div class="warning-message">
          <Icon name="info" size="22" class="icon-warning" />
          <div class="message" style="font-size: 13px">
            {{ $t('tradingCompetition') }}
          </div>
        </div>
        <br />
        <a
          class="get-buni-link"
          href="https://medium.com/m/global-identity?redirectUrl=https%3A%2F%2Fblog.buni.finance%2Fbunicorn-trading-competition-buni-traders-lets-warm-up-2dca4108cfe9"
          target="_blank"
          >{{ $t('moreInformation') }}</a
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
    ...mapActions(['closeTradingCompetitionCampaign']),

    close() {
      this.closeTradingCompetitionCampaign();
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
