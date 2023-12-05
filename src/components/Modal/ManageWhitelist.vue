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
        <h3 v-text="$t('manageWhitelist')" class="title" />
      </template>
      <div class="text-center m-4">
        <h5
          class="px-4 mb-4 mx-auto overflow-hidden description manage-lp"
          :class="_isThemeGame && 'game'"
          style="max-width: 340px;"
        >
          {{ $t('addOrRemoveLP') }}
        </h5>
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
      <div
        class="d-flex flex-items-center mx-4 mb-4 warning-box p-3"
        :class="_isThemeGame && 'game-border-message-warning'"
      >
        <Icon v-if="!_isThemeGame" name="warning" size="22" class="mr-4" />
        <div v-text="$t('whitelistProxy')" />
      </div>

      <template slot="footer">
        <div class="footer">
          <UiButton
            @click="operation = 'add'"
            :disabled="loading || !input || !isValid"
            :loading="loading"
            type="submit"
            class="btn-setting btn-setting-confirm mx-1"
            :class="_isThemeGame ? 'game-border-btn-add' : ''"
          >
            {{ $t('add') }}
          </UiButton>
          <UiButton
            @click="operation = 'remove'"
            :disabled="loading || !input || !isValid"
            :loading="loading"
            type="submit"
            class="btn-setting btn-setting-confirm mx-1"
            :class="_isThemeGame ? 'game-border-btn-add' : ''"
          >
            {{ $t('remove') }}
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
      input: false,
      operation: false
    };
  },
  watch: {
    open() {
      this.loading = false;
      this.input = this.value;
      this.operation = '';
    }
  },
  computed: {
    isValid() {
      return isValidAddress(this.input);
    }
  },
  methods: {
    ...mapActions([
      'whitelistLiquidityProvider',
      'removeWhitelistedLiquidityProvider'
    ]),
    async handleSubmit() {
      this.loading = true;
      try {
        if (this.operation === 'add') {
          this.tx = await this.whitelistLiquidityProvider({
            poolAddress: this.pool.controller,
            provider: this.input
          });
        } else {
          this.tx = await this.removeWhitelistedLiquidityProvider({
            poolAddress: this.pool.controller,
            provider: this.input
          });
        }

        this.$emit('close');
      } catch (e) {
        console.error(e);
      }
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
.manage-lp {
  color: var(--tab-label-color);
}
.game-btn-input-2 {
  font-size: 12px !important;
  line-height: 1;
}
.warning-box.game-border-message-warning {
  background: $game-warning-bg-color !important;
  font-family: $font-forward;
  font-size: 12px;

  @media only screen and (max-width: 768px) {
    font-size: 10px;
  }
}
</style>
