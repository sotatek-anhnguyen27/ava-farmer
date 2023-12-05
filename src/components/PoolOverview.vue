<template>
  <div
    :class="
      `p-4 rounded-0 rounded-md-1 panel-background ${
        _isThemeGame ? 'game-border-table' : ''
      }`
    "
  >
    <div
      v-text="$t('poolOverview')"
      class="eyebrow mb-4"
      :class="_isThemeGame && 'game-font-size'"
    />
    <div class="text" :class="_isThemeGame && 'game-font-size'">
      {{ _shortenAddress(pool.id) }}
    </div>
    <div
      v-if="userShare"
      class="text"
      :class="_isThemeGame && 'game-font-size'"
    >
      {{ $t('myShare') }}:
      {{ _checkMyPoolSharePercent(userShare.current) }}
      <span
        v-if="userShare.future || userShare.future === 0"
        v-text="`→ ${_checkMyPoolSharePercentResult(userShare.future)}`"
      />
    </div>
    <div
      v-if="!forKurve"
      class="text"
      :class="_isThemeGame && 'game-font-size'"
    >
      {{ $t('swapFee') }}: {{ _num(pool.swapFee, 'percent') }}
    </div>
    <div
      v-if="forKurve && poolShare"
      class="text"
      :class="_isThemeGame && 'game-font-size'"
    >
      {{ $t('myStake') }}: {{ poolShare }}
    </div>
    <div class="text-center" :class="_isThemeGame && 'game-font-size'">
      <Pie :tokens="pool.tokens" size="100" class="mt-3 mb-2" />
    </div>
    <div
      v-for="token in pool.tokens"
      :key="token.address"
      class="mt-1 text-token"
      :class="_isThemeGame && 'game-font-size'"
    >
      <Icon name="bullet" size="16" :style="`color: ${token.color}`" />
      {{ _num(token.weightPercent / 100, 'percent') }}
      <span class="text-uppercase">{{ _shorten(token.symbol, 12) }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: ['pool', 'userShare', 'forKurve', 'poolShare']
};
</script>

<style scoped lang="scss">
.text {
  font-size: 14px;
  line-height: 22px;
  text-align: center;
  text-transform: capitalize;
  opacity: 0.7;
  color: var(--text-color-liquidity);
}

.text-token {
  font-size: 14px;
  line-height: 25px;
  text-transform: capitalize;
  color: var(--text-color-liquidity);
  opacity: 0.7;
}

.panel-background {
  background-color: var(--color-table-pooloverviwe);
}

.game-font-size {
  font-size: 10px !important;
  font-family: $font-forward;
}
</style>
