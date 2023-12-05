<template>
  <UiModal
    :open="open"
    @close="close"
    style="max-width: 420px;"
    :class="
      `modal-select-token ${_isThemeGame ? 'game-modal-select-token' : ''}`
    "
  >
    <UiModalForm>
      <template slot="header">
        <h3 v-text="$t('selectAToken')" class="text-header-modal mb-4" />
        <Search
          v-model="query"
          @input="handleQuery"
          v-bind:placeholder="
            !tokenList || !tokenList.length ? $t('placeholderSearch') : ''
          "
          :customClass="
            `input-search-token ${_isThemeGame ? 'game-border-btn-search' : ''}`
          "
          :tokenList="tokenList"
          @deleteToken="deleteToken"
        />
      </template>
      <UiLoading v-if="loading" class="big py-3" />
      <ul v-else>
        <li
          class="py-3 text-center no-token"
          v-if="query && Object.keys(tokens).length === 0"
        >
          <div>
            <img v-if="!_isThemeGame" src="~@/assets/icon/no-search.svg" />
            <img v-else src="~@/assets/icon/game/no-search.png" />
          </div>
          <div :class="`mt-4 ${_isThemeGame ? 'game' : ''}`">
            {{ $t('noTokenFound') }}
          </div>
        </li>
        <li v-for="(token, i) in tokens" :key="i">
          <a
            @click="selectToken(i, token)"
            class="pl-3 d-flex flex-items-center text-white highlight item-token"
          >
            <div class="flex-auto d-flex flex-items-center">
              <div>
                <Token :address="i" class="mr-2" size="25" />
              </div>
              <div class="ml-2">
                <span class="name-token" v-text="_shorten(token.symbol, 12)" />
                <span class="address"> / {{ token.name }} </span>
                <span
                  class="text-red ml-2"
                  v-if="isDisabled(i)"
                  v-text="$t('badERC20')"
                />
              </div>
            </div>
            <div
              v-if="token.balance"
              :class="`text-balance ml-4 ${_isThemeGame ? 'game' : ''}`"
            >
              <span
                v-if="token.price"
                v-text="_num(parseFloat(token.value).toFixed(4), 'usd')"
                class="text-gray mr-2"
              />
              <span v-text="_trunc(token.balance.toFixed(4), 4)" />
            </div>
          </a>
        </li>
      </ul>
    </UiModalForm>
  </UiModal>
</template>

<script>
import { mapActions } from 'vuex';
import { getAddress } from '@ethersproject/address';
import { bnum, isValidAddress, normalizeBalance } from '@/helpers/utils';

export default {
  props: ['open', 'not', 'tokenList'],
  data() {
    return {
      loading: false,
      query: ''
    };
  },
  computed: {
    tokens() {
      return Object.fromEntries(
        Object.entries(this.networkdata.tokenMetadata)
          .map(token => {
            const address = token[0];
            const decimals = token[1].decimals;
            const price = bnum(this.price.values[address] || 0);
            const balance = normalizeBalance(
              this.$store.state.account.balances[address] || 0,
              decimals
            );
            const value = price.times(balance);
            return [
              address,
              {
                decimals,
                balance: balance.toNumber(),
                price: price.toNumber(),
                value: value.toNumber(),
                symbol: token[1].symbol,
                name: token[1].name
              }
            ];
          })
          .filter(token => {
            if (this.not.includes(token[0])) return false;
            const address = token[0];
            const query = this.query.toLowerCase();
            if (isValidAddress(query)) {
              return address.toLowerCase() === query;
            } else {
              const symbol = token[1].symbol.toLowerCase();
              const name = token[1].name.toLowerCase();
              return symbol.includes(query) || name.includes(query);
            }
          })
          .sort((a, b) => {
            if (a[1].value && b[1].value) return b[1].value - a[1].value;
            if (a[1].value) return -1;
            if (b[1].value) return 1;
            return b[1].balance - a[1].balance;
          })
      );
    }
  },
  methods: {
    ...mapActions(['loadTokenMetadata', 'loadPricesByAddress']),
    ...mapActions('account', ['getPoolAllowances', 'getBalances']),
    selectToken(token) {
      if (this.isDisabled(token)) {
        return;
      }

      this.query = '';
      this.$emit('input', token);
    },
    close() {
      this.$emit('close');
      this.query = '';
    },
    deleteToken(i) {
      this.$emit('deleteToken', i);
    },
    async handleQuery() {
      if (!isValidAddress(this.query)) {
        return;
      }
      const address = getAddress(this.query);
      if (this.networkdata.tokenMetadata[address]) {
        return;
      }
      this.loading = true;
      const promises = [
        this.loadTokenMetadata([address]),
        this.loadPricesByAddress([address])
      ];
      if (this.$store.state.account.address) {
        promises.push(this.getBalances([address]));
        promises.push(this.getPoolAllowances([address]));
      }
      await Promise.all(promises);
      this.loading = false;
    },
    isDisabled(address) {
      return this.config.untrusted.includes(address);
    }
  }
};
</script>

<style scoped lang="scss">
@import '../../vars';

.modal-select-token {
  ::-webkit-scrollbar-thumb {
    background: var(--scroll-bar-background);
  }
  .text-header-modal,
  .name-token {
    color: var(--secondary-text-color);
  }

  .text-header-modal {
    text-align: left;
    padding: 6px 16px 0 16px;
    margin-bottom: 20px !important;
    font-size: 25px;
  }

  .form-search {
    background-color: var(--color-table-pooloverviwe);
  }

  form {
    width: 100%;
    background-color: var(--input-hover-border);
    padding-bottom: 15px;
    max-height: 594px;

    @media only screen and (max-width: $width-xl) {
      max-height: 100%;
    }
  }

  .item-token {
    padding-left: 40px !important;
    margin-right: 9px;

    &:hover {
      background-color: $line-hover-color;
    }
  }

  .name-token {
    font-size: 18px;
    line-height: 50px;
    font-family: $font-weight-semibold;
  }

  .address {
    font-family: $font-weight-regular;
    font-size: 14px;
    color: var(--text-gray);
  }

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

  ul li {
    list-style-type: none;
  }

  .text-balance {
    color: var(--color-tooltip);
  }

  .text-balance.game {
    font-size: 9px !important;
  }

  @media only screen and (max-width: 768px) {
    .text-header-modal {
      padding: 0;
    }

    .text-balance {
      .text-gray {
        display: none;
      }
    }

    .item-token {
      padding-left: 25px !important;
    }
  }
}

.game-modal-select-token {
  font-family: $font-forward;
  max-width: inherit !important;

  .text-header-modal {
    font-family: $font-forward;
    font-size: 20px;
    margin-bottom: 40px !important;
  }

  .name-token {
    font-family: $font-forward;
    font-size: 12px;
  }

  .address {
    font-family: $font-forward;
    font-size: 10px;
  }
}
</style>
