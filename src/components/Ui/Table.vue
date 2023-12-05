<template>
  <div
    :class="
      `rounded-0 rounded-md-1 table  ${_isThemeGame ? 'game-border-table' : ''}`
    "
  >
    <slot />
  </div>
</template>
<style lang="scss" scoped>
.table {
  max-height: 100% !important;
  height: inherit;
  box-shadow: 0 0 5px var(--border-table);
  border-radius: 15px 15px 15px 15px !important;
}
.table.table-farm {
  width: 100%;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2) !important;
  border-radius: 15px !important;
  @media only screen and (max-width: 768px) {
    border-radius: 0 !important;
  }
}
.table-liquidity,
.custom-table {
  box-shadow: none !important;
}
.custom-table {
  border: 1px solid var(--color-border);
}

.game-border-table {
  border-radius: 0 !important;
  width: calc(100% - 12px) !important;
}

@mixin game-border-style($width, $color, $bgcolor) {
  box-shadow: $width 0 $bgcolor, -$width 0 $bgcolor, 0 (-$width) $bgcolor,
    0 $width $bgcolor, 2 * $width 0 $color, -2 * $width 0 $color,
    0 (-2 * $width) $color, 0 2 * $width $color, 0 0 0 $width $color !important;
  //margin: 2 * $width;
}

.table-liquidity.game-border-table,
.table-farm.game-border-table {
  @include game-border-style(3px, #fff, #878787);
  border-radius: 0 !important;
}

@media only screen and (max-width: 768px) {
  .router-table {
    .table {
      border-radius: 0 !important;
    }
  }

  .table.table-pools {
    border-radius: 0 !important;
  }
}
</style>
