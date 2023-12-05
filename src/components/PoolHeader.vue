<template>
  <div
    v-if="pool"
    class="d-block text-center text-md-left d-md-flex col-md-4 main-info"
  >
    <div :class="`'pt-1' ${_isThemeGame && 'game-pb'}`">
      <Token
        v-if="forKurve || (!forKurve && pool.isWhitelisted())"
        :custom="true"
        :address="forKurve ? pool.shortenAddress : pool.getBptAddress()"
        size="60"
        class="mr-0 mr-md-3"
      />
      <Pie
        :tokens="pool.metadata.tokens"
        size="66"
        class="mr-0 mr-md-3"
        style=""
        v-else
      />
    </div>
    <div>
      <a
        :href="
          _etherscanLink(
            forKurve ? pool.shortenAddress : pool.getBptAddress(),
            'token'
          )
        "
        target="_blank"
        class="color"
      >
        <span
          v-if="
            forKurve || (!forKurve && (pool.config.name || pool.metadata.name))
          "
          v-text="
            forKurve
              ? pool.name
              : _shorten(pool.config.name || pool.metadata.name, 24)
          "
          :class="_isThemeGame ? 'game-metadata-name' : 'metadata-name'"
        />
        <span v-else>
          {{ $t('pool') }} {{ _shortenAddress(pool.address) }}
        </span>
        <span
          v-if="
            forKurve ||
              (!forKurve && (pool.config.symbol || pool.metadata.symbol))
          "
          v-text="
            forKurve
              ? `(${pool.symbol})`
              : `(${_shorten(pool.config.symbol || pool.metadata.symbol)})`
          "
          class="ml-1 "
          :class="_isThemeGame ? 'game-metadata-name' : 'metadata-name'"
        />
        <Icon
          v-if="!_isThemeGame"
          name="external-link"
          size="16"
          class="ml-1 mr-2"
          :class="_isThemeGame ? 'game-metadata-name' : 'metadata-name'"
        />
        <img
          v-else
          src="~/@/assets/icon/game/link.png"
          class="icon-link-game"
        />
      </a>
      <UiLabel
        v-if="!forKurve && !pool.metadata.finalized"
        v-text="pool.getTypeStr()"
        :class="_isThemeGame ? 'game-border-smart-pool' : 'pool-label'"
      />
      <div
        :class="_isThemeGame ? 'game-price' : 'price'"
        v-text="_num(forKurve ? pool.lpPrice : pool.getBptPrice(), 'usd-long')"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    pool: {
      type: Object,
      required: true
    },
    forKurve: {
      type: Boolean,
      default: false
    }
  }
};
</script>
<style lang="scss" scoped>
.price {
  color: var(--secondary-text-color);
  font-size: $font-size-large;
}

.game-price {
  color: var(--secondary-text-color);
  font-size: 14px;
  padding-top: 10px;
}
.metadata-name {
  font-size: 15px;
  color: var(--link-color) !important;
}

.game-metadata-name {
  font-size: 12px;
  color: var(--link-color) !important;
}
.pool-label {
  background: $counter-bg-color !important;
  border: 1px solid $counter-bg-color !important;
  box-sizing: border-box !important;
  border-radius: 10px !important;
  color: var(--pool-label-text) !important;
  margin-top: -3px;
  height: 24px !important;
  line-height: 22px !important;

  &:hover.Label {
    background: $counter-bg-color !important;
    border: 1px solid $counter-bg-color !important;
  }
}
.main-info {
  display: flex;
  align-items: center;
  padding: 0;
}

.color {
  color: var(--link-color) !important;
}

.game-border-smart-pool {
  line-height: 18px !important;
}

@media only screen and (max-width: 768px) {
  .main-info {
    width: 90vw;
    padding-bottom: 20px;
    margin: 0 auto;
    border-bottom: 1px solid var(--border-input);
  }

  .game-pb {
    padding-bottom: 15px;
  }
  .game-border-smart-pool {
    width: 80px !important;
    line-height: 14px !important;
  }
}
</style>
