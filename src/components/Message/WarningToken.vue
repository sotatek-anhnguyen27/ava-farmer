<template>
  <div
    id="error"
    class="d-flex flex-items-center"
    :class="
      _isThemeGame ? 'game-border-message-warning-token p-2' : 'px-4 py-3'
    "
  >
    <div class="mr-2 margin">
      <div v-html="$t('tokenWarning1')" />
      <div class="mt-2" v-if="custom" v-html="$t('tokenWarning2')" />
    </div>
    <UiButton
      :class="
        `${
          _isThemeGame
            ? 'game-border-button-agree game-button-accept'
            : 'button-agree button-accept'
        }`
      "
      @click="$emit('accept')"
    >
      {{ $t('agree') }}
    </UiButton>
  </div>
</template>

<script>
export default {
  props: ['custom']
};
</script>

<style scoped lang="scss">
#error {
  border-radius: 5px;
  color: var(--color-warning-token);
  background: rgb(91, 123, 235, 0.15);
  margin-bottom: 10px;
}

#error.game-border-message-warning-token {
  background: $game-warning-token-bg-color !important;
  border-radius: 0px !important;
  font-family: $font-forward;
  font-size: 10px;

  @media only screen and (max-width: 768px) {
    margin-left: 8px !important;
    margin-right: 8px !important;
  }
}

.margin {
  margin-left: 5px;
}
.button-accept {
  width: 120px;
}

.game-button-accept {
  width: 100px;
  height: 40px;
  @media only screen and (max-width: 768px) {
    width: 90px !important;
    height: 30px !important;
  }
}

.d-flex {
  @media only screen and (max-width: 768px) {
    flex-direction: column;
  }
}

.flex-items-center {
  @media only screen and (max-width: 768px) {
    align-items: flex-start !important;
  }
}

.px-4 {
  @media only screen and (max-width: 768px) {
    padding-left: 10px !important;
    padding-right: 10px !important;
  }
}
</style>
