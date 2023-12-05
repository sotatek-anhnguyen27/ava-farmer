<template>
  <UiModal
    :open="open"
    @close="$emit('close')"
    style="max-width: 440px;"
    class="modal-setting-pool"
    :class="_isThemeGame ? 'game' : ''"
  >
    <UiModalForm @submit="handleSubmit">
      <template slot="header">
        <h3 v-text="$t('editController')" class="title" />
      </template>
      <div class="text-center m-4">
        <h5
          class="px-4 mb-4 mx-auto overflow-hidden description"
          :class="_isThemeGame && 'game'"
          style="max-width: 340px;"
        >
          {{ $t('changePoolController') }}
        </h5>
        <div
          class="d-flex flex-items-center p-2 warning-box text-left mb-4"
          :class="_isThemeGame && 'game-border-message-warning'"
        >
          <Icon v-if="!_isThemeGame" name="warning" size="22" class="mr-4" />
          <img
            v-else
            src="~/@/assets/icon/game/warning.png"
            style="width: 30px;"
            class="mr-4 text game-text"
          />
          <div v-html="$t('changeControllerWarning')" />
        </div>
        <input
          class="h3 py-2 px-3 input text-center"
          :class="
            `${isValid ? 'input-text' : 'text-red'} ${
              _isThemeGame
                ? 'game-btn-input-2 game-placeholder-small no-radius'
                : ''
            }`
          "
          v-model="input"
        />
      </div>
      <template slot="footer">
        <div class="footer">
          <UiButton
            :disabled="loading || input === value || !input"
            :loading="loading"
            type="submit"
            class="btn-setting-confirm btn-setting"
            :class="_isThemeGame ? 'game-border-btn-add' : ''"
          >
            {{ $t('confirm') }}
          </UiButton>
          <UiButton
            @click="$emit('close')"
            type="button"
            class="mx-1 btn-setting-cancel btn-setting"
            :class="_isThemeGame ? 'game-border-btn-add' : ''"
          >
            {{ $t('cancel') }}
          </UiButton>
        </div>
      </template>
    </UiModalForm>
  </UiModal>
</template>

<script>
import { mapActions } from 'vuex';
import { isValidAddress } from '@/helpers/utils';

export default {
  props: ['open', 'value', 'pool'],
  data() {
    return {
      loading: false,
      input: false
    };
  },
  watch: {
    open() {
      this.loading = false;
      this.input = this.value;
    }
  },
  computed: {
    isValid() {
      return isValidAddress(this.input);
    }
  },
  methods: {
    ...mapActions(['setController']),
    async handleSubmit() {
      this.loading = true;
      try {
        this.tx = await this.setController({
          poolAddress: this.pool.controller,
          newController: this.input
        });
      } catch (e) {
        console.error(e);
      }
      this.$emit('close');
      this.loading = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.title {
  color: var(--text-color) !important;
}

.footer {
  padding-bottom: 40px;
}

.input-text {
  color: var(--text-color);
}

.description {
  color: var(--text-btn-search);
}

.warning-box.game-border-message-warning {
  background: $game-warning-bg-color !important;
  font-family: $font-forward;
  font-size: 12px;

  @media only screen and (max-width: 768px) {
    font-size: 10px;
  }
}

.game-btn-input-2 {
  font-size: 12px !important;
  line-height: 1;
}
</style>
