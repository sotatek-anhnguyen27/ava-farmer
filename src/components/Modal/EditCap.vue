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
        <h3 v-text="$t('editCap')" class="title" />
      </template>
      <div class="text-center m-4">
        <h5
          class="px-4 mb-4 mx-auto overflow-hidden description"
          style="max-width: 340px;"
        >
          {{ $t('changePoolSupplyCap') }}
        </h5>
        <div class="text-center m-4 mt-0">
          <Toggle
            :value="type"
            :options="capInputOptions"
            @select="handleSelectType"
            class="mt-4"
          />
        </div>
        <input
          type="number"
          class="h3 py-2 px-3 input text-center"
          placeholder="100"
          :class="
            `${isValid ? 'input-text' : 'text-red'} ${
              _isThemeGame
                ? 'game-btn-input-2 game-placeholder-small no-radius'
                : ''
            }`
          "
          :min="0"
          :step="1"
          :disabled="'UNLIMITED' == this.type"
          v-model="input"
        />
      </div>
      <template slot="footer">
        <div class="footer">
          <UiButton
            :disabled="loading || (input === value && 'NUMERIC' == type)"
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
            class="mx-2 btn-setting-cancel btn-setting"
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
import { validateNumberInput, ValidationError } from '@/helpers/validation';
import { MAX, capInputOptions } from '@/helpers/utils';

export default {
  props: ['open', 'value', 'pool'],
  data() {
    return {
      loading: false,
      input: false,
      type: false,
      capInputOptions
    };
  },
  watch: {
    open() {
      this.loading = false;
      this.input = this.value === MAX ? '' : this.value.replace('.0', '');
      this.type = this.value === MAX ? 'UNLIMITED' : 'NUMERIC';
    }
  },
  computed: {
    isValid() {
      const error = validateNumberInput(this.input);
      // For some reason "0" returns NOT_A_NUMBER; expected NOT_POSITIVE
      return (
        error === ValidationError.NONE || error === ValidationError.NOT_A_NUMBER
      );
    }
  },
  methods: {
    ...mapActions(['setCap']),
    async handleSubmit() {
      this.loading = true;
      try {
        this.tx = await this.setCap({
          poolAddress: this.pool.controller,
          newCap: 'UNLIMITED' == this.type ? MAX.toString() : this.input
        });
        this.$emit('close');
      } catch (e) {
        console.error(e);
      }
      this.loading = false;
    },
    handleSelectType(type) {
      this.type = type;
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
</style>
