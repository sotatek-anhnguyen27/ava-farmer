<template>
  <Nav :items="items" id="tabs" style="background: none;" />
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
  },
  computed: {
    items() {
      const items = [];

      if (this.forKurve) {
        items.push({
          name: this.$t('balances'),
          to: { name: 'pool-kurve' },
          count: 2
        });

        if (this.pool.txSwapCount !== 0) {
          items.push({
            name: this.$t('swaps'),
            to: { name: 'pool-swaps-kurve' },
            count: this.pool.txSwapCount
          });
        }

        items.push({
          name: this.$t('about'),
          to: { name: 'pool-about-kurve' }
        });

        return items;
      }

      if (this.pool.tokens.length > 0) {
        items.push({
          name: this.$t('balances'),
          to: { name: 'pool' },
          count: this.pool.tokens.length
        });
      }

      if (this.pool.swapsCount > 0) {
        items.push({
          name: this.$t('swaps'),
          to: { name: 'pool-swaps' },
          count: this.pool.swapsCount
        });
      }
      if (this.pool.finalized || this.pool.holdersCount) {
        items.push({
          name: this.$t('holders'),
          to: { name: 'pool-shares' },
          count: this.pool.holdersCount
        });
      }
      items.push({
        name: this.$t('about'),
        to: { name: 'pool-about' }
      });
      if (this.isController) {
        items.push({
          name: this.$t('settings'),
          to: { name: 'pool-settings' }
        });
      }

      // Show Actions if the person is logged in
      // AND (the pool can change weights (so potentially provide pokeWeights to anyone)
      //      OR this user is the controller, and it has one of the rights with associated actions)
      if (this.isActiveAction) {
        items.push({
          name: this.$t('actions'),
          to: { name: 'pool-actions' }
        });
      }

      return items;
    },

    isController() {
      return (
        this.$store.state.account.address &&
        this.pool.crpController &&
        this.$store.state.account.proxy &&
        this.pool.crpController &&
        this.$store.state.account.proxy.toLowerCase() ===
          this.pool.crpController.toLowerCase() &&
        this.pool.tokens.length > 0
      );
    },

    isActiveAction() {
      return (
        this.$store.state.account.address &&
        this.pool.rights &&
        this.pool.rights.canChangeWeights &&
        this.pool.tokens.length > 0
      );
    }
  },

  watch: {
    isController: {
      handler() {
        if (this.$route.name !== 'pool-settings') {
          return;
        }

        this.$router.push({
          name: 'pool'
        });
      }
    },

    isActiveAction: {
      handler() {
        if (this.$route.name !== 'pool-actions') {
          return;
        }

        this.$router.push({
          name: 'pool'
        });
      }
    }
  }
};
</script>

<style lang="scss">
#tabs {
  ul {
    line-height: 0;

    li {
      display: inline-block;

      a {
        line-height: 40px;
        height: 44px;
        overflow: hidden;
        padding: 0 16px;
        border-radius: $border-radius $border-radius 0 0;

        &.router-link-exact-active {
          position: relative;
          &:before {
            content: '';
            height: 4px;
            width: 100%;
            position: absolute;
            right: 0;
            bottom: 0;
            background-color: $color-primary;
          }
          .item-name {
            color: $color-primary;
          }
        }
      }
    }
  }
}

.game-font-size {
  font-size: 11px;
}
</style>
