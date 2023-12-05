<template>
  <UiTableTr :to="{ name: 'pool', params: { id: pool.id } }">
    <div
      class="column-sm text-left hide-sm hide-md hide-lg mr-2"
      style="min-width:110px!important;"
    >
      {{ _shortenAddress(pool.id) }}
    </div>
    <div>
      <Pie :tokens="pool.tokens" class="mr-3" size="34" />
    </div>
    <div class="flex-auto text-left">
      <div class="d-flex flex-wrap" style="max-width: 420px;">
        <div
          v-for="token in pool.tokens"
          :key="token.address"
          :class="
            `${token.symbol.length > 14 &&
              `tooltipped tooltipped-n ${_isThemeGame ? 'game-tooltip' : ''}`} `
          "
          :aria-label="token.symbol"
          class="d-flex flex-items-center column-pool"
          style="margin-right:0px!important;"
        >
          <Icon name="bullet" size="16" :style="`color: ${token.color}`" />
          {{ _num(token.weightPercent / 100, 'percent-short') }}
          <span class="text-uppercase ml-2">{{
            _shorten(token.symbol, 7)
          }}</span>
        </div>
      </div>
    </div>
    <div class="d-flex justify-content-end">
      <UiNum
        :value="pool.swapFee"
        format="percent"
        class="token-column hide-sm hide-md"
      />
      <div
        v-text="_num(pool.liquidity, 'usd')"
        class="token-market-cap"
        style="width: 120px;"
      />
      <div
        v-text="_num(myLiquidity, 'usd')"
        format="currency"
        class="token-column hide-sm hide-md hide-lg"
      />
      <div
        v-text="_num(pool.lastSwapVolume, 'usd')"
        format="currency"
        class="token-column hide-sm hide-md hide-lg"
      />
    </div>
  </UiTableTr>
</template>

<script>
export default {
  props: ['pool'],
  computed: {
    myLiquidity() {
      const poolShares = this.subgraph.poolShares[this.pool.id];
      if (!poolShares) return 0;
      return (this.pool.liquidity / this.pool.totalShares) * poolShares;
    }
  }
};
</script>
