<template>
  <UiModal
    :open="open"
    @close="$emit('close')"
    v-if="pool.id"
    class="modal-liquidity"
  >
    <UiModalForm class="style-addLiquidity">
      <template slot="header">
        <div
          v-text="$t('addLiquidity')"
          class="text-addLiquidity"
          :class="_isThemeGame && 'game'"
        />
      </template>
      <div
        class="m-4 mt-0 liquidity-toggle"
        :class="_isMobile && _isThemeGame ? 'pt-4' : ''"
      >
        <Toggle
          :value="type"
          :options="liquidityToggleOptions"
          @select="handleSelectType"
          class="mt-4 margin"
          :class="loading && 'disable'"
        />
      </div>
      <div class="m-4 d-block d-sm-flex">
        <PoolOverview
          :pool="pool"
          :userShare="userLiquidity.relative"
          class="hide-sm hide-md col-3 float-left"
        />
        <div class="col-12 col-md-9 float-left pl-0 pl-md-4 padding-table">
          <UiTable class="table-liquidity">
            <UiTableTh>
              <div
                class="d-flex justify-content-end align-items-start"
                style="min-width: 100%;"
              >
                <div
                  v-text="$t('asset')"
                  class="column-one-liquidity text-left text"
                />
                <div
                  v-text="$t('walletBalance')"
                  class="column-two-liquidity text-right text"
                />
                <div
                  v-text="$t('depositAmount')"
                  class="column-three-liquidity text-right text"
                />
              </div>
            </UiTableTh>
            <UiTableTr
              v-for="token in pool.tokens"
              :key="token.checksum"
              class="asset"
              :class="{
                active: isMultiAsset || activeToken === token.checksum
              }"
            >
              <div
                class="column-lg-liquidity flex-auto d-flex flex-items-center text-left d-flex"
              >
                <UiRadio
                  class="mr-1"
                  v-if="!isMultiAsset"
                  :checked="activeToken === token.checksum"
                  :onChange="
                    e => {
                      handleTokenSelect(token.checksum);
                    }
                  "
                  :class="{ disabled: loading }"
                />
                <div
                  v-bind:class="[
                    token.symbol.length > 7 && 'tooltipped tooltipped-ne',
                    _isThemeGame && 'game-text-token'
                  ]"
                  :aria-label="token.symbol"
                  class="text-token d-flex flex-items-center text-uppercase"
                >
                  <Token :address="token.address" class="mr-2" size="20" />
                  {{
                    _isMobile
                      ? _shorten(token.symbol, 4)
                      : _shorten(token.symbol, 7)
                  }}
                </div>
              </div>
              <div
                class="text-token quantity-token"
                :class="_isThemeGame && 'game-text-token'"
              >
                <div class="mr-3">
                  {{
                    _num(
                      _trunc(
                        formatBalance(
                          $store.state.account.balances[token.checksum] || '0',
                          token.decimals
                        ),
                        4
                      )
                    )
                  }}
                </div>
                <a
                  @click="handleMax(token)"
                  :class="{
                    disabled:
                      !(isMultiAsset || activeToken === token.checksum) ||
                      loading
                  }"
                >
                  <UiLabel v-text="$t('max')" />
                </a>
              </div>
              <div class="input-wrapper">
                <div
                  class="flex-auto ml-1 text-left d-flex flex-items-center position-relative"
                >
                  <currency-input
                    v-model="amounts[token.checksum]"
                    v-if="isMultiAsset || activeToken === token.checksum"
                    class="cards__input-number flex-auto text-right"
                    v-bind:class="[
                      isInputValid(token) ? 'text-input' : 'text-red',
                      _isThemeGame
                        ? 'game-placeholder-crp-input game-text-token game-btn-input-liquidity'
                        : 'input',
                      loading && 'disable'
                    ]"
                    placeholder="0.0"
                    type="text"
                    ref="number"
                    :precision="getPrecision(token.address)"
                    @keyup="handleChange(amounts[token.checksum], token)"
                  >
                  </currency-input>
                  <!-- <input
                    v-model="amounts[token.checksum]"
                    v-if="isMultiAsset || activeToken === token.checksum"
                    class="cards__input-number flex-auto text-right"
                    v-bind:class="[
                      isInputValid(token) ? 'text-input' : 'text-red',
                      _isThemeGame
                        ? 'game-placeholder-crp-input game-text-token game-btn-input-liquidity'
                        : 'input',
                      loading && 'disable'
                    ]"
                    placeholder="0.0"
                    type="text"
                    @input="handleChange(amounts[token.checksum], token)"
                  /> -->
                </div>
              </div>
            </UiTableTr>
          </UiTable>
          <UiTable class="mt-4 table-liquidity">
            <UiTableTh
              class="text-left flex-items-center text-token table-liquidity"
            >
              <div class="flex-auto">
                {{ _shorten(pool.symbol, 12) }} {{ $t('amount') }}
              </div>
              <div class="flex-auto text-right">
                {{ _num(userLiquidity.absolute.current) }}
                <span v-if="userLiquidity.absolute.future">
                  <span v-if="!_isThemeGame"> → </span>
                  <span v-else>
                    <img
                      src="~/@/assets/icon/game/arrow-icon.png"
                      style="width: 20px"
                    />
                  </span>
                  {{ _num(userLiquidity.absolute.future) }}
                </span>
                {{ _shorten(pool.symbol, 12) }}
              </div>
            </UiTableTh>
          </UiTable>
        </div>
      </div>
      <div class="m-4">
        <MessageError v-if="tokenError" :text="tokenError" class="mb-4" />
        <MessageError v-if="validationError" :text="validationError" class="" />
        <MessageError v-if="transferError" :text="transferError" class="mb-4" />
        <MessageWarningToken
          v-if="!tokenError && !validationError && !warningAccepted"
          :custom="hasCustomToken"
          @accept="warningAccepted = true"
          class="text-left"
        />
        <MessageWarningRateChange
          v-if="rateChangeWarning"
          @lower="lowerAmounts"
          class="mb-4"
        />
        <MessageSlippage
          v-if="slippage"
          :value="slippage"
          :isDeposit="true"
          class="mb-4"
        />
        <MessageWarning
          v-if="!addLiquidityEnabled"
          :text="$t('cannotAddLiquidity')"
          class="mb-4"
        />
      </div>
      <template slot="footer">
        <div :class="_isThemeGame ? 'pt-5 pb-3' : 'pt-3'">
          <Button
            :requireLogin="true"
            :requireProxy="true"
            :requireApprovals="validationError ? undefined : requiredApprovals"
            @submit="handleSubmit"
            :disabled="
              tokenError ||
                validationError ||
                !warningAccepted ||
                transactionReverted ||
                !addLiquidityEnabled
            "
            :loading="loading"
            class="btn-liquidity"
            :class="_isThemeGame ? 'game-button' : 'liquidity'"
          >
            {{ $t('addLiquidity') }}
          </Button>
        </div>
      </template>
    </UiModalForm>
  </UiModal>
</template>

<script>
import { mapActions } from 'vuex';
import { getAddress } from '@ethersproject/address';
import BigNumber from '@/helpers/bignumber';
import {
  calcPoolTokensFromAmount,
  bnum,
  normalizeBalance,
  denormalizeBalance,
  isTxReverted,
  getTokenBySymbol,
  liquidityToggleOptions,
  toWei
} from '@/helpers/utils';
import { calcPoolOutGivenSingleIn } from '@/helpers/math';
import { validateNumberInput, formatError } from '@/helpers/validation';
import { canProvideLiquidity } from '@/helpers/whitelist';
import CurrencyInput from '@/components/CurrencyInput.vue';
import Vue from 'vue';
import Storage from '@/utils/storage';

const BALANCE_BUFFER = 0.01;

function hasToken(pool, symbol) {
  const token = getTokenBySymbol(symbol);
  if (!token) {
    return false;
  }
  const tokenAddress = token.address;
  return pool.tokensList.includes(tokenAddress);
}

export default {
  props: ['open', 'pool', 'bPool'],
  data() {
    return {
      liquidityToggleOptions,
      loading: false,
      poolTokens: null,
      amounts: {},
      type: 'MULTI_ASSET',
      activeToken: null,
      warningAccepted: false,
      transactionReverted: false,
      addLiquidityEnabled: true,
      amount: []
    };
  },
  components: {
    CurrencyInput
  },
  watch: {
    open() {
      this.loading = false;
      this.poolTokens = null;
      this.amounts = Object.fromEntries(
        this.pool.tokens.map(token => {
          return [token.checksum, ''];
        })
      );
      this.type = 'MULTI_ASSET';
      this.activeToken = this.pool.tokens[0].checksum;
      this.warningAccepted = false;
      this.transactionReverted = false;
    },
    '$store.state.account.address': async function(val, prev) {
      if (val && val.toLowerCase() !== prev) {
        this.addLiquidityEnabled = await this.canAddLiquidity();
      }
    }
  },
  async created() {
    this.addLiquidityEnabled = await this.canAddLiquidity();
    this.loading = false;
    this.poolTokens = null;
    this.amounts = Object.fromEntries(
      this.pool.tokens.map(token => {
        return [token.checksum, ''];
      })
    );
    this.type = 'MULTI_ASSET';
    this.activeToken = this.pool.tokens[0].checksum;
    this.warningAccepted = false;
    this.transactionReverted = false;
  },
  computed: {
    poolTokenBalance() {
      const bptAddress = this.bPool.getBptAddress();
      const balance = this.$store.state.account.balances[
        getAddress(bptAddress)
      ];
      return normalizeBalance(balance || '0', 18);
    },
    totalShares() {
      return this.bPool.metadata.totalShares;
    },
    userLiquidity() {
      const poolSharesFrom = parseFloat(this.poolTokenBalance);
      const totalShares = parseFloat(this.totalShares);
      const current = poolSharesFrom / totalShares;
      if (this.validationError) {
        return {
          absolute: {
            current: poolSharesFrom
          },
          relative: {
            current
          }
        };
      }

      const poolTokens = this.poolTokens
        ? bnum(this.poolTokens)
            .div('1e18')
            .toNumber()
        : 0;
      const future = (poolSharesFrom + poolTokens) / (totalShares + poolTokens);
      return {
        absolute: {
          current: poolSharesFrom,
          future: poolSharesFrom + poolTokens
        },
        relative: {
          current,
          future
        }
      };
    },
    tokenError() {
      if (
        this.pool.tokens.some(token =>
          this.config.untrusted.includes(token.checksum)
        )
      ) {
        return this.$t('untrustedTokens');
      }
      return undefined;
    },
    validationError() {
      if (this.tokenError) {
        return undefined;
      }
      if (
        new BigNumber(this.poolTokens).comparedTo(
          10 ** -16 * toWei(this.totalShares)
        ) < 0
      ) {
        return this.$t('errorMinLP');
      }
      for (const token of this.pool.tokensList) {
        if (!this.isMultiAsset && this.activeToken !== token) {
          continue;
        }
        const amountError = validateNumberInput(this.amounts[token]);
        const amountErrorText = formatError(amountError, this.$t('amount'));
        if (amountErrorText) return amountErrorText;
      }
      // Amount validation
      for (const token of this.pool.tokensList) {
        if (!this.isMultiAsset && this.activeToken !== token) {
          continue;
        }
        const amount = bnum(this.amounts[token]);
        const balance = normalizeBalance(
          this.$store.state.account.balances[token],
          this.networkdata.tokenMetadata[token].decimals
        );
        if (amount.gt(balance)) {
          return this.$t('amountExceedsBalance');
        }
      }
      // Max in ratio validation
      if (!this.isMultiAsset) {
        const maxInRatio = 1 / 2;
        const amount = bnum(this.amounts[this.activeToken]);
        const tokenIn = this.pool.tokens.find(
          token => token.checksum === this.activeToken
        );
        if (amount.div(tokenIn && tokenIn.balance).gt(maxInRatio)) {
          return this.$t('insufficientLiquidity');
        }
      }
      return undefined;
    },
    requiredApprovals() {
      return Object.fromEntries(
        this.bPool.metadata.tokensList
          .filter(
            token =>
              this.isMultiAsset ||
              (!this.isMultiAsset && this.activeToken === token)
          )
          .map(token => [token, this.amounts[token]])
      );
    },
    transferError() {
      if (this.tokenError || this.validationError) return undefined;
      if (!this.transactionReverted) return undefined;
      if (hasToken(this.pool, 'SNX')) {
        return this.$t('addStakedSNX');
      }
      const synths = ['sUSD', 'sBTC', 'sETH', 'sXAU', 'sXAG', 'sDEFI', 'sXMR'];
      if (synths.some(synth => hasToken(this.pool, synth))) {
        return this.$t('addSNXUnderwater');
      }
      const aTokens = [
        'aDAI',
        'aUSDT',
        'aUSDC',
        'aSUSD',
        'aTUSD',
        'aBUSD',
        'aBAT',
        'aETH',
        'aKNC',
        'aLEND',
        'aLINK',
        'aMANA',
        'aMKR',
        'aREP',
        'aSNX',
        'aWBTC',
        'aZRX'
      ];
      if (aTokens.some(aToken => hasToken(this.pool, aToken))) {
        return this.$t('addAAVEUnderwater');
      }
      const cTokens = [
        'cUSDC',
        'cDAI',
        'cETH',
        'cUSDT',
        'cREP',
        'cZRX',
        'cBAT',
        'cWBTC'
      ];
      if (cTokens.some(cToken => hasToken(this.pool, cToken))) {
        return this.$t('addCompoundUnderwater');
      }
      return this.$t('addTransferBlocked');
    },
    hasCustomToken() {
      if (this.validationError || this.tokenError) {
        return false;
      }
      for (const token of this.pool.tokens) {
        const tokenMetadata = this.networkdata.tokenMetadata[token.checksum];
        if (!tokenMetadata || !tokenMetadata.whitelisted) {
          return true;
        }
      }
      return false;
    },
    rateChangeWarning() {
      if (this.validationError || this.tokenError) {
        return false;
      }
      if (!this.isMultiAsset) {
        return false;
      }
      const token = this.findFrontrunnableToken;
      if (!token) {
        return false;
      }
      const frontrunningThreshold = 1 - BALANCE_BUFFER;
      const address = token.checksum;
      const amount = bnum(this.amounts[address]);
      const denormAmount = denormalizeBalance(amount, token.decimals);
      const balance = this.$store.state.account.balances[address];
      const amountToBalanceRatio = denormAmount.div(balance);
      return (
        amountToBalanceRatio.gt(frontrunningThreshold) &&
        amountToBalanceRatio.lte(1)
      );
    },
    slippage() {
      if (this.validationError || this.tokenError) {
        return undefined;
      }
      if (this.isMultiAsset) {
        return undefined;
      }
      const tokenInAddress = this.activeToken;
      if (!this.amounts[tokenInAddress]) {
        return undefined;
      }
      const tokenIn = this.pool.tokens.find(
        token => token.checksum === tokenInAddress
      );
      const amount = bnum(this.amounts[tokenInAddress]);

      const tokenBalanceIn = denormalizeBalance(
        tokenIn && tokenIn.balance,
        tokenIn && tokenIn.decimals
      );
      const tokenWeightIn = bnum(tokenIn.denormWeight).times('1e18');
      const poolSupply = denormalizeBalance(this.totalShares, 18);
      const totalWeight = bnum(this.pool.totalWeight).times('1e18');
      const tokenAmountIn = denormalizeBalance(
        amount,
        tokenIn.decimals
      ).integerValue(BigNumber.ROUND_UP);
      const swapFee = bnum(this.pool.swapFee).times('1e18');

      const poolAmountOut = calcPoolOutGivenSingleIn(
        tokenBalanceIn,
        tokenWeightIn,
        poolSupply,
        totalWeight,
        tokenAmountIn,
        swapFee
      );
      const expectedPoolAmountOut = tokenAmountIn
        .times(tokenWeightIn)
        .times(poolSupply)
        .div(tokenBalanceIn)
        .div(totalWeight);
      return bnum(1).minus(poolAmountOut.div(expectedPoolAmountOut));
    },
    findFrontrunnableToken() {
      if (this.validationError) {
        return;
      }
      let maxAmountToBalanceRatio = bnum(0);
      let maxRatioToken = undefined;
      for (const token of this.pool.tokens) {
        const address = token.checksum;
        const amount = bnum(this.amounts[address]);
        const denormAmount = denormalizeBalance(amount, token.decimals);
        const balance = this.$store.state.account.balances[address];
        const amountToBalanceRatio = denormAmount.div(balance);
        if (amountToBalanceRatio.gt(maxAmountToBalanceRatio)) {
          maxAmountToBalanceRatio = amountToBalanceRatio;
          maxRatioToken = token;
        }
      }
      return maxRatioToken;
    },
    isMultiAsset() {
      return this.type === 'MULTI_ASSET';
    }
  },
  methods: {
    ...mapActions(['joinPool', 'joinswapExternAmountIn']),
    getPrecision(address) {
      return this._hasLimitedDecimalToken(address) ? 6 : 18;
    },
    handleChange(changedAmount, changedToken) {
      // this.amounts[changedToken.checksum] = changedAmount;

      if (this.isMultiAsset) {
        const tokenBalanceIn = denormalizeBalance(
          changedToken && changedToken.balance,
          changedToken && changedToken.decimals
        );
        this.poolTokens = calcPoolTokensFromAmount(
          bnum(changedAmount),
          tokenBalanceIn,
          this.totalShares
        );
      } else {
        const tokenIn = this.pool.tokens.find(
          token => token.checksum === this.activeToken
        );
        const amount = new BigNumber(this.amounts[tokenIn.checksum]);

        const maxInRatio = 1 / 2;
        if (amount.div(tokenIn && tokenIn.balance).gt(maxInRatio)) {
          return;
        }

        const tokenBalanceIn = denormalizeBalance(
          tokenIn && tokenIn.balance,
          tokenIn && tokenIn.decimals
        );
        const tokenWeightIn = bnum(tokenIn.denormWeight).times('1e18');
        const poolSupply = denormalizeBalance(this.totalShares, 18);
        const totalWeight = bnum(this.pool.totalWeight).times('1e18');
        const tokenAmountIn = denormalizeBalance(
          amount,
          tokenIn.decimals
        ).integerValue(BigNumber.ROUND_UP);
        const swapFee = bnum(this.pool.swapFee).times('1e18');

        this.poolTokens = calcPoolOutGivenSingleIn(
          tokenBalanceIn,
          tokenWeightIn,
          poolSupply,
          totalWeight,
          tokenAmountIn,
          swapFee
        ).toString();
      }

      this.pool.tokens.forEach(token => {
        if (!this.isMultiAsset) {
          return;
        }

        if (token.checksum === changedToken.checksum) {
          return;
        }

        const ratio = bnum(changedAmount).div(
          changedToken && changedToken.balance
        );
        this.amounts[token.checksum] = ratio.isNaN()
          ? ''
          : ratio.times(token && token.balance).toString();
      });
    },
    handleMax(token) {
      const balance = this.$store.state.account.balances[token.checksum];
      const amount = normalizeBalance(balance, token.decimals);
      this.amounts[token.checksum] = this.getMaxValue(token);
      this.handleTokenSelect(token.checksum);
      this.handleChange(amount, token);
    },

    getMaxValue(token) {
      const balance = this.$store.state.account.balances[token.checksum];
      const amount = normalizeBalance(balance, token.decimals);
      if (this.isMultiAsset) {
        return amount;
      }

      const maxInRatio = 1 / 2;
      const tokenIn = this.pool.tokens.find(
        token => token.checksum === this.activeToken
      );
      const maxBalance = new BigNumber(tokenIn.balance).times(maxInRatio);

      return BigNumber.min(amount, maxBalance).toString();
    },
    lowerAmounts() {
      const frontrunningThreshold = 1 - BALANCE_BUFFER;
      const token = this.findFrontrunnableToken;
      const address = token.checksum;
      const balance = this.$store.state.account.balances[address];
      const safeAmount = bnum(balance).times(frontrunningThreshold);
      const normalizedAmount = normalizeBalance(safeAmount, token.decimals);
      this.amounts[token.checksum] = normalizedAmount.toString();
      this.handleChange(normalizedAmount, token);
    },
    handleSelectType(type) {
      this.type = type;
      this.poolTokens = null;
      this.amounts = Object.fromEntries(
        this.pool.tokens.map(token => {
          return [token.checksum, ''];
        })
      );
    },
    handleTokenSelect(token) {
      this.activeToken = token;
    },
    async handleSubmit() {
      this.loading = true;
      const poolAddress = this.bPool.getBptAddress();
      if (this.isMultiAsset) {
        const params = {
          poolAddress,
          poolAmountOut: this.poolTokens,
          maxAmountsIn: this.pool.tokensList.map(tokenAddress => {
            const token = this.pool.tokens.find(
              token => token.checksum === tokenAddress
            );
            const amount = bnum(this.amounts[token.checksum]);
            const inputAmountIn = denormalizeBalance(amount, token.decimals)
              .times(1.1)
              .integerValue(BigNumber.ROUND_UP);

            const balanceAmountIn = bnum(
              this.$store.state.account.balances[token.checksum]
            );
            const tokenAmountIn = BigNumber.min(inputAmountIn, balanceAmountIn);
            return tokenAmountIn.toString();
          }),
          isCrp: this.bPool.isCrp()
        };
        console.log(`Adding multi-asset liquidity: ${JSON.stringify(params)}`);
        const txResult = await this.joinPool(params);
        // Vue.prototype.$mixpanel.track('addLiquidityToken', {
        //   type: 'multi-asset',
        //   params,
        //   txResult,
        // });
        if (isTxReverted(txResult)) this.transactionReverted = true;
      } else {
        const tokenIn = this.pool.tokens.find(
          token => token.checksum === this.activeToken
        );
        const tokenAmountIn = denormalizeBalance(
          this.amounts[tokenIn.checksum],
          tokenIn.decimals
        )
          .integerValue(BigNumber.ROUND_UP)
          .toString();
        const minPoolAmountOut = bnum(this.poolTokens)
          .times(1 - BALANCE_BUFFER)
          .integerValue(BigNumber.ROUND_UP)
          .toString();
        const params = {
          poolAddress,
          tokenInAddress: this.activeToken,
          tokenAmountIn,
          minPoolAmountOut
        };
        await this.joinswapExternAmountIn(params);
        // Vue.prototype.$mixpanel.track('addLiquidityToken', {
        //   type: 'single-asset',
        //   params,
        //   txResult,
        // });
      }
      this.$store.dispatch('farm/getFarmUserData');
      this.$store.dispatch('prestaking/fetchPreStakingUserData');
      this.$emit('close');
      this.$emit('reload');
      this.$root.$emit('reloadPoolData');
      this.loading = false;
    },
    isInputValid(token) {
      const tokenAddress = token.checksum;
      if (!this.isMultiAsset && this.activeToken !== tokenAddress) {
        return true;
      }
      const amount = this.amounts[tokenAddress];
      if (!amount || isNaN(amount)) {
        return false;
      }
      const amountNumber = denormalizeBalance(amount, token.decimals);
      const balance = this.$store.state.account.balances[tokenAddress];
      return amountNumber.lte(balance);
    },
    formatBalance(balanceString, tokenDecimals) {
      return normalizeBalance(balanceString, tokenDecimals);
    },
    async canAddLiquidity() {
      // Can always add liquidity to a shared pool
      // Can add liquidity to a smart pool unless there is a whitelist (and this address isn't on it)
      if (
        this.bPool.metadata.crp &&
        this.bPool.metadata.rights.canWhitelistLPs
      ) {
        // Need to check if this address is on the LP whitelist
        return await canProvideLiquidity(
          this.bPool.metadata.controller,
          this.$store.state.account.proxy
        );
      }

      return true;
    }
  }
};
</script>

<style scoped lang="scss">
.input-wrapper {
  width: 80px;
}
.quantity-token {
  display: flex;
  justify-content: space-between;
}
.disable {
  pointer-events: none;
  opacity: 0.5;
}
.asset {
  opacity: 0.6;
}

.asset.active {
  opacity: 1;
}

.text {
  font-family: $font-bold;
  font-size: 13px;
  line-height: 20px;
  color: var(--text-color-liquidity);
  opacity: 0.3;
}

.text-token {
  font-family: $font-weight-regular;
  font-size: 15px;
  line-height: 50px;
  color: var(--text-color-liquidity) !important;
  border-radius: $border-radius;
}

.game-text-token {
  font-family: $font-forward !important;
  font-size: 12px !important;
}

.game-btn-input-liquidity {
  padding: 0 14px;
  min-height: 30px;
  line-height: 25px !important;
  background-color: var(--bg-toggle);
  max-width: 100%;
}

.text-addLiquidity {
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

.text-addLiquidity.game {
  font-size: 18px !important;
  @media (max-width: 767px) {
    font-size: 16px !important;
  }
}

.asset::v-deep {
  .line {
    border-left: 1px solid var(--border-color);
    border-right: 1px solid var(--border-color);
    border-bottom: 1px solid var(--border-color);
    background: var(--panel-background);

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

.liquidity {
  background: var(--btn-color-primary);
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
      background: $color-button-hover;
    }
  }
}

.game-button {
  background: var(--btn-color-primary);
  border: none;
  border-radius: 0px !important;
  box-sizing: border-box;
  color: var(--button-enabled-text);
  font-family: $font-forward;
  font-size: 16px;
  text-align: center;
  text-transform: capitalize;
  height: inherit;
  padding: 0 55px;
  &:disabled {
    border: none !important;
    background: var(--btn-color-primary);
    opacity: 0.4;
  }
  &:enabled {
    &:hover {
      background: $game-btn-hover-color;
    }
  }
}
.disabled {
  pointer-events: none;
  cursor: not-allowed;
}
.liquidity-toggle {
  display: flex;
  align-items: flex-start;
  margin-top: 0 !important;
}

.margin {
  margin-top: 0 !important;
}

.padding-table {
  padding-right: 0;
}

.table-error {
  padding: 0 20px !important;
}

.padding-button {
  padding-bottom: 40px !important;
  padding-top: 0 !important;
}

.text-input {
  color: var(--text-color);
}

.column-sm {
  width: 110px;
}

.column-lg-liquidity {
  width: 180px;
}

.column-one-liquidity {
  flex-grow: 1;
}

.column-two-liquidity {
  width: 50px;
}

.column-three-liquidity {
  width: 150px;
  @media only screen and (max-width: 768px) {
    width: 120px !important;
  }
}

.column-token {
  .column-token {
    width: 120px;
    @media only screen and (max-width: 768px) {
      width: 300px;
    }
  }
}

@media only screen and (max-width: 768px) {
  .m-4 {
    margin-left: 15px !important;
    margin-right: 15px !important;
  }

  .game-text-token {
    font-size: 10px !important;
  }

  .mr-3 {
    margin-right: 5px !important;
  }

  .column-sm {
    width: 90px;
  }
  .column-lg-liquidity {
    width: 150px;
  }

  .column-token.column-token {
    width: 300px;
  }

  .ml-1 {
    margin-left: 10px !important;
    margin-right: 15px !important;
  }

  .column-lg {
    width: 160px !important;
  }

  .liquidity-toggle {
    justify-content: center;
  }

  .game-button {
    margin-bottom: 20px !important;
    margin-top: 20px !important;
  }

  .liquidity {
    background: var(--btn-color-primary);
    margin-bottom: 20px !important;
    margin-top: 20px !important;
  }

  .text-addLiquidity {
    margin-left: 0px;
    margin-top: 15px;
    text-align: center;
  }

  .game-btn-input-liquidity {
    min-height: 24px;
    line-height: 28px;
    max-width: 90%;
  }
}
</style>
