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
          v-text="$t('removeLiquidity')"
          class="remove-Liquidity"
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
              v-for="token in tokens"
              :key="token.address"
              class="asset"
              :class="{
                active: isMultiAsset || activeToken === token.address
              }"
            >
              <div
                class="column-lg-liquidity flex-auto flex-items-center d-flex text-left"
              >
                <UiRadio
                  class="mr-1"
                  v-if="!isMultiAsset"
                  :checked="activeToken === token.address"
                  :onChange="
                    e => {
                      onTokenSelect(token.address);
                    }
                  "
                  :class="loading && 'disable'"
                />
                <div
                  v-bind:class="[
                    token.symbol.length > 7 && 'tooltipped tooltipped-ne',
                    _isThemeGame && 'game-text-token'
                  ]"
                  :aria-label="token.symbol"
                  class="text-token d-flex flex-items-center text-uppercase"
                >
                  <Token :address="token.address" class="mr-3" size="20" />
                  {{
                    _isMobile
                      ? _shorten(token.symbol, 4)
                      : _shorten(token.symbol, 7)
                  }}
                </div>
              </div>
              <div
                class="column-token"
                :class="_isThemeGame && 'game-text-token'"
              >
                {{
                  token.myBalance
                    ? _num(checkWithdrawalAmt(token.myBalance))
                      ? _num(token.myBalance)
                      : _num(parseFloat(token.myBalance))
                    : '-'
                }}
              </div>
              <div
                class="column-token"
                :class="_isThemeGame && 'game-text-token'"
              >
                {{
                  getTokenAmountOut(token)
                    ? _num(checkWithdrawalAmt(getTokenAmountOut(token)))
                      ? _num(getTokenAmountOut(token))
                      : _num(parseFloat(getTokenAmountOut(token)))
                    : '-'
                }}
              </div>
            </UiTableTr>
          </UiTable>
          <UiTable class="mt-4 table-liquidity">
            <UiTableTh
              class="text-left flex-items-center text-token table-liquidity"
            >
              <div v-text="$t('amount')" class="flex-auto" />
              <div class="ml-2">
                {{ _num(parseFloat(poolTokenBalance)) }}
                {{ _shorten(pool.symbol, 12) }}
                <a
                  @click="setMax"
                  class="link-text mr-3"
                  :class="loading && 'disable'"
                >
                  <UiLabel v-text="$t('max')" />
                </a>
              </div>
              <currency-input
                id="poolAmountIn"
                v-model="poolAmountIn"
                :max="totalShares"
                :min="0"
                :precision="12"
                type="text"
                step="any"
                v-bind:class="[
                  validationError ? 'text-red' : 'text-input',
                  _isThemeGame
                    ? 'game-placeholder-small game-text-token game-btn-input-liquidity'
                    : 'input',
                  loading && 'disable'
                ]"
                class="cards__input-number text-right column-sm"
                placeholder="0.0"
              />
            </UiTableTh>
          </UiTable>
        </div>
      </div>
      <div class="m-4">
        <MessageError v-if="validationError" :text="validationError" class="" />
        <MessageSlippage
          v-if="slippage"
          :value="slippage"
          :isDeposit="false"
          class="mb-4"
        />
      </div>
      <template slot="footer">
        <div :class="_isThemeGame ? 'pt-4 pb-3 mt-4' : 'pt-4'">
          <Button
            :requireLogin="true"
            :disabled="validationError || loading"
            @submit="handleSubmit"
            :loading="loading"
            class="btn-liquidity"
            :class="_isThemeGame ? 'game-button' : 'liquidity'"
          >
            {{ $t('removeLiquidity') }}
          </Button>
        </div>
      </template>
    </UiModalForm>
  </UiModal>
</template>

<script>
import { BigNumber } from 'bignumber.js';
import { mapActions } from 'vuex';
import { getAddress } from '@ethersproject/address';
import {
  bnum,
  normalizeBalance,
  denormalizeBalance,
  liquidityToggleOptions,
  scale
} from '@/helpers/utils';
import {
  bdiv,
  bmul,
  calcPoolInGivenSingleOut,
  calcSingleInGivenPoolOut,
  calcSingleOutGivenPoolIn
} from '@/helpers/math';
import { validateNumberInput, formatError } from '@/helpers/validation';
import CurrencyInput from '@/components/CurrencyInput.vue';
import Vue from 'vue';

const BALANCE_BUFFER = 0.01;
const SINGLE_TOKEN_THRESHOLD = 0.99;

export default {
  props: ['open', 'pool', 'bPool'],
  data() {
    return {
      liquidityToggleOptions,
      loading: false,
      poolAmountIn: '',
      type: 'MULTI_ASSET',
      activeToken: null
    };
  },
  components: {
    CurrencyInput
  },
  watch: {
    open() {
      this.poolAmountIn = '';
      this.loading = false;
      this.type = 'MULTI_ASSET';
      this.activeToken = this.pool.tokens[0].address;
    },
    isMultiAsset() {
      this.poolAmountIn = '';
    }
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
      const poolSharesFrom = this.poolTokenBalance;
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

      const poolTokens = parseFloat(this.poolAmountIn);
      const future = (poolSharesFrom - poolTokens) / (totalShares - poolTokens);
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
    tokens() {
      return this.pool.tokens.map(token => {
        token.myBalance = this.getTokenBalance(token);
        return token;
      });
    },
    validationError() {
      const amountError = validateNumberInput(this.poolAmountIn);
      const amountErrorText = formatError(amountError, this.$t('amount'));
      if (amountErrorText) return amountErrorText;
      // Amount validation
      const amount = bnum(this.poolAmountIn);
      if (amount.gt(this.poolTokenBalance)) {
        return this.$t('errExceedsBalance');
      }
      if (this.isMultiAsset && amount.lt(0.0000000000000001)) {
        return this.$t('errMinimumBalance');
      }

      const maxValue = this.getMaxValue();
      if (this.isMultiAsset && amount.gt(maxValue)) {
        return this.$t('errMaximumBalance');
      }
      // Max ratio out validation
      if (!this.isMultiAsset) {
        const tokenOutAddress = this.activeToken;
        const tokenOut = this.pool.tokens.find(
          token => token.address === tokenOutAddress
        );

        // Seem to be rare cases when a token isn't selected
        if (!tokenOut) {
          return this.$t('selectToken');
        }

        const maxOutRatio = 1 / 3;
        const amount = denormalizeBalance(this.poolAmountIn, 18);

        const tokenBalanceOut = denormalizeBalance(
          tokenOut.balance,
          tokenOut.decimals
        );
        const tokenWeightOut = bnum(tokenOut.denormWeight).times('1e18');
        const poolSupply = denormalizeBalance(this.totalShares, 18);
        const totalWeight = bnum(this.pool.totalWeight).times('1e18');
        const swapFee = bnum(this.pool.swapFee).times('1e18');

        if (amount.div(poolSupply).gt(SINGLE_TOKEN_THRESHOLD)) {
          // Invalidate user's attempt to withdraw the entire pool supply in a single token
          // At amounts close to 100%, solidity math freaks out
          return this.$t('insufficientLiquidity');
        }

        const tokenAmountOut = calcSingleOutGivenPoolIn(
          tokenBalanceOut,
          tokenWeightOut,
          poolSupply,
          totalWeight,
          amount,
          swapFee
        );

        if (tokenAmountOut.div(tokenBalanceOut).gt(maxOutRatio)) {
          return this.$t('insufficientLiquidity');
        }
      }
      return undefined;
    },
    slippage() {
      if (this.validationError) return undefined;
      if (this.isMultiAsset) return undefined;

      const tokenOutAddress = this.activeToken;
      const tokenOut = this.pool.tokens.find(
        token => token.address === tokenOutAddress
      );
      const amount = bnum(this.poolAmountIn).times('1e18');

      const tokenBalanceOut = denormalizeBalance(
        tokenOut.balance,
        tokenOut.decimals
      );
      const tokenWeightOut = bnum(tokenOut.denormWeight).times('1e18');
      const poolSupply = denormalizeBalance(this.totalShares, 18);
      const totalWeight = bnum(this.pool.totalWeight).times('1e18');
      const swapFee = bnum(this.pool.swapFee).times('1e18');

      if (amount.div(poolSupply).gt(SINGLE_TOKEN_THRESHOLD)) {
        // Invalidate user's attempt to withdraw the entire pool supply in a single token
        // At amounts close to 100%, solidity math freaks out
        return 0;
      }

      const tokenAmountOut = calcSingleOutGivenPoolIn(
        tokenBalanceOut,
        tokenWeightOut,
        poolSupply,
        totalWeight,
        amount,
        swapFee
      );
      const expectedTokenAmountOut = amount
        .times(totalWeight)
        .times(tokenBalanceOut)
        .div(poolSupply)
        .div(tokenWeightOut);
      return bnum(1).minus(tokenAmountOut.div(expectedTokenAmountOut));
    },
    isMultiAsset() {
      return this.type === 'MULTI_ASSET';
    }
  },
  methods: {
    ...mapActions(['exitPool', 'exitswapPoolAmountIn']),
    handleInputChange(value) {
      this.poolAmountIn = value && this._validInputNumber(value);
    },
    async handleSubmit() {
      this.loading = true;
      const poolAddress = this.bPool.getBptAddress();
      if (this.isMultiAsset) {
        const txResult = await this.exitPool({
          poolAddress,
          poolAmountIn: this.poolAmountIn,
          minAmountsOut: this.pool.tokensList.map(() => '0')
          // FIXME Code below leads to withdrawal issues
          // minAmountsOut: this.pool.tokensList.map(tokenAddress => {
          //   const token = this.pool.tokens.find(
          //     token => token.checksum === tokenAddress
          //   );
          //   return denormalizeBalance(
          //     this.getTokenAmountOut(token),
          //     token.decimals
          //   )
          //     .times(1 - BALANCE_BUFFER)
          //     .integerValue(BigNumber.ROUND_UP)
          //     .toString();
          // })
        });
        // Vue.prototype.$mixpanel.track('removeLiquidityToken', {
        //   type: 'multi-asset',
        //   params: {
        //     poolAddress,
        //     poolAmountIn: this.poolAmountIn,
        //     minAmountsOut: this.pool.tokensList.map(() => '0')
        //   },
        //   txResult,
        // });
      } else {
        const tokenOutAddress = this.activeToken;
        const tokenOut = this.pool.tokens.find(
          token => token.address === this.activeToken
        );
        const minTokenAmountOut = denormalizeBalance(
          this.getTokenAmountOut(tokenOut),
          tokenOut.decimals
        )
          .times(1 - BALANCE_BUFFER)
          .integerValue(BigNumber.ROUND_UP)
          .toString();
        await this.exitswapPoolAmountIn({
          poolAddress,
          tokenOutAddress,
          poolAmountIn: this.poolAmountIn,
          minTokenAmountOut
        });
        // Vue.prototype.$mixpanel.track('removeLiquidityToken', {
        //   type: 'single-asset',
        //   params: {
        //     poolAddress,
        //     tokenOutAddress,
        //     poolAmountIn: this.poolAmountIn,
        //     minTokenAmountOut
        //   },
        //   txResult
        // });
      }
      this.$store.dispatch('farm/getFarmUserData');
      this.$store.dispatch('prestaking/fetchPreStakingUserData');
      this.$emit('close');
      this.$emit('reload');
      this.$root.$emit('reloadPoolData');
      this.loading = false;
    },
    handleSelectType(type) {
      this.type = type;
    },
    onTokenSelect(token) {
      this.activeToken = token;
    },
    getTokenBalance(token) {
      if (!this.poolTokenBalance) return 0;
      return (this.poolTokenBalance / this.totalShares) * token.balance;
    },
    getTokenAmountOut(token) {
      if (!this.poolAmountIn || !parseFloat(this.poolAmountIn)) return 0;
      if (this.isMultiAsset) {
        return (token.balance / this.totalShares) * this.poolAmountIn;
      } else {
        if (this.activeToken !== token.address) {
          return 0;
        }
        const tokenOut = this.pool.tokens.find(
          token => token.address === this.activeToken
        );
        const amount = denormalizeBalance(this.poolAmountIn, 18);

        const tokenBalanceOut = denormalizeBalance(
          tokenOut.balance,
          tokenOut.decimals
        );
        const tokenWeightOut = bnum(tokenOut.denormWeight).times('1e18');
        const poolSupply = denormalizeBalance(this.totalShares, 18);
        const totalWeight = bnum(this.pool.totalWeight).times('1e18');
        const swapFee = bnum(this.pool.swapFee).times('1e18');

        // Need this check here as well (same as in validationError)
        // Otherwise, if amount > poolSupply, ratio is negative, and bpowApprox will not converge
        if (amount.div(poolSupply).gt(SINGLE_TOKEN_THRESHOLD)) {
          return 0;
        }

        const tokenAmountOut = calcSingleOutGivenPoolIn(
          tokenBalanceOut,
          tokenWeightOut,
          poolSupply,
          totalWeight,
          amount,
          swapFee
        );
        const tokenAmountNormalized = normalizeBalance(
          tokenAmountOut,
          tokenOut.decimals
        );
        console.log({
          amount: amount.toString(),
          tokenBalanceOut: tokenBalanceOut.toString(),
          tokenWeightOut: tokenWeightOut.toString(),
          poolSupply: poolSupply.toString(),
          totalWeight: totalWeight.toString(),
          tokenAmountOut: tokenAmountOut.toString(),
          tokenAmountNormalized: tokenAmountNormalized.toString()
        });
        return tokenAmountNormalized.toNumber();
      }
    },
    setMax() {
      this.poolAmountIn = this.getMaxValue();
    },
    getMaxValue() {
      if (!this.isMultiAsset) {
        const tokenOutAddress = this.activeToken;
        const tokenOut = this.pool.tokens.find(
          token => token.address === tokenOutAddress
        );

        // Seem to be rare cases when a token isn't selected
        if (!tokenOut) {
          return this.$t('selectToken');
        }

        const maxOutRatio = 1 / 3;

        const tokenBalanceOut = denormalizeBalance(
          tokenOut.balance,
          tokenOut.decimals
        );
        const tokenWeightOut = bnum(tokenOut.denormWeight).times('1e18');
        const poolSupply = denormalizeBalance(this.totalShares, 18);
        const totalWeight = bnum(this.pool.totalWeight).times('1e18');
        const swapFee = bnum(this.pool.swapFee).times('1e18');

        const weiPoolIn = calcPoolInGivenSingleOut(
          tokenBalanceOut,
          tokenWeightOut,
          poolSupply,
          totalWeight,
          tokenBalanceOut.times(maxOutRatio),
          swapFee
        );

        const poolIn = normalizeBalance(weiPoolIn, 18);
        return BigNumber.min(poolIn, this.poolTokenBalance.toString());
      }
      if (
        this.pool.crp &&
        this.poolTokenBalance.comparedTo(this.totalShares) === 0
      ) {
        let minPercent = 1;
        this.pool.tokens.forEach(tokenOut => {
          const denormalizeBalance = scale(
            bnum(tokenOut.balance),
            tokenOut.decimals
          );
          const percent = denormalizeBalance
            .minus(10 ** 12)
            .div(denormalizeBalance)
            .toString();
          if (minPercent >= percent) {
            minPercent = percent;
          }
        });
        minPercent = Math.max(minPercent, 0);

        return this.poolTokenBalance.times(minPercent).toString();
      }
      return this.poolTokenBalance.toString();
    },
    checkWithdrawalAmt(value) {
      if (parseFloat(value) <= 1e6) return true;
      else return false;
    }
  }
};
</script>

<style scoped lang="scss">
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

  @media (max-width: 767px) {
    font-size: 10px !important;
  }
}

.game-btn-input-liquidity {
  padding: 0 14px;
  min-height: 30px;
  line-height: 25px !important;
  background-color: var(--bg-toggle);
  max-width: 100%;
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

.remove-Liquidity.game {
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
      background: var(--hover-background) !important;
    }
  }

  &:nth-child(odd) {
    &:hover {
      .line {
        background: var(--hover-background) !important;
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
  color: var(--button-enabled-text) !important;
  font-family: $font-bold;
  font-size: 20px;
  text-align: center;
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

  @media (max-width: 767px) {
    margin-bottom: 20px !important;
    margin-top: 20px !important;
  }
}

.game-button {
  background: var(--btn-color-primary);
  border: none;
  border-radius: 0 !important;
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

  @media (max-width: 767px) {
    margin-bottom: 20px !important;
    margin-top: 20px !important;
  }
}

.liquidity-toggle {
  display: flex;
  align-items: flex-start;
  margin-top: 0 !important;
  @media (max-width: 767px) {
    justify-content: center;
  }
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
  padding-top: 0px !important;

  @media (max-width: 767px) {
    padding: 40px !important;
  }
}

.text-input {
  color: var(--text-color);
}

.column-token {
  width: 120px;
}

.column-lg-liquidity {
  width: 180px;

  @media only screen and (max-width: 768px) {
    width: 320px;
  }
}

.ml-2 {
  margin-left: 0.5rem !important;

  @media only screen and (max-width: 768px) {
    margin-left: 0 !important;
    margin-right: 10px !important;
  }
}

.column-sm {
  width: 110px;
  @media only screen and (max-width: 768px) {
    width: 90px;
  }
}

.column-sm-liquidity {
  width: 110px;
  min-width: 30px;
  @media only screen and (max-width: 768px) {
    width: 100px !important;
  }
}

.m-4 {
  @media only screen and (max-width: 768px) {
    margin-left: 15px !important;
    margin-right: 15px !important;
  }
}

.mr-3 {
  @media only screen and (max-width: 768px) {
    margin-right: 5px !important;
  }
}

.column-lg {
  @media only screen and (max-width: 768px) {
    width: 160px !important;
  }
}
</style>
