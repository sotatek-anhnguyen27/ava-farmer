<template>
  <UiModal
    :open="open"
    @close="$emit('close')"
    style="max-width: 440px"
    class="modal-setting-pool"
    :class="_isThemeGame ? 'game' : ''"
  >
    <UiModalForm @submit="handleSubmit">
      <template slot="header">
        <h3 v-text="$t('editSwapFee')" class="edit-swap-fee-title" />
      </template>
      <div class="text-center content">
        <h5
          class="px-4 mb-4 mx-auto overflow-hidden description"
          :class="_isThemeGame && 'game'"
          style="max-width: 340px"
        >
          {{ $t('swapFeeLimits') }}
        </h5>
        <currency-input
          type="text"
          ref="number"
          class="h3 py-2 px-3 input text-center"
          placeholder="0.01"
          :class="
            `${isValid ? 'input-text' : 'text-red'} ${
              _isThemeGame
                ? 'game-btn-input-2 game-placeholder-small no-radius'
                : ''
            }`
          "
          value="0.15"
          step="0.01"
          min="0.01"
          max="10"
          :precision="18"
          v-model="input"
        />
      </div>
      <template slot="footer">
        <div class="footer">
          <UiButton
            :disabled="loading || !isValid || input === value"
            :loading="loading"
            type="submit"
            class="mx-1 btn-setting btn-setting-confirm"
            :class="
              `${_isThemeGame ? 'game-border-btn-add' : ''} ${(loading ||
                !isValid ||
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
import { clone } from '@/helpers/utils';
import CurrencyInput from '@/components/CurrencyInput.vue';
import BigNumber from 'bignumber.js';

export default {
  props: ['open', 'value', 'pool'],
  data() {
    return {
      loading: false,
      tx: null,
      input: ''
    };
  },
  components: {
    CurrencyInput
  },
  watch: {
    open() {
      this.loading = false;
      this.input = clone(this.value);
    }
  },
  computed: {
    isValid() {
      const swapFee = this.input;
      return !(
        !swapFee ||
        new BigNumber(swapFee).comparedTo(0.01) < 0 ||
        new BigNumber(swapFee).comparedTo(10) > 0
      );
    }
  },
  methods: {
    ...mapActions(['setSwapFee']),
    async handleSubmit() {
      this.loading = true;
      try {
        this.tx = await this.setSwapFee({
          poolAddress: this.pool.controller,
          newFee: this.input
        });
        this.$emit('reload');
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
.edit-swap-fee-title {
  color: var(--text-color);
}
.content {
  margin-bottom: 30px !important;
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
.game-btn-input-2 {
  font-size: 12px !important;
  line-height: 1;
}
</style>
