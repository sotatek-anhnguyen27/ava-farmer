<template>
  <button @click="$emit('click')" class="button" :disabled="loading">
    <UiLoading v-if="loading" />
    <slot v-else />
  </button>
</template>

<script>
export default {
  props: {
    loading: Boolean
  }
};
</script>

<style lang="scss">
.button {
  background-color: var(--secondary-button-background);
  color: var(--secondary-button-text);
  border: 1px solid var(--secondary-button-border);
  border-radius: 22px;
  padding: 0 22px;
  outline: none;
  height: 44px;
  margin: 0;

  &:hover {
    background-color: $color-button-hover;
    color: #ffff;
  }

  &:disabled {
    background: $button-disabled;
    border: 1px solid $button-disabled;
    color: $button-disabled-text;
    cursor: not-allowed;
  }

  &.button-sm {
    font-size: 12px;
    border-radius: 19px;
    padding: 0 14px;
    height: 36px;
    line-height: 34px;
  }

  &.button-primary {
    background-color: $primary-button-background;
    color: $primary-button-text;
    border-color: $primary-button-border;

    &:hover {
      background-color: $color-button-hover;
    }

    &:disabled {
      background: $button-disabled;
      border: none;
      box-sizing: border-box;
      border-radius: 100px;
      color: var(--button-disabled-text);
      cursor: not-allowed;
      font-family: $font-bold;
      font-size: 20px;
      text-align: center;
      height: 55px;
      padding: 0 55px;
    }
  }

  &.button-red {
    border-color: $error;
    color: $error;
  }

  &.button-agree {
    background: var(--color-background-warning-token);
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.15);
    border-radius: 100px;
    color: var(--color-text-button-agree);
    border: none;

    &:hover {
      color: var(--color-text-button-agree-hover) !important;
    }

    @media (max-width: 767px) {
      max-width: 100px;
      height: 40px !important;
      margin-top: 10px;
    }
  }

  &.game-border-button-agree {
    background: var(--color-background-warning-token);
    box-shadow: none;
    border-radius: 0px;
    color: var(--color-text-button-agree);
    border: none;

    &:hover {
      color: var(--color-text-button-agree-hover) !important;
    }

    @media (max-width: 767px) {
      max-width: 100px;
      height: 40px;
      margin-top: 10px;
    }
  }

  &.notification-error {
    color: $secondary-button-text;
    font-family: $font-bold;
    font-style: normal;
    font-size: 16px;
    line-height: 20px;
    background: $color-background-noti-fail;
    border: none !important;
    border-radius: 0 !important;
    @media only screen and (max-width: 768px) {
      padding: 0 !important;
      margin-right: 10px;
      font-size: 13px !important;
    }
  }

  &.game-notification-error {
    color: $secondary-button-text;
    font-family: $font-forward;
    font-style: normal;
    font-size: 10px;
    line-height: 20px;
    background: $game-noti-red-bg-color;
    border: none !important;
    border-radius: 0 !important;

    @media only screen and (max-width: 768px) {
      height: 50px;
      padding: 5px 0 !important;
      padding-right: 0 !important;
      margin-right: 10px !important;
    }
  }

  &.notification-success {
    color: $secondary-button-text;
    font-family: $font-bold;
    font-style: normal;
    font-size: 16px;
    line-height: 20px;
    background: $color-background-noti-success;
    border: none !important;
    border-radius: 0 !important;
    @media only screen and (max-width: 768px) {
      padding: 0 !important;
      margin-right: 10px;
      font-size: 13px !important;
    }
  }

  &.game-notification-success {
    color: $secondary-button-text;
    font-family: $font-forward;
    font-style: normal;
    font-size: 10px;
    line-height: 20px;
    background: $game-noti-green-bg-color;
    border: none !important;
    border-radius: 0 !important;

    @media only screen and (max-width: 768px) {
      font-size: 10px !important;
      height: 50px;
      padding: 5px 0 !important;
      padding-right: 0 !important;
      margin-right: 10px !important;
    }
  }
}
</style>
