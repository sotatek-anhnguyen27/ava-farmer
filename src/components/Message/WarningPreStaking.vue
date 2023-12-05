<template>
  <div
    id="warning"
    class="d-flex p-3 text-left"
    :class="_isThemeGame && 'game-border-message-warning'"
  >
    <div class="gift-box-icon">
      <img src="~/@/assets/icon/giftBox.svg" style="width: inherit;" />
    </div>
    <div>
      <span v-html="$t('prestakingWarning')" /><a
        href="https://blog.buni.finance/bunicorn-mainnet-launch-incentivized-liquidity-bootstrapping-program-announcement-69dac1ecc501"
        target="_blank"
        style="color: inherit; text-decoration:underline;"
        ><span v-html="$t('prestakingWarningLink')"
      /></a>
      <a
        href="https://blog.buni.finance/bunicorn-mainnet-launch-incentivized-liquidity-bootstrapping-program-announcement-69dac1ecc501"
        target="_blank"
        style="color: inherit;"
      >
        <Icon
          v-if="!_isThemeGame"
          name="external-link"
          size="12"
          class="ml-1 icon-link"
        />
        <img
          v-else
          src="~/@/assets/icon/game/link.png"
          class="icon-link-game"
        />
      </a>
    </div>
  </div>
</template>

<script>
export default {
  props: ['question', 'linkText']
};
</script>

<style scoped lang="scss">
#warning {
  border-radius: 5px;
  background: linear-gradient(81.63deg, #3990f8 1.42%, #3f5fcf 100%);
  color: white;
  font-family: $font-weight-semibold;
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 10px;
  align-items: center;
  @media only screen and (max-width: 768px) {
    align-items: flex-start !important;
  }
}

#warning.game-border-message-warning {
  background: linear-gradient(81.63deg, #3990f8 1.42%, #3f5fcf 100%) !important;
  box-shadow: 3px 0 #b9d1ff, -3px 0 #b9d1ff, 0 -3px #b9d1ff, 0 3px #b9d1ff,
    6px 0 #a9bade, -6px 0 #a9bade, 0 -6px #a9bade, 0 6px #a9bade,
    0 0 0 3px #a9bade !important;
  border-radius: 0px !important;
  font-family: $font-forward;
  font-size: 10px;

  @media only screen and (max-width: 768px) {
    margin-left: 8px !important;
    margin-right: 8px !important;
  }
}

.gift-box-icon {
  padding: 6px 22px 6px 6px;
  @media only screen and (max-width: 768px) {
    width: 33.35px;
    margin-right: 22px;
  }
}
</style>
