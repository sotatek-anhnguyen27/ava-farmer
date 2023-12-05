<template>
  <Page :requireLogin="true">
    <Container>
      <div class="flex-auto mb-3">
        <Title :title="$t('myAssets')" />
        <a
          :href="_etherscanLink(myAddress)"
          target="_blank"
          :class="`link-wallet ${_isThemeGame ? 'game' : ''}`"
        >
          <span v-text="_shortenAddress(myAddress)" />
          <Icon
            v-if="!_isThemeGame"
            name="external-link"
            size="16"
            class="ml-1 mr-2"
          />
          <img
            v-else
            src="~/@/assets/icon/game/link.png"
            class="icon-link-game"
          />
        </a>
      </div>
      <div class="d-flex header-wallet mb-3">
        <Toggle :value="type" :options="assetsTypes" @select="selectType" />
        <div v-if="type === 'myWallet'" class="total-value-group">
          <div :class="`total-value ${_isThemeGame ? 'game mb-2' : ''}`">
            <span
              :class="`label-total-value-mobile ${_isThemeGame ? 'game' : ''}`"
            >
              {{ $t('totalValue') + ':' }}
            </span>
            {{ _num(balancesTotalValue, 'usd-long') }}
          </div>
          <div :class="`label-total-value ${_isThemeGame ? 'game' : ''}`">
            {{ $t('totalValue') }}
          </div>
        </div>
      </div>
    </Container>
    <div v-if="type === 'myWallet'">
      <UiTable class="mb-4 table-wallet">
        <UiTableTh>
          <div v-text="$t('assets')" class="flex-auto text-left" />
          <div v-text="$t('holdings')" class="column" />
        </UiTableTh>
        <UiTableTr v-for="(balance, i) in balances" :key="i">
          <div class="d-flex justify-content-between" style="width: 100%">
            <div class="d-flex content-left align-items-center">
              <div class="d-flex align-items-center">
                <div>
                  <Token :address="balance.address" class="mr-3" size="25" />
                </div>
                <div
                  class="text-left name-balance"
                  :class="_isThemeGame ? 'game' : ''"
                >
                  <div
                    :class="`${_isThemeGame ? 'mb-2' : ''}`"
                    v-text="balance.name"
                  />
                  <div v-text="balance.symbol" class="balance-symbol" />
                </div>
              </div>
              <div>
                <div v-if="balance.address !== BNB_KEY" class="flex-auto">
                  <UiButton
                    v-if="balance.address === config.addresses.weth"
                    @click="[(modalWrapperOpen = true), (side = 2)]"
                    type="button"
                    :class="
                      `button-primary button-sm btn-wrap ${
                        _isThemeGame ? 'game-border-btn-add' : ''
                      }`
                    "
                  >
                    {{ $t(`unwrapTo${coinSymbol}`) }}
                  </UiButton>
                </div>
                <div v-else class="flex-auto">
                  <UiButton
                    @click="[(modalWrapperOpen = true), (side = 1)]"
                    type="button"
                    :class="
                      `button-primary button-sm btn-wrap ${
                        _isThemeGame ? 'game-border-btn-add' : ''
                      }`
                    "
                  >
                    {{ $t(`wrapTo${wrapSymbol}`) }}
                  </UiButton>
                </div>
              </div>
            </div>
            <div class="column">
              <div>
                {{ _num(balance.balance, 'long') }}
                {{ balance.symbol }}
              </div>
              <div
                v-text="_num(balance.value, 'usd')"
                class="text-gray"
                :class="_isThemeGame ? 'mt-2' : ''"
              />
            </div>
          </div>
        </UiTableTr>
      </UiTable>
      <Container class="d-flex mb-3">
        <div v-if="$store.state.account.proxy" style="width: 100%">
          <h3 :class="`text-proxy mb-3 ${_isThemeGame ? 'game' : ''}`">
            {{ $t('myProxy') }}
            <a
              href="https://docs.buni.finance/for-liquidity-provider/setup-proxy"
              target="_blank"
              :class="`link-wallet ${_isThemeGame ? 'game' : ''}`"
            >
              <span :class="_isThemeGame ? 'game-tooltip' : ''">
                <Icon
                  v-if="!_isThemeGame"
                  name="help"
                  size="14"
                  class="help-icon"
                />
                <img v-else src="~/@/assets/icon/game/help.png" />
              </span>
            </a>
          </h3>
          <a
            :href="_etherscanLink($store.state.account.proxy)"
            target="_blank"
            :class="`link-wallet ${_isThemeGame ? 'game' : ''}`"
          >
            <span v-text="$store.state.account.proxy" />
            <Icon
              v-if="!_isThemeGame"
              name="external-link"
              size="16"
              class="ml-1 mr-2"
            />
            <img
              v-else
              src="~/@/assets/icon/game/link.png"
              class="icon-link-game"
            />
          </a>
        </div>
        <div v-else>
          <h4 :class="`text-proxy ${_isThemeGame ? 'game' : ''}`">
            {{ $t('noProxy') }}
            <a
              href="https://docs.buni.finance/for-liquidity-provider/setup-proxy"
              target="_blank"
              :class="`link-wallet ${_isThemeGame ? 'game' : ''}`"
              st
            >
              <span :class="_isThemeGame ? 'game-tooltip' : ''">
                <Icon
                  v-if="!_isThemeGame"
                  name="help"
                  size="14"
                  class="help-icon"
                />
                <img v-else src="~/@/assets/icon/game/help.png" />
              </span>
            </a>
          </h4>
          <div :class="`btn-create ${_isThemeGame ? 'ml-4' : ''}`">
            <button
              @click="setupProxy"
              type="button"
              :class="_isThemeGame && 'game-tooltip game-button'"
              class="button mt-4 button-create"
              :aria-label="$t('createProxyTip')"
            >
              <UiLoading v-if="isLoading" />
              <span v-else>{{ $t('setupProxy') }}</span>
            </button>
          </div>
        </div>
      </Container>
      <portal to="modal">
        <ModalWrapper
          :open="modalWrapperOpen"
          @close="modalWrapperOpen = false"
          :side="side"
        />
      </portal>
    </div>
    <div v-else>
      <Container class="mb-3">
        <div :class="`${_isThemeGame ? 'title-game' : ''}`">
          <div class="title" v-text="$t('myStablecoinLiquidity')" />
        </div>
      </Container>
      <MyKurveLiquidity />
      <Container class="mb-3">
        <div :class="`${_isThemeGame ? 'title-game' : ''}`">
          <div class="title" v-text="$t('myFlexibleLiquidity')" />
        </div>
      </Container>
      <ListPools
        :key="JSON.stringify(queryMyLiquidity)"
        :query="queryMyLiquidity"
        class="mb-4"
      />
      <Container class="mb-3">
        <div :class="`${_isThemeGame ? 'title-game' : ''}`">
          <div class="title" v-text="$t('myPools')" />
        </div>
      </Container>
      <ListPools :key="JSON.stringify(queryMyPools)" :query="queryMyPools" />
    </div>
  </Page>
</template>

<script>
import config from '@/config';
import { formatUnits } from '@ethersproject/units';
import { BNB_KEY } from '@/utils/helpers';
import { mapActions } from 'vuex';
import MyKurveLiquidity from '@/components/Kurve/MyKurveLiquidity.vue';

export default {
  metaInfo: {
    title: 'Wallet'
  },
  components: { MyKurveLiquidity },
  data() {
    return {
      type: 'myWallet',
      assetsTypes: {
        myWallet: this.$t('myWallet'),
        myPools: this.$t('myPools')
      },
      modalWrapperOpen: false,
      side: 0,
      BNB_KEY,
      isLoading: false
    };
  },
  computed: {
    queryMyLiquidity() {
      const poolShares = this.subgraph.poolShares;
      const ids = Object.keys(poolShares).map(share => share.toLowerCase());
      return {
        where: {
          id_in: ids
        }
      };
    },
    queryMyPools() {
      return {
        where: {
          crpController: this.$store.state.account.proxy
        }
      };
    },
    coinSymbol() {
      return config.systemCoin.symbol;
    },
    wrapSymbol() {
      return config.systemCoin.wrap;
    },
    myAddress() {
      return this.$store.state.account.address;
    },
    balances() {
      const { balances: rawBalances } = this.$store.state.account;
      const balances = Object.entries(rawBalances)
        .filter(
          ([address]) =>
            address !== BNB_KEY && this.networkdata.tokenMetadata[address]
        )
        .map(([address, denormBalance]) => {
          const price = this.price.values[address];
          const balance = formatUnits(
            denormBalance,
            this.networkdata.tokenMetadata[address].decimals
          );
          return {
            address,
            name: this.networkdata.tokenMetadata[address].name,
            symbol: this.networkdata.tokenMetadata[address].symbol,
            price,
            balance,
            value: balance * price
          };
        })
        .filter(({ value }) => value > 0.001);
      const ethPrice = this.price.values[this.config.addresses.weth];
      const ethBalance = formatUnits(rawBalances[BNB_KEY] || 0, 18);
      return [
        {
          address: BNB_KEY.toLowerCase(),
          name: BNB_KEY.toUpperCase(),
          symbol: BNB_KEY.toUpperCase(),
          price: ethPrice,
          balance: ethBalance,
          value: ethPrice * ethBalance
        },
        ...balances
      ];
    },
    balancesTotalValue() {
      return this.balances.reduce((a, b) => a + b.value, 0);
    }
  },
  methods: {
    ...mapActions(['createProxy']),
    async setupProxy() {
      this.isLoading = true;
      try {
        await this.createProxy();
      } catch (e) {
        console.error(e);
      }
      this.isLoading = false;
    },
    selectType(assetsType) {
      this.type = assetsType;
      this.$emit('switchTab', this.type);
    }
  }
};
</script>
<style scoped lang="scss">
.header-wallet {
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  @media only screen and (max-width: 768px) {
    justify-content: flex-start;
    flex-direction: column;
  }
}

.total-value {
  font-size: 20px;
  line-height: 24px;
  font-family: $font-bold;
  color: var(--text-color);
}

.total-value.game {
  font-size: 16px;
}

.total-value-group {
  text-align: right;
  @media only screen and (max-width: 768px) {
    padding-top: 20px;
    text-align: left;
  }
}

.label-total-value-mobile {
  display: none;
  visibility: hidden;
  @media only screen and (max-width: 768px) {
    display: inline;
    visibility: visible;
  }
}

.label-total-value {
  color: var(--text-btn);
  font-size: 13px;
  line-height: 20px;
  font-family: $font-bold;
  @media only screen and (max-width: 768px) {
    display: none;
    visibility: hidden;
  }
}
.button-create {
  background: var(--btn-color-primary);
  border: none;
  box-sizing: border-box;
  border-radius: 100px;
  color: var(--button-enabled-text);
  font-family: $font-bold;
  font-size: 16px;
  text-align: center;
  text-transform: capitalize;
  line-height: 35px;
  padding: 0 55px;
  &:disabled {
    border: none !important;
    background: var(--btn-color-primary);
    opacity: 0.4;
  }
  &:enabled {
    &:hover {
      background: $btn-bg-hover-color;
    }
  }
}
.button-create.game-button {
  border-radius: 0 !important;
  line-height: 1 !important;
  height: inherit !important;
  font-family: $font-forward;
  margin-bottom: 30px !important;

  &:enabled {
    &:hover {
      background: $game-btn-hover-color !important;
    }
  }
}
.button-create.game-button {
  font-size: 15px;
  @media only screen and (max-width: 768px) {
    font-size: 13px;
  }
}

.link-wallet {
  color: var(--link-color);
  font-size: 15px;
  font-family: $font-bold;
  line-height: 18px;
  word-break: break-all;
}

.link-wallet.game {
  font-size: 11px;
}

.table-wallet {
  margin: 30px 0 40px 0 !important;
}

.name-balance {
  min-width: 180px;
}

.name-balance.game {
  .balance-symbol {
    font-size: 10px;
  }
}

.balance-symbol {
  font-size: 14px;
  color: var(--color-tooltip);
}

.line-game {
  .column {
    .text-gray {
      font-size: 10px;
    }
  }
}

.btn-wrap {
  padding: 0 30px !important;
  color: $color-primary !important;
  border: 2px solid $color-primary !important;
  font-size: 14px !important;
  background: none !important;
  &:hover {
    background: $btn-bg-hover-color !important;
    color: $text-white !important;
    border: 2px solid $btn-bg-hover-color !important;
  }
}

.btn-wrap.game-border-btn-add {
  border-radius: 0;
  height: inherit;
  padding: 0 30px !important;
  line-height: 1;
  font-size: 10px !important;
  background-color: $color-primary !important;
  color: $text-white !important;

  &:hover {
    background: $game-btn-hover-color !important;
  }
}

.text-proxy {
  font-size: 20px;
  line-height: 24px;
  color: var(--text-color);
  font-family: $font-bold;
}

.text-proxy.game {
  font-size: 15px;
}

.label-total-value.game {
  font-size: 10px;
}

.table-wallet.game-border-table {
  margin-left: 4px !important;
}

@media only screen and (max-width: 768px) {
  .btn-create {
    display: flex;
    justify-content: center;
  }
  .table-wallet {
    margin: 30px 0 40px 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;

    .line {
      padding-top: 10px !important;
    }

    .name-balance {
      min-width: auto !important;
    }

    .column {
      width: 100px !important;
    }
  }

  .table-wallet.game-border-table {
    box-shadow: 3px 0 #878787, -3px 0 #878787, 0 -3px #878787, 0 3px #878787,
      6px 0 #fff, -6px 0 #fff, 0 -6px #fff, 0 6px #fff, 0 0 0 3px #fff !important;
  }

  .text-proxy.game {
    line-height: 35px;
    font-size: 14px;
  }
  .link-wallet.game {
    line-height: 25px;
  }
  .content-left {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .btn-wrap {
    margin-left: 40px;
    margin-top: 20px;
  }

  .btn-wrap.game-border-btn-add {
    padding: 0 10px !important;
    margin-top: 20px;
  }

  .table-wallet.game-border-table {
    margin: 0 auto !important;
    margin-bottom: 30px !important;

    .name-balance {
      min-width: 120px !important;
    }
  }

  .total-value.game {
    font-size: 14px;
  }
}
.title {
  font-family: $font-weight-semibold;
  font-size: 22px;
  line-height: 27px;
  color: var(--text-color);
  margin-bottom: 10px;
}
.title-game {
  .title {
    font-family: $font-forward;
    font-size: 14px;
  }
}
</style>
