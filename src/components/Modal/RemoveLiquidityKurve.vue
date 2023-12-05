<template>
  <UiModal
    :open="open"
    @close="handleClose"
    class="modal-liquidity"
    :class="`${_isThemeGame ? 'game' : ''}`"
  >
    <UiModalForm class="style-addLiquidity">
      <template slot="header">
        <div
          v-text="$t('removeLiquidity')"
          class="remove-Liquidity"
          :class="_isThemeGame && 'game-remove-liquidity'"
        />
      </template>
      <div class="m-4 d-block d-sm-flex">
        <PoolOverview
          :pool="pool"
          :forKurve="true"
          :poolShare="poolShareAsText"
          class="hide-sm hide-md col-3 float-left"
        />
        <div class="col-12 col-md-9 float-left pl-0 pl-md-4 padding-table">
          <UiTable class="table-liquidity">
            <UiTableTh>
              <div
                v-text="$t('asset')"
                class="column-lg flex-auto text-left text"
              />
              <div v-text="$t('myPoolBalance')" class="column text" />
              <div
                v-text="$t('withdrawalAmt')"
                class="column-sm-liquidity text"
              />
            </UiTableTh>

            <UiTableTr
              v-for="(token, index) in pool.tokens"
              :key="token.checksum"
              class="asset active"
            >
              <div
                class="column-lg-liquidity flex-auto d-flex flex-items-center text-left d-flex"
              >
                <div
                  :class="token.symbol.length > 7 && 'tooltipped tooltipped-ne'"
                  :aria-label="token.symbol"
                  class="text-token d-flex flex-items-center"
                >
                  <Token :address="token.address" class="mr-2" size="20" />
                  <span :class="`${_isThemeGame ? 'game' : ''}`">
                    {{
                      _isMobile
                        ? _shorten(token.symbol, 4)
                        : _shorten(token.symbol, 7)
                    }}
                  </span>
                </div>
              </div>
              <div
                class="column text-token text-right"
                :class="`${_isThemeGame ? 'game' : ''}`"
              >
                {{ myPoolBalanceAsText(token.address) }}
              </div>
              <div class="column-sm-liquidity text-right">
                <div
                  class="flex-auto ml-3 position-relative"
                  :class="`${_isThemeGame ? 'game' : ''}`"
                >
                  {{
                    index === 0
                      ? tokenLiquidity[tokenA]
                        ? displayValue(tokenLiquidity[tokenA])
                        : '-'
                      : tokenLiquidity[tokenB]
                      ? displayValue(tokenLiquidity[tokenB])
                      : '-'
                  }}
                </div>
              </div>
            </UiTableTr>
          </UiTable>
          <UiTable class="mt-4 table-liquidity">
            <UiTableTh
              class=" flex-items-center text-token table-liquidity justify-content-between"
            >
              <div class="d-flex" style="width: 100%">
                <div v-text="$t('amount')" class="flex-auto text-left" />
                <div class="ml-2">
                  {{ maxBalance | formatAmount }}
                  {{ _shorten(poolPair.symbol, 12) }}
                </div>
              </div>
              <div class="liquidity-input">
                <a
                  class="mx-2"
                  @click="
                    handleInputChange(
                      maxBalance ? maxBalance.decimalPlaces(18).toString() : '0'
                    )
                  "
                  :class="buttonError.loading && 'disable'"
                >
                  <UiLabel v-text="$t('max')" />
                </a>
                <currency-input
                  v-model="amountLiquidity"
                  class="cards__input-number input text-right column-sm text-input "
                  :class="
                    `${
                      _isThemeGame
                        ? 'game-placeholder-crp-input game-btn-input-liquidity'
                        : ''
                    }
                    ${isInvalidInput(maxBalance) ? 'text-red' : ''}
                    ${buttonError.loading && 'disable'}`
                  "
                  type="text"
                  ref="number"
                  :precision="12"
                  autofocus
                  placeholder="0.0"
                  @keyup="handleInputChange(amountLiquidity)"
                />
              </div>
            </UiTableTh>
          </UiTable>

          <div
            class="price d-flex mb-1"
            v-if="usdTokensPrice[tokenA] && usdTokensPrice[tokenB]"
          >
            <div :class="`${_isThemeGame ? 'game' : ''}`">
              {{ `1 ${symbolA} = $${_num(usdTokensPrice[tokenA], 'long')}` }}
            </div>
          </div>

          <div
            class="price d-flex mb-3"
            v-if="usdTokensPrice[tokenA] && usdTokensPrice[tokenB]"
          >
            <div :class="`${_isThemeGame ? 'game' : ''}`">
              {{ `1 ${symbolB} = $${_num(usdTokensPrice[tokenB], 'long')}` }}
            </div>
          </div>
        </div>
      </div>
      <template slot="footer">
        <div class="mt-4" :class="_isThemeGame && !_isMobile ? 'mt-5' : ''">
          <div>
            <!-- <button
              class="liquidity btn-liquidity"
              :class="_isThemeGame ? 'game-button' : ''"
              :disabled="!userLiquidity || approval === ApprovalState.APPROVED"
              @click="handleApproval"
            >
              <span>{{
                approval === ApprovalState.APPROVED ? 'Approved' : 'Approve'
              }}</span>
            </button> -->
            <button
              class="liquidity btn-liquidity"
              :class="
                `${isActionButtonDisabled ? 'btn-disable' : ''}  ${
                  _isThemeGame ? 'game-button' : ''
                }`
              "
              :disabled="isActionButtonDisabled || isInvalidInput(maxBalance)"
              @click="handleNextAction"
            >
              <UiLoading v-if="buttonError.loading" />
              <span v-else>{{ actionButtonText }}</span>
            </button>
          </div>
          <!-- <button
            :disabled="!requireLogin"
            v-if="requireLogin"
            :class="_isThemeGame ? 'game-button' : ''"
            class="liquidity btn-liquidity"
            @click="handleConnectWallet"
          >
            <span>{{ $t('connectWallet') }}</span>
          </button> -->
        </div>
      </template>
    </UiModalForm>
  </UiModal>
</template>
<script>
import dayjs from 'dayjs';
import {
  wrappedToken,
  kurveRequestSignature,
  kurveRemoveLiquidity,
  getKurvePoolBalanceByAddress,
  getKurveAllowances
} from '@/helpers/kurve';
import { ApprovalState } from '@/utils';
import { mapActions } from 'vuex';
import { scale, getEtherscanLink } from '@/utils/helpers';
import config from '@/config';
import BigNumber from 'bignumber.js';
import Storage from '@/utils/storage';
import _provider from '@/helpers/provider';
import { ErrorCode } from '@ethersproject/logger';
import CurrencyInput from '@/components/CurrencyInput.vue';
import Vue from 'vue';

let inputInterval = null;
let approveProcessingInterval = null;
export default {
  data() {
    return {
      provider: null,
      poolId: '',
      poolInfo: {},
      userLiquidity: '',
      maxBalance: '',
      tokenA: '',
      tokenLiquidity: {},
      maxTokenLiquidity: {},
      tokenB: '',
      approval: ApprovalState.NOT_APPROVED,
      // signature: null,
      buttonError: {
        loading: true,
        disable: true
      },
      ApprovalState,
      isShowInvertedPrice: false,
      amountLiquidity: this.userLiquidity,
      usdTokensPrice: {}
    };
  },
  props: {
    open: {
      type: Boolean
    },
    pool: {
      require: false
    },
    poolPair: {
      require: false
    },
    tokenAProps: {
      require: false
    },
    tokenBProps: {
      require: false
    },
    defaultPoolShare: {
      type: Number,
      default: 0
    }
  },
  components: {
    CurrencyInput
  },
  computed: {
    maxBalanceView() {
      if (this.maxBalance == 0 || !this.maxBalance) return '-';
      else if (this.maxBalance < 1e-8) return '< 0.00000001';
      else return this.maxBalance.decimalPlaces(8).toString();
    },
    requireLogin() {
      return !this.isAuthenticated;
    },
    account() {
      const { connector, address } = this.$store.state.account;
      if (!connector || !connector.id || !address) {
        return '';
      }
      return address;
    },
    symbolA() {
      return this.symbol(this.tokenA);
    },
    symbolB() {
      return this.symbol(this.tokenB);
    },
    poolShare() {
      const curPercentage = new BigNumber(this.defaultPoolShare).multipliedBy(
        100
      );
      if (curPercentage.isEqualTo(0)) {
        return null;
      }
      if (this.poolInfo.noLiquidity && this.poolInfo.price) {
        return { percentage: 100 };
      }
      if (!this.poolInfo || !this.poolInfo.price) {
        return null;
      }
      if (
        new BigNumber(this.userLiquidity).isGreaterThan(this.maxBalance || 0)
      ) {
        return null;
      }

      if (
        this.poolInfo.pool.totalSupply
          .minus(this.userLiquidity)
          .isEqualTo(new BigNumber(0.000000000000001))
      ) {
        return { percentage: 0 };
      }

      let poolTokenPercentage;
      if (
        this.userLiquidity &&
        this.poolInfo.pool.totalSupply.isGreaterThan(0)
      ) {
        const balanceBefore = new BigNumber(this.defaultPoolShare).multipliedBy(
          this.poolInfo.pool.totalSupply
        );
        poolTokenPercentage = balanceBefore
          .minus(this.userLiquidity)
          .dividedBy(this.poolInfo.pool.totalSupply.minus(this.userLiquidity))
          .multipliedBy(100);
      }

      return {
        percentage: poolTokenPercentage
      };
    },
    poolShareAsText() {
      const curPercentage = new BigNumber(this.defaultPoolShare);
      const poolShareDetail = this.poolShare;
      const percentage = poolShareDetail
        ? new BigNumber(poolShareDetail.percentage)
        : null;
      const currentPercentStr = `${
        this._num(curPercentage) > 0
          ? this._num(curPercentage) > 1e-4
            ? this._num(curPercentage, 'percent')
            : '<0.01%'
          : ''
      }`;

      if (!percentage || percentage.isNaN()) {
        return `${currentPercentStr || '-'}`;
      }

      const percentageStr = `${
        percentage.isEqualTo(0)
          ? '0'
          : percentage.isLessThan(0.01)
          ? '<0.01'
          : percentage.decimalPlaces(2).toString()
      }%`;

      return `${
        currentPercentStr ? currentPercentStr + ' → ' : ''
      } ${percentageStr}`;
    },
    actionButtonText() {
      if (this.requireLogin) {
        return this.$t('connectWallet');
      }
      if (
        this.userLiquidity &&
        new BigNumber(this.userLiquidity).isGreaterThan(0) &&
        this.approval !== ApprovalState.APPROVED
      ) {
        return this.$t('unlock');
      }
      return this.$t('remove');
    },
    isActionButtonDisabled() {
      if (this.buttonError.loading) {
        return true;
      }
      if (this.requireLogin) {
        return false;
      }
      if (
        this.userLiquidity &&
        new BigNumber(this.userLiquidity).isGreaterThan(0) &&
        this.approval !== ApprovalState.APPROVED
      ) {
        return false;
      }
      return this.buttonError.disable;
    }
  },
  watch: {
    async open() {
      if (this.open) {
        this.provider = await this.$store.getters['account/provider'];
        const tokenA = this.tokenAProps;
        const tokenB = this.tokenBProps;
        this.tokenA =
          wrappedToken(tokenA).toLowerCase() <
          wrappedToken(tokenB).toLowerCase()
            ? tokenA
            : tokenB;
        this.tokenB =
          wrappedToken(tokenA).toLowerCase() <
          wrappedToken(tokenB).toLowerCase()
            ? tokenB
            : tokenA;

        const assets = this.$store.getters['assets/metadata'];
        const poolInfo = await this.getKurvePoolDetailByAddress({
          provider: this.provider,
          address: this.pool.id,
          tokenA: this.tokenA,
          tokenB: this.tokenB,
          assets
        });
        this.poolInfo = poolInfo;

        const tokensPrice = await this.getTokensPriceByUSD({
          tokens: [this.tokenA, this.tokenB]
        });
        this.usdTokensPrice[this.tokenA] = tokensPrice[0];
        this.usdTokensPrice[this.tokenB] = tokensPrice[1];

        const _maxBalance = await getKurvePoolBalanceByAddress(
          this.provider,
          this.pool.id,
          this.account
        );
        this.maxBalance = new BigNumber(_maxBalance.toString()).dividedBy(
          new BigNumber(10).pow(18)
        );

        this.maxTokenLiquidity[
          this.poolInfo.pool.tokenA.address
        ] = this.poolInfo.pool.tokenA.tokenAmount.multipliedBy(
          this.defaultPoolShare
        );
        this.maxTokenLiquidity[
          this.poolInfo.pool.tokenB.address
        ] = this.poolInfo.pool.tokenB.tokenAmount.multipliedBy(
          this.defaultPoolShare
        );

        this.buttonError.loading = false;
      } else {
        this.userLiquidity = '';
        this.tokenLiquidity = {};
      }
      this.amountLiquidity = '';
    }
  },
  methods: {
    ...mapActions([
      'getKurvePoolDetailByAddress',
      'getTokensPriceByUSD',
      'approve'
    ]),
    symbol(address) {
      const assets = this.$store.getters['assets/metadata'];
      const asset = assets[address];
      if (!asset) {
        return '';
      }
      return asset.symbol;
    },
    myPoolBalanceAsText(address) {
      return this.maxTokenLiquidity[address]
        ? this.maxTokenLiquidity[address].decimalPlaces(6).toString()
        : '-';
    },
    setShowInvertedPrice() {
      this.isShowInvertedPrice = !this.isShowInvertedPrice;
    },
    handleInputChange(value) {
      // reset signature permission
      // this.signature = null;
      this.approval = ApprovalState.NOT_APPROVED;

      this.userLiquidity = value;
      this.amountLiquidity =
        this.userLiquidity && this._validInputNumber(this.userLiquidity);
      if (this.buttonError.loading) {
        return;
      }
      if (
        !this.userLiquidity ||
        new BigNumber(this.userLiquidity).isEqualTo(0)
      ) {
        this.tokenLiquidity[this.poolInfo.pool.tokenA.address] = '';
        this.tokenLiquidity[this.poolInfo.pool.tokenB.address] = '';
        this.buttonError.disable = true;
        return;
      }

      let userLiquidityA = new BigNumber(0);
      let userLiquidityB = new BigNumber(0);

      if (this.maxBalance.isGreaterThan(0)) {
        // calcualte amount A
        userLiquidityA = new BigNumber(this.userLiquidity)
          .multipliedBy(
            this.maxTokenLiquidity[this.poolInfo.pool.tokenA.address]
          )
          .dividedBy(this.maxBalance);
        userLiquidityB = new BigNumber(this.userLiquidity)
          .multipliedBy(
            this.maxTokenLiquidity[this.poolInfo.pool.tokenB.address]
          )
          .dividedBy(this.maxBalance);
      }

      this.tokenLiquidity[
        this.poolInfo.pool.tokenA.address
      ] = userLiquidityA.decimalPlaces(18).toString();

      this.tokenLiquidity[
        this.poolInfo.pool.tokenB.address
      ] = userLiquidityB.decimalPlaces(18).toString();

      if (inputInterval) {
        clearTimeout(inputInterval);
        inputInterval = null;
      }

      inputInterval = setTimeout(async () => {
        await this.getLPAllowances();

        clearTimeout(inputInterval);
        inputInterval = null;
      }, 500);
    },
    getBalance(address) {
      const { balances } = this.$store.state.account;
      const metadata = this.$store.getters['assets/metadata'];
      if (!balances || !metadata) {
        return '0.0';
      }
      const assetMetadata = metadata[address];
      const balance = balances[address];
      if (!assetMetadata || !balance) {
        return '0.0';
      }

      const balanceNumber = new BigNumber(balance);
      const assetDecimals = assetMetadata.decimals;
      const balanceShortNumber = scale(balanceNumber, -assetDecimals);
      const balanceInNumberLb = parseFloat(
        balanceShortNumber.toFixed(config.precision)
      );
      return balanceInNumberLb;
    },
    async handleNextAction() {
      if (this.requireLogin) {
        this.handleConnectWallet();
        return;
      }
      if (this.userLiquidity && this.approval !== ApprovalState.APPROVED) {
        await this.handleApproval();
        return;
      }
      await this.handleRemoveLiquidity();
    },
    handleConnectWallet() {
      this.$store.dispatch('openAccountModal');
    },
    async getLPAllowances() {
      const allowances = await getKurveAllowances(
        this.provider,
        this.account,
        config.kurve.addresses.routerV2,
        [this.pool.id],
        [
          new BigNumber(this.userLiquidity)
            .multipliedBy(new BigNumber(10).pow(18))
            .decimalPlaces(0)
        ]
      );
      this.approval = allowances[0].state;
      if (this.buttonError.disable) {
        this.buttonError.disable = false;
      }
      if (this.buttonError.loading) {
        this.buttonError.loading = false;
      }
    },
    async handleApproval() {
      this.buttonError.loading = true;

      await this.approve({
        token: this.pool.id,
        spender: config.kurve.addresses.routerV2
      });

      approveProcessingInterval = setInterval(async () => {
        await this.getLPAllowances();

        clearInterval(approveProcessingInterval);
        approveProcessingInterval = null;
      }, 3000);
      return;
      // if (this.provider.provider.isMathWallet) {

      // }

      // const deadline = Storage.getDeadline();
      // this.signature = await kurveRequestSignature(
      //   this.provider,
      //   this.account,
      //   this.pool.id,
      //   new BigNumber(dayjs().valueOf())
      //     .dividedBy(1000)
      //     .plus(deadline * 60)
      //     .decimalPlaces(0),
      //   new BigNumber(this.userLiquidity)
      //     .multipliedBy(new BigNumber(10).pow(18))
      //     .decimalPlaces(0)
      // );
      // if (this.signature && this.signature.code !== 4001) {
      //   this.approval = ApprovalState.APPROVED;
      // }
      // this.buttonError.loading = false;
    },
    async handleRemoveLiquidity() {
      this.buttonError.loading = true;
      const assets = this.$store.getters['assets/metadata'];
      const finalUserLiquidity = new BigNumber(this.userLiquidity).multipliedBy(
        new BigNumber(10).pow(18)
      );

      const finalTokenAmountA = new BigNumber(
        this.tokenLiquidity[this.poolInfo.pool.tokenA.address]
      ).multipliedBy(new BigNumber(10).pow(assets[this.tokenA].decimals));
      const finalTokenAmountB = new BigNumber(
        this.tokenLiquidity[this.poolInfo.pool.tokenB.address]
      ).multipliedBy(new BigNumber(10).pow(assets[this.tokenB].decimals));

      if (finalTokenAmountA.isEqualTo(0) || finalTokenAmountB.isEqualTo(0)) {
        this.buttonError.loading = false;
        // Vue.prototype.$mixpanel.track('removeLiquidityStable', {
        //   message: 'transactionMessages.insufficientLiquidityBurned',
        //   params: {
        //     finalTokenAmountA: finalTokenAmountA.toString(),
        //     finalTokenAmountB: finalTokenAmountB.toString(),
        //     tokenA: this.poolInfo.pool.tokenA.address,
        //     tokenB: this.poolInfo.pool.tokenB.address,
        //     tokenLiquidity: this.tokenLiquidity
        //   }
        // });
        this.$store.dispatch('notify', {
          text: this.$t('transactionMessages.insufficientLiquidityBurned'),
          type: 'warning',
          link: config.helpUrl
        });
        return;
      }

      const deadline = Storage.getDeadline();
      const slippage = this.poolInfo.noLiquidity ? 0 : Storage.getSlippage();
      const finalMinTokenAmountA = finalTokenAmountA.multipliedBy(1 - slippage);
      const finalMinTokenAmountB = finalTokenAmountB.multipliedBy(1 - slippage);

      const tx = await kurveRemoveLiquidity(
        this.tokenA,
        this.tokenB,
        this.pool.id,
        finalUserLiquidity.decimalPlaces(0),
        finalMinTokenAmountA.decimalPlaces(0),
        finalMinTokenAmountB.decimalPlaces(0),
        this.account,
        this.provider,
        // this.signature,
        new BigNumber(dayjs().valueOf())
          .dividedBy(1000)
          .plus(deadline * 60)
          .decimalPlaces(0)
        // this.provider.provider.isMathWallet &&
        //   this.approval === ApprovalState.APPROVED
      );
      // Vue.prototype.$mixpanel.track('removeLiquidityStable', {
      //   params: {
      //     tokenA: this.tokenA,
      //     tokenB: this.tokenB,
      //     poolId: this.pool.id,
      //     finalUserLiquidity: finalUserLiquidity.decimalPlaces(0).toString(),
      //     finalMinTokenAmountA: finalMinTokenAmountA.decimalPlaces(0).toString(),
      //     finalMinTokenAmountB: finalMinTokenAmountB.decimalPlaces(0).toString(),
      //     account: this.account,
      //     signature: JSON.stringify(this.signature),
      //     deadline: deadline
      //   },
      //   tx,
      // });
      if (tx === null) {
        this.buttonError.loading = false;
        // Vue.prototype.$mixpanel.track('removeLiquidityStable', {
        //   message: 'Tx is empty'
        // });
        this.$store.dispatch('notify', {
          text: this.$t('transactionMessages.transactionFailContactSupport'),
          type: 'warning',
          link: config.helpUrl
        });
        return;
      }
      await this.handleTransaction(
        tx,
        'transactionTitles.removeStablecoinLiquidity'
      );
      this.$store.dispatch('account/fetchAssets', [this.tokenA, this.tokenB]);
      this.$store.dispatch('farm/getFarmUserData');
      this.$store.dispatch('prestaking/fetchPreStakingUserData');
      this.buttonError.loading = false;
    },
    async handleTransaction(transaction, text) {
      await this.$store.dispatch('transactions/handleTransaction', {
        transaction,
        titleKey: text
      });

      this.transactionPending = false;
      this.handleClose(true);
    },
    handleClose(reload = false) {
      this.userLiquidity = '';
      this.buttonError.loading = true;
      this.buttonError.disable = true;
      this.$emit('close', reload);
    },
    checkWithdrawalAmt(value) {
      if (parseFloat(value) <= 1e6) return true;
      else return false;
    },
    displayValue(value) {
      return parseFloat(value) === 0
        ? '-'
        : parseFloat(value) < 0.0001
        ? '< 0.0001'
        : parseFloat(value).toFixed(4);
    },
    isInvalidInput(balance) {
      return new BigNumber(this.amountLiquidity).comparedTo(balance) > 0;
    }
  }
};
</script>
<style lang="scss" scoped>
.disable {
  pointer-events: none;
  opacity: 0.5;
}
.remove-Liquidity {
  font-size: 25px;
  line-height: 35px;
  text-transform: capitalize;
  text-align: start;
  color: var(--text-color-liquidity);
  margin-left: 15px;
  margin-top: 15px;

  @media (max-width: 767px) {
    margin-left: 0px;
    margin-top: 15px;
    text-align: center;
  }
}

.remove-Liquidity.game-remove-liquidity {
  font-size: 18px;
}

.game {
  font-size: 11px;
}

.asset.active {
  opacity: 1;
}
.table-liquidity {
  margin-bottom: 0 !important;
}
.column-lg-liquidity {
  width: 180px;

  @media only screen and (max-width: 768px) {
    width: 150px;
  }
}
.text-input {
  color: var(--text-color);
}
.btn-disable {
  opacity: 0.7;
  cursor: not-allowed;
}
.liquidity {
  background: $btn-bg-color;
  border: none;
  box-sizing: border-box;
  border-radius: 100px;
  color: var(--button-enabled-text);
  font-family: $font-bold;
  font-size: 20px;
  text-align: center;
  text-transform: capitalize;
  height: 55px;
  padding: 0 55px;
  margin: 0 30px;
  &:disabled {
    border: none !important;
    background: var(--btn-color-primary);
    opacity: 0.4;

    &:hover {
      background: var(--btn-color-primary) !important;
    }
  }
  &:enabled {
    &:hover {
      background: $color-button-hover !important;
    }
  }

  @media (max-width: 767px) {
    margin-bottom: 20px !important;
    margin-top: 20px !important;
  }
}
.asset {
  opacity: 0.6;
}
.asset::v-deep {
  .line {
    border-left: 1px solid var(--border-color);
    border-right: 1px solid var(--border-color);
    border-bottom: 1px solid var(--border-color);
    background: var(--panel-background);
    padding: 0 1.5rem !important;
    &:hover {
      background: $line-hover-color !important;
    }
  }

  &:nth-child(odd) {
    &:hover {
      .line {
        background: $line-hover-color !important;
      }
    }
  }
  &:last-child {
    .line {
      border-bottom: 1px solid var(--border-color);
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
    }
  }
}
.column-sm-liquidity {
  width: 160px;
  min-width: 30px;
  @media only screen and (max-width: 768px) {
    width: 80px !important;
  }
}
.text-token {
  font-family: $font-weight-regular;
  font-size: 15px;
  line-height: 50px;
  color: var(--text-color-liquidity) !important;
  border-radius: $border-radius;
  overflow: hidden;
  text-overflow: ellipsis;
}
.padding-table {
  padding-right: 0;
}
.text {
  font-family: $font-bold;
  font-size: 13px;
  line-height: 20px;
  color: var(--text-color-liquidity);
  opacity: 0.3;
}
.hand {
  cursor: pointer;
}
.price {
  margin-top: 20px;
  align-items: center;
  justify-content: flex-end;
  align-content: center;
  color: var(--color-text-tooltip);
}
.liquidity-input {
  display: flex;
  align-items: center;
  align-content: center;
  @media only screen and (max-width: 768px) {
    margin-left: 10px;
    div {
      max-width: 35%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.game-btn-input-liquidity {
  border-radius: 0 !important;
  border: 0;
  margin-left: 20px;
  line-height: 25px !important;
}

.btn-liquidity.game-button {
  border-radius: 0 !important;
  font-family: $font-forward !important;
  height: 22px !important;
  background: #f47820 !important;
  font-size: 16px !important;

  &:hover {
    background-color: $game-btn-hover-color !important;
  }

  &:disabled {
    &:hover {
      background-color: #f47820 !important;
    }
  }
}

.modal-liquidity.game {
  .text-token {
    font-size: 11px !important;
  }
}

@media only screen and (max-width: 768px) {
  .text-token.table-liquidity {
    flex-direction: column;
  }

  .modal-liquidity.game {
    .remove-Liquidity {
      font-size: 18px !important;
    }

    .text-token,
    .position-relative.game {
      font-size: 10px !important;
    }
  }

  .game-border-table {
    font-size: 12px !important;
  }

  .btn-liquidity.game-button {
    margin: 40px 30px !important;
    font-size: 13px !important;
    height: 20px !important;
    padding: 0 20px !important;
  }
}
</style>
