<template>
  <ModalBase
    :title="$t('selectAToken')"
    :open="open"
    @close="close"
    class="modal-select-token-swap"
  >
    <template #default>
      <div class="form-input-search" :class="_isThemeGame ? 'game' : ''">
        <div
          :class="
            `query-input-wrapper position-relative ${
              _isThemeGame ? 'game-border-btn-search' : ''
            }`
          "
        >
          <input
            v-model="query"
            :class="`query-input ${_isThemeGame ? 'game-placeholder' : ''}`"
            :placeholder="$t('placeholderSearch')"
          />
          <Icon
            name="search-1"
            class="position-absolute icon-search-token"
            size="20"
            v-if="!_isThemeGame"
          >
          </Icon>
          <img
            v-else
            class="position-absolute icon-search-token game"
            src="~@/assets/icon/game/search-icon.png"
            style="width: 30px"
          />
        </div>
      </div>
      <div :class="`list-content`">
        <div :class="`list-asset ${_isThemeGame ? 'game' : ''}`">
          <div
            class="py-3 text-center no-token"
            v-if="query && Object.keys(visibleAssets).length === 0"
          >
            <div>
              <img v-if="!_isThemeGame" src="~@/assets/icon/no-search.svg" />
              <img v-else src="~@/assets/icon/game/no-search.png" />
            </div>
            <div :class="`mt-4 ${_isThemeGame ? 'game' : ''}`">
              {{ $t('noTokenFound') }}
            </div>
          </div>
          <div
            v-for="asset in visibleAssets"
            :key="asset.address"
            class="asset"
            :class="{ incompatible: isIncompatible(asset.address) }"
            @click="select(asset.address)"
          >
            <div class="asset-meta" :class="_isThemeGame ? 'game' : ''">
              <AssetIcon
                class="asset-icon"
                :address="asset.address"
                :metadata="metadata"
              />
              <div class="asset-symbol">
                {{ asset.symbol }}
                <span class="address"> / {{ asset.name }} </span>
              </div>
              <div
                v-if="isIncompatible(asset.address)"
                class="asset-incompatible"
              >
                Incompatible
              </div>
            </div>
            <div :class="`asset-amount ${_isThemeGame ? 'game' : ''}`">
              {{ shortDecimal(asset.amount) }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </ModalBase>
</template>

<script>
import { getAddress } from '@ethersproject/address';
import BigNumber from 'bignumber.js';
import { isAddress, scale } from '@/utils/helpers';
import config from '@/config';

import AssetIcon from '@/components/swap/AssetIcon.vue';
import ModalBase from '@/components/swap/modals/ModalBase.vue';

export default {
  components: {
    AssetIcon,
    ModalBase
  },
  props: {
    open: {
      type: Boolean,
      required: true
    },
    hidden: {
      type: Array,
      default: () => []
    },
    forKurve: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      query: '',
      metadata: {}
    };
  },
  watch: {
    query() {
      const metadata = this.$store.getters['assets/metadata'];
      if (!isAddress(this.query)) {
        return;
      }
      const address = getAddress(this.query);
      const asset = metadata[address] || metadata[this.query];
      if (!asset) {
        this.$store.dispatch('assets/fetchMetadata', [address]);
        this.$store.dispatch('account/fetchAssets', [address]);
      }
    }
  },
  computed: {
    assets() {
      const { balances } = this.$store.state.account;
      const metadata = this.$store.getters['assets/metadata'];
      const assets = Object.keys(metadata).map(assetAddress => {
        const asset = metadata[assetAddress];
        const { address, name, symbol, decimals } = asset;
        const balance = balances[address] || '0';
        const balanceNumber = new BigNumber(balance);
        const amountNumber = scale(balanceNumber, -decimals);
        const amount = amountNumber.isZero()
          ? ''
          : amountNumber.toFixed(config.precision);
        return {
          address,
          name,
          symbol,
          amount,
          forKurve: asset.forKurve
        };
      });

      const ownedAssets = assets.filter(asset => asset.amount);
      const notOwnedAssets = assets.filter(asset => !asset.amount);
      return [...ownedAssets, ...notOwnedAssets];
    },
    visibleAssets() {
      return this.assets.filter(asset => {
        if (this.forKurve && !asset.forKurve) {
          return false;
        }
        // Filter by "hidden" prop
        if (this.hidden.includes(asset.address)) {
          return false;
        }
        // Filter by query
        const queryString = this.query.trim().toLowerCase();
        if (!queryString) {
          return true;
        }
        if (isAddress(queryString)) {
          return asset.address.toLowerCase() === queryString;
        }
        if (asset.name.toLowerCase().includes(queryString)) {
          return true;
        }
        if (asset.symbol.toLowerCase().includes(queryString)) {
          return true;
        }
        return false;
      });
    }
  },
  methods: {
    shortDecimal(amount) {
      return amount ? parseFloat(amount).toFixed(8) : '';
    },
    select(assetAddress) {
      if (this.isIncompatible(assetAddress)) {
        return;
      }
      this.$emit('select', assetAddress);
      if (this.forKurve) {
        this.$emit('close');
      } else {
        this.close();
      }
    },
    close() {
      this.query = '';
      if (this.forKurve) {
        this.$emit('close');
      } else {
        this.$store.dispatch('closeAssetModal');
      }
    },
    isIncompatible(assetAddress) {
      return config.untrusted.includes(assetAddress);
    }
  },
  mounted() {
    this.metadata = this.$store.getters['assets/metadata'];
  }
};
</script>

<style scoped lang="scss">
.no-token {
  color: var(--color-text-not-found);
  font-size: 20px;
  font-family: $font-bold;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.form-input-search {
  padding-bottom: 20px;
  background: var(--color-table-pooloverviwe) !important;
}

.form-input-search.game {
  background-color: #f4791a !important;
}

.query-input-wrapper {
  padding: 12px 15px 12px 45px;
  border: 1px solid var(--border-input);
  border-radius: 100px;
  box-shadow: inset 1px 2px 3px var(--border-shadow-toggle);
  background-color: var(--bg-input-search);
  width: 80%;
  margin: 0 auto;
  position: relative;

  .icon-search-token {
    left: 13px;
    color: var(--border-table-body);
    top: 15px;
  }

  .icon-search-token.game {
    top: 50%;
    left: 0 !important;
    transform: translateY(-50%);
  }

  input {
    color: var(--secondary-text-color);
    background: none !important;
  }
}

.query-input-wrapper.game-border-btn-search {
  padding: 5px 0 5px 40px !important;
  background-color: #fff !important;
  position: relative;
}

::-webkit-input-placeholder,
::placeholder {
  color: var(--color-plachoder-search);
  font-family: $font-weight-regular;
  font-size: 16px;
}

.game-border-btn-search {
  border-radius: 0 !important;
}

.modal-select-token-swap {
  .modal-body {
    width: 100%;
    overflow-y: hidden;
  }

  .list-asset {
    overflow-y: auto;
    height: 100%;
    width: 98%;
    max-height: 420px;
  }

  .list-content {
    background-color: var(--panel-background);
    height: 100%;
  }
  ::-webkit-scrollbar-thumb {
    background: var(--scroll-bar-background);
  }
}

.query-input {
  width: 100%;
  font-size: 16px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  outline: none;
}

.query-input.game-placeholder {
  font-family: $font-forward !important;
  font-size: 14px;
}

.asset {
  display: flex;
  justify-content: space-between;
  padding: 12px 0 12px 40px;
  cursor: pointer;
  color: var(--secondary-text-color);
  margin-right: 10px;

  &:hover {
    background-color: $line-hover-color;
  }

  .address {
    color: var(--color-tooltip);
    font-family: $font-weight-regular;
    font-size: 14px;
  }
}

.asset.incompatible {
  cursor: not-allowed;
}

.asset.incompatible:hover {
  background: transparent;
}

.asset-meta {
  display: flex;
  align-items: center;
}

.asset-meta.game {
  max-width: 60%;
}

.asset-icon {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background-color: white;
}

.asset-symbol {
  padding-left: 12px;
  font-size: var(--font-size-large);
  font-family: $font-weight-semibold;
}

.game {
  .asset-symbol {
    font-family: $font-forward !important;
    font-size: 13px !important;

    .address {
      font-family: $font-forward !important;
      font-size: 10px !important;
    }
  }
}

.asset-incompatible {
  padding-left: 8px;
  color: var(--error);
}

.asset-amount {
  display: flex;
  align-items: center;
  color: var(--color-tooltip);
  font-size: 13px;
}

.asset-amount.game {
  font-size: 9px !important;
}
@media only screen and (max-width: 768px) {
  .modal-select-token-swap {
    width: 100%;
    overflow-y: hidden;
    .modal {
      width: 335px !important;
    }
    .query-input-wrapper {
      width: calc(100% - 40px);
    }

    .asset {
      padding: 16px 0 16px 20px;
    }

    .list-asset {
      max-height: 400px !important;
    }
  }
  .game {
    .asset-symbol {
      font-size: 11px !important;

      .address {
        font-size: 9px !important;
      }
    }
  }
}
</style>
