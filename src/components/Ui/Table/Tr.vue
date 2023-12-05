<template>
  <div class="rows">
    <router-link
      v-if="to"
      :to="to"
      :class="
        `line v-align-middle px-4 py-3 highlight d-flex  ${
          _isThemeGame ? 'line-game' : ''
        }`
      "
    >
      <slot />
    </router-link>
    <div
      v-else
      :class="`line px-4 py-3 d-flex ${_isThemeGame ? 'line-game' : ''}`"
    >
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: ['to']
};
</script>

<style scoped lang="scss">
.rows {
  background: var(--panel-background);
}
.line {
  display: flex;
  align-items: center;
  color: var(--text-color);
  text-align: right;
  font-size: 15px;
  font-family: $font-bold;

  &:hover {
    background: $line-hover-color !important;
  }
}
.body {
  border: 1px solid rgba($color: #000000, $alpha: 0.3);
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  box-sizing: none;
}
span {
  overflow: hidden;
}

.table-pools {
  .rows {
    &:last-child {
      border-bottom-left-radius: 15px;
      border-bottom-right-radius: 15px;
      .line {
        border-bottom-left-radius: 15px;
        border-bottom-right-radius: 15px;
      }
    }
  }

  .line {
    border-bottom: 1px solid var(--color-border);
  }
}

.table-create-pools {
  .rows.last-child {
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;

    .line {
      border-bottom-left-radius: 15px;
      border-bottom-right-radius: 15px;
    }
  }

  .line {
    border-top: 1px solid var(--color-border);
  }
}

.table-details,
.table-wallet {
  .rows {
    border-bottom: 1px solid var(--color-border) !important;
    &:last-child {
      border-bottom-left-radius: 15px;
      border-bottom-right-radius: 15px;
      border-bottom: none !important;
      .line {
        border-bottom-left-radius: 15px;
        border-bottom-right-radius: 15px;
        &:hover {
          .btn-wrap {
          }
        }
      }
    }
  }
}

.details-balances {
  .rows {
    border-bottom: 1px solid var(--color-border) !important;
    &:last-child {
      border-bottom-left-radius: 15px;
      border-bottom-right-radius: 15px;
      border-bottom: none !important;
      .line {
        border-bottom-left-radius: 15px;
        border-bottom-right-radius: 15px;
      }
    }
  }
}

.pool-rows {
  .rows {
    border-bottom: 1px solid var(--color-border) !important;
    &:last-child {
      border-bottom-left-radius: 15px;
      border-bottom-right-radius: 15px;
      border-bottom: none !important;
      .line {
        border-bottom-left-radius: 15px;
        border-bottom-right-radius: 15px;
      }
    }
  }
}

.custom-table {
  .rows {
    border-bottom: 1px solid var(--color-border) !important;

    &:last-child {
      border-bottom: none !important;
    }
  }
}

.table-farm {
  .rows {
    border-bottom: 1px solid var(--color-border) !important;

    &:first-child {
      border-top-left-radius: 15px;
      border-top-right-radius: 15px;
    }
    &:last-child {
      border-bottom: none !important;
      border-bottom-left-radius: 15px;
      border-bottom-right-radius: 15px;
    }
  }

  .line {
    background: none !important;
  }
}

.table-liquidity {
  box-shadow: none !important;
  .line {
    padding: 0 20px !important;
  }

  @media only screen and (max-width: 768px) {
    padding: 0 10px !important;

    .line {
      padding: 0 10px !important;
    }
  }
}

@media only screen and (max-width: 768px) {
  .table-wallet,
  .table-details {
    border-radius: 0 !important;
    .line {
      padding: 10px !important;
      font-size: 13px;
    }
    .rows {
      &:last-child {
        border-radius: 0 !important;
        .line {
          border-radius: 0 !important;
        }
      }
    }
  }
  .table-pools,
  .details-balances {
    .line,
    .rows {
      border-radius: 0 !important;
    }
  }

  .custom-table {
    .line {
      padding: 10px !important;
    }
  }
}

.table-create-pools.game-border-table {
  .line-game {
    border-top: 3px solid #878787 !important;
  }
}

.game-border-table {
  .rows {
    &:last-child {
      border-radius: 0 !important;

      .line {
        border-radius: 0 !important;
      }
    }
  }

  .line-game {
    border-bottom: 3px solid #878787 !important;
    font-size: 11px;
    line-height: 20px;
    font-family: $font-forward;
  }
}

.game-border-table.table-wallet,
.table-create-pools.game-border-table,
.table-pools.game-border-table,
.table-liquidity.game-border-table,
.table-farm.game-border-table,
.table-details.game-border-table,
.table-pool-setting {
  .rows {
    &:last-child {
      .line {
        border-bottom: 0 !important;
      }
    }
  }
}

.game-border-table.details-balances {
  .rows {
    border-bottom: 3px solid #878787 !important;
  }

  .rows {
    &:last-child {
      border-bottom: 0 solid #878787 !important;
    }
  }
}
</style>
