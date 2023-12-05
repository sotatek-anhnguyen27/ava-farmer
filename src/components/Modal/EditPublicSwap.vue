<template>
  <UiModal
    :open="open"
    @close="$emit('close')"
    style="max-width: 440px"
    class="modal-setting-pool edit-public-swap-form"
    :class="_isThemeGame ? 'game' : ''"
  >
    <UiModalForm @submit="handleSubmit">
      <template slot="header">
        <h3 v-text="$t('editPublicSwap')" class="edit-title" />
      </template>
      <div class="text-center content">
        <h5
          class="mx-auto overflow-hidden description"
          :class="_isThemeGame ? 'game' : ''"
          style="max-width: 340px"
        >
          {{ $t('enablePauseTrading') }}
        </h5>
        <div class="action">
          <div class="d-block h4 mb-3 action-label">
            {{ input ? `${$t('active')}` : `${$t('paused')}` }}
          </div>
          <VueSwitch v-model="input" :class="_isThemeGame ? 'game' : ''" />
        </div>
      </div>
      <template slot="footer">
        <div class="footer">
          <UiButton
            :disabled="loading || input === value"
            :loading="loading"
            type="submit"
            class="mx-1 btn-setting btn-setting-confirm"
            :class="
              `${_isThemeGame ? 'game-border-btn-add' : ''} ${(loading ||
                input === value) &&
                'disable'}`
            "
          >
            {{ $t('confirm') }}
          </UiButton>
          <UiButton
            @click="$emit('close')"
            type="button"
            class="mx-1 btn-setting btn-setting-cancel"
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
  methods: {
    ...mapActions(['setPublicSwap']),
    async handleSubmit() {
      this.loading = true;
      try {
        this.tx = await this.setPublicSwap({
          poolAddress: this.pool.controller,
          publicSwap: this.input
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
.edit-public-swap-form {
  .edit-title {
    color: var(--text-color);
  }
  .disable {
    opacity: 0.3;
  }
  .content {
    color: var(--color-plachoder-search);
  }
  .footer {
    padding-bottom: 40px;
  }
  .action {
    margin-top: 40px !important;
    margin-bottom: 30px !important;
  }
  .action-label {
    text-transform: capitalize;
  }
}
</style>
