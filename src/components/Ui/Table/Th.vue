<template>
  <div class="d-flex flex-items-center px-4 text-right header-border">
    <slot />
  </div>
</template>

<script>
export default {
  props: ['to']
};
</script>
<style scoped lang="scss">
.header-border {
  border: 1px solid var(--color-border);
  box-sizing: border-box;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  padding: 10px 0;
  color: var(--text-btn);
  background-color: var(--panel-background);
}

.game-border-table {
  .header-border {
    border-bottom: 3px solid #878787 !important;
    font-size: 10px !important;
    font-family: $font-forward;

    .text {
      font-size: 10px !important;
      font-family: $font-forward;
    }
  }
}

.game-border-table.table-create-pools {
  .header-border {
    border-bottom: 0 !important;
  }
}

.game-border-table {
  .table-liquidity.header-border {
    border-bottom: 0 !important;
  }
  margin-bottom: 20px !important;
}

.table-liquidity {
  padding: 0 20px !important;
  text-align: start !important;
  box-shadow: none !important;

  @media only screen and (max-width: 768px) {
    padding: 0 10px !important;
  }

  .header-border {
    @media only screen and (max-width: 768px) {
      padding-right: 10px !important;
      padding-left: 10px !important;
    }
  }
}

.table-pools,
.table-wallet,
.custom-table {
  .header-border {
    border: 0;
    border-bottom: 1px solid var(--color-border);
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
  }
}

.table-details {
  .header-border {
    border-top: none;
    border-right: none;
    border-left: none;
    border-top-right-radius: 15px;
    border-top-left-radius: 15px;
  }
}

.table-create-pools {
  .header-border {
    border-top: none;
    border-right: none;
    border-left: none;
    border-bottom: none;
    border-top-right-radius: 15px !important;
    border-top-left-radius: 15px !important;
  }
}

.details-balances {
  .header-border {
    border-top: none;
    border-right: none;
    border-left: none;
    border-top-right-radius: 15px;
  }
}

@media only screen and (max-width: 768px) {
  .router-table,
  .table-pools,
  .table-wallet {
    .header-border {
      border-radius: 0 !important;
    }
  }
}
</style>
