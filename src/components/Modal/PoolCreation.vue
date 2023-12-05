<template>
  <UiModal
    :open="open"
    @close="$emit('close')"
    style="max-width: 600px;"
    :class="`modal-create-pool ${_isThemeGame ? 'game' : ''}`"
  >
    <div class="modal-body p-6 text-create">
      <div class="mb-2">
        {{ $t('beforeCreatingPre') }} {{ type.toLowerCase() }}
        {{ $t('beforeCreatingPost') }}:
      </div>
      <div v-for="(value, index) in values" :key="index">
        <b>{{ value }}</b>
      </div>
      <div class="mt-2">
        {{ $t('vulnerablePre') }} {{ type.toLowerCase()
        }}{{ $t('vulnerableMid') }}
        <Icon name="lock" size="16" />
        {{ $t('vulnerablePost') }}.
      </div>
      <div class="mt-2" v-html="$t('disclaimer')"></div>
      <div class="mt-4 d-flex flex-items-center flex-justify-center">
        <UiButton
          :class="`button-continue ${_isThemeGame ? 'game-button' : ''}`"
          @click="[$emit('create'), $emit('close')]"
        >
          {{ $t('continue') }}
        </UiButton>
      </div>
    </div>
  </UiModal>
</template>

<script>
export default {
  props: ['open', 'padlock', 'tokens', 'amounts', 'weights'],
  computed: {
    type() {
      return this.padlock ? this.$t('price') : this.$t('amount');
    },
    values() {
      if (this.padlock) {
        return this.tokens.map(token => {
          const symbol = this._ticker(token);
          const price = this._num(this.price.values[token] || 0, 'usd');
          return `1 ${symbol} = ${price}`;
        });
      } else {
        return this.tokens.map(token => {
          const symbol = this._ticker(token);
          const amount = this._num(this.amounts[token]);
          const weight = this._num(this.getRelativeWeight(token), 'percent');
          return `${amount} ${symbol} (${weight})`;
        });
      }
    }
  },
  methods: {
    getRelativeWeight(tokenAddress) {
      const absoluteWeight = this.weights[tokenAddress];
      const totalWeight = this.tokens.reduce((acc, val) => {
        const weight = parseFloat(this.weights[val]) || 0;
        return acc + weight;
      }, 0);
      if (!absoluteWeight || !totalWeight) {
        return 0;
      }
      return absoluteWeight / totalWeight;
    }
  }
};
</script>

<style lang="scss" scoped>
.button-continue {
  background: var(--btn-color-primary);
  border: none;
  box-sizing: border-box;
  border-radius: 100px;
  color: var(--button-enabled-text);
  font-family: $font-bold;
  font-size: 16px;
  text-align: center;
  text-transform: capitalize;
  &:hover {
    background: $btn-bg-hover-color;
  }
}

.text-create {
  color: var(--text-color);
}

.button-continue.game-button {
  border-radius: 0 !important;
  font-family: $font-forward;
  height: inherit !important;
  margin-top: 20px;

  &:hover {
    background: $game-btn-hover-color;
  }
}

.modal-create-pool.game {
  max-width: inherit !important;
}
</style>
