<template>
  <UiModal
    :open="open"
    @close="$emit('close')"
    style="max-width: 440px;"
    class="modal-setting-pool"
    :class="_isThemeGame ? 'game' : ''"
  >
    <UiModalForm @submit="handleSubmit">
      <template slot="header">
        <h3 v-text="$t('editTokenWeights')" class="title" />
      </template>
      <div class="mx-3">
        <UiTable
          :class="!_isThemeGame ? 'custom-table' : 'table-pool-setting mb-5'"
        >
          <UiTableTh>
            <div v-text="$t('tokens')" class="flex-auto text-left" />
            <div v-text="$t('weights')" class="column-sm" />
            <div v-text="$t('percent')" class="column-sm" />
          </UiTableTh>
          <UiTableTr v-for="(token, i) in pool.tokens" :key="token.checksum">
            <Token :address="token.checksum" size="28" class="mr-2" />
            <div class="flex-auto text-left">
              {{ _ticker(token.checksum) }}
            </div>
            <div class="column-sm text-right">
              <currency-input
                v-model="weights[i]"
                class="input text-right"
                :class="
                  `${validationError ? 'text-red' : 'input-text'} ${
                    _isThemeGame
                      ? 'game-btn-input-2 game-placeholder-small no-radius mr-2'
                      : ''
                  }`
                "
                placeholder="50"
                :precision="18"
                type="text"
                ref="number"
                @keyup="handleInputChange(i, weights[i])"
              />
            </div>
            <div class="column-sm text-right">
              {{
                _num(parseFloat(initialPercentages[i]).toFixed(4), 'percent')
              }}
              →
              {{
                _num(parseFloat(weights[i] / totalWeight).toFixed(4), 'percent')
              }}
            </div>
          </UiTableTr>
        </UiTable>
      </div>
      <div v-if="isLocked" class="my-2 text-center">
        <span
          v-text="`${$t('unlock')} ${tokenToSpend.symbol} ${$t('toContinue')}.`"
        ></span>
        <ButtonUnlock
          :tokenAddress="tokenToSpend.address"
          :amount="amountToSpend.toString()"
          :decimals="tokenToSpend.decimals"
        />
      </div>
      <MessageError
        v-if="validationError"
        :text="validationError"
        class="mt-4"
      />
      <MessageWarning
        v-if="validUpdate"
        :text="validUpdate"
        class="mt-4"
        :class="_isThemeGame ? 'edit-token-popup' : ''"
      />
      <template slot="footer">
        <div class="footer">
          <UiButton
            :disabled="loading || !isValid || isLocked || !isEnoughBalance"
            :loading="loading"
            type="submit"
            class="mx-1 btn-setting-confirm btn-setting"
            :class="_isThemeGame ? 'game-border-btn-add' : ''"
          >
            {{ $t('confirm') }}
          </UiButton>
          <UiButton
            @click="$emit('close')"
            type="button"
            class="mx-1 btn-setting-cancel btn-setting"
            :class="_isThemeGame ? 'game-border-btn-add' : ''"
          >
            {{ $t('cancel') }}
          </UiButton>
        </div>
      </template>
    </UiModalForm>
  </UiModal>
</template>

<script>
import { getAddress } from '@ethersproject/address';
import { mapActions } from 'vuex';
import {
  calcSingleInGivenWeightIncrease,
  calcSingleOutGivenWeightDecrease,
  calcPoolInGivenWeightDecrease,
  calcPoolOutGivenWeightIncrease
} from '@/helpers/math';
import { bnum, toWei, scale, isLocked } from '@/helpers/utils';
import { getDivisor, getMaxTotalWeight } from '@/helpers/weights';
import CurrencyInput from '../CurrencyInput.vue';

export default {
  components: { CurrencyInput },
  props: ['open', 'pool', 'defaultValue'],
  data() {
    return {
      loading: false,
      tokenIndex: 0,
      initialPercentages: [],
      weights: [],
      divisor: 0,
      maxPercentage: 0,
      changeTokenAmount: 0,
      changeBptAmount: 0
    };
  },
  watch: {
    open(value) {
      if (value) {
        this.loading = false;
        this.divisor = getDivisor(false);
        this.maxPercentage = 100 - this.divisor;
        this.weights = this.pool.tokens.map(token =>
          parseFloat(token.denormWeight)
        );
        this.currentTime = Date.now();
        this.initialPercentages = this.pool.tokens.map(
          token =>
            parseFloat(token.denormWeight) / parseFloat(this.pool.totalWeight)
        );
      }
    }
  },
  computed: {
    totalWeight() {
      return this.weights.reduce((a, b) => a + parseFloat(b), 0);
    },
    tokenToSpend() {
      if (this.isWeightIncrease) {
        const token = this.pool.tokens[this.tokenIndex];

        // Return an object here, including the decimals
        // If it is a BPT, we know it is 18 decimals - and it might not be in the metadata
        //   If it's not in the metadata and we don't pass decimals, it will blow up in Unlock
        return {
          address: token.checksum,
          symbol: token.symbol,
          decimals: this.networkdata.tokenMetadata[token.checksum]
        };
      } else if (this.isWeightDecrease) {
        return {
          address: getAddress(this.pool.controller),
          symbol: this.pool.symbol,
          decimals: 18
        };
      }

      return { address: undefined, symbol: undefined, decimals: undefined };
    },
    amountToSpend() {
      const token = this.pool.tokens[this.tokenIndex];
      if (this.isWeightIncrease) {
        const tokenAmountIn = calcSingleInGivenWeightIncrease(
          scale(bnum(token.balance), token.decimals),
          toWei(token.denormWeight),
          toWei(this.weights[this.tokenIndex])
        );

        return tokenAmountIn;
      } else if (this.isWeightDecrease) {
        const totalWeight =
          this.totalWeight +
          parseFloat(token.denormWeight) -
          parseFloat(this.weights[this.tokenIndex]);

        const poolAmountIn = calcPoolInGivenWeightDecrease(
          toWei(totalWeight),
          toWei(token.denormWeight),
          toWei(this.weights[this.tokenIndex]),
          toWei(bnum(this.pool.totalShares))
        );
        return poolAmountIn.toString();
      }
      return '0';
    },
    isLocked() {
      if (!this.tokenToSpend.address) {
        return false;
      }
      return isLocked(
        this.$store.state.account.allowances,
        this.tokenToSpend.address,
        this.$store.state.account.proxy,
        this.amountToSpend,
        this.tokenToSpend.decimals
      );
    },
    isWeightIncrease() {
      const weight = parseFloat(this.pool.tokens[this.tokenIndex].denormWeight);
      const newWeight = parseFloat(this.weights[this.tokenIndex]);
      return newWeight > weight;
    },
    isWeightDecrease() {
      const weight = parseFloat(this.pool.tokens[this.tokenIndex].denormWeight);
      const newWeight = parseFloat(this.weights[this.tokenIndex]);
      return newWeight < weight;
    },
    validationError() {
      // Ensure percentages are within the valid range (user can type any numbers)
      const totalWeight = this.weights.reduce((a, b) => a + parseFloat(b), 0);

      if (totalWeight > getMaxTotalWeight(true)) {
        return this.$t('errInvalidTotalDenorm', {
          min: this.weights.length,
          max: getMaxTotalWeight(true)
        });
      }

      const MIN_WEIGHT = 1;

      for (let idx = 0; idx < this.weights.length; idx++) {
        const percentage = (this.weights[idx] / totalWeight) * 100;

        if (this.weights[idx] < MIN_WEIGHT) {
          return this.$t('errInvalidMinDenorm', {
            value: MIN_WEIGHT
          });
        }

        if (percentage < this.divisor || percentage > this.maxPercentage) {
          return this.$t('errInvalidDenorm', {
            min: this.divisor,
            max: this.maxPercentage
          });
        }
      }

      return false;
    },
    isEnoughBalance() {
      const selectedToken = this.pool.tokens[this.tokenIndex];
      const myTokenBalance =
        this.$store.state.account.balances[selectedToken.address] ||
        this.$store.state.account.balances[getAddress(selectedToken.address)] ||
        0;

      if (this.isWeightIncrease) {
        console.log(
          `myTokenBalance ${selectedToken.address}`,
          scale(bnum(myTokenBalance), -selectedToken.decimals).toString()
        );
        console.log('changeTokenAmount', this.changeTokenAmount);

        return (
          scale(bnum(myTokenBalance), -selectedToken.decimals).comparedTo(
            this.changeTokenAmount
          ) >= 0
        );
      }

      const myBptBalance =
        this.$store.state.account.balances[getAddress(this.pool.controller)] ||
        0;

      console.log(
        `myBptBalance ${getAddress(this.pool.controller)}`,
        bnum(myBptBalance)
          .div(10 ** 18)
          .toString()
      );
      console.log('changeBptAmount', this.changeBptAmount);
      return (
        bnum(myBptBalance)
          .div(10 ** 18)
          .comparedTo(this.changeBptAmount) >= 0
      );
    },
    isValid() {
      // This controls the confirm button - ok to confirm if we're changing something, and it's valid
      const isWeightChange = this.isWeightIncrease || this.isWeightDecrease;

      return isWeightChange && !this.validationError;
    },
    validUpdate() {
      // This calculates and displays all the token transfers this weight update will do
      // The unlock logic additionally ensures we have approval to transfer (either the token, or the BPT)

      if (this.isValid) {
        // If it is a weight increase, we are depositing tokens and minting BPTs
        // If it is a weight decrease, we are withdrawing tokens and burning BPTs

        // The tokenToSpend logic only cares about which token we're depositing; won't be set if we're burning BPT
        // We need the constituent token too, since we are also calculating and displaying tokens coming out of the pool
        const selectedToken = this.pool.tokens[this.tokenIndex];
        const tokenSymbol = this.isWeightDecrease
          ? selectedToken.symbol
          : this.tokenToSpend.symbol;

        const totalWeight = this.isWeightDecrease
          ? 0 // if a decrease, we don't need the total, so don't waste cycles on it
          : this.totalWeight +
            parseFloat(selectedToken.denormWeight) -
            parseFloat(this.weights[this.tokenIndex]);

        let tokenAmount = this.isWeightDecrease
          ? calcSingleOutGivenWeightDecrease(
              bnum(selectedToken.balance),
              toWei(selectedToken.denormWeight),
              toWei(this.weights[this.tokenIndex])
            ).toFixed(2)
          : scale(bnum(this.amountToSpend), -selectedToken.decimals).toFixed(2);

        let bptAmount = this.isWeightDecrease
          ? scale(bnum(this.amountToSpend), -18).toFixed(8)
          : calcPoolOutGivenWeightIncrease(
              toWei(totalWeight),
              toWei(selectedToken.denormWeight),
              toWei(this.weights[this.tokenIndex]),
              bnum(this.pool.totalShares)
            );

        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.changeTokenAmount = tokenAmount;
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.changeBptAmount = bptAmount;

        if (bnum(tokenAmount).comparedTo(0.0000001) === -1) {
          tokenAmount = '< 0.0000001';
        }

        if (bnum(bptAmount).comparedTo(0.0000001) === -1) {
          bptAmount = '< 0.0000001';
        }

        return this.$t('infoWeightUpdate', {
          tokenAction: this.isWeightDecrease
            ? this.$t('withdraw').toLowerCase()
            : this.$t('deposit').toLowerCase(),
          tokenAmount: tokenAmount,
          tokenSymbol: tokenSymbol,
          bptAction: this.isWeightDecrease ? this.$t('burn') : this.$t('mint'),
          bptAmount: bptAmount,
          bptSymbol: this.pool.symbol
        });
      }

      return false;
    }
  },
  methods: {
    ...mapActions('account', ['getPoolAllowances', 'fetchAssets']),
    ...mapActions(['increaseWeight', 'decreaseWeight']),
    handleInputChange(i, weight) {
      this.tokenIndex = i;
      this.weights = this.pool.tokens.map(token =>
        parseFloat(token.denormWeight)
      );
      this.weights[i] = weight;
    },
    async handleSubmit() {
      this.loading = true;
      const token = this.pool.tokens[this.tokenIndex];

      if (this.isWeightIncrease) {
        const tokenWeiAmountIn = bnum(this.amountToSpend);
        const tokenAmountIn = scale(tokenWeiAmountIn, -token.decimals);

        console.log('increaseWeight', {
          poolAddress: this.pool.controller,
          token: token.checksum,
          newWeight: this.weights[this.tokenIndex],
          tokenWeiAmountIn: bnum(this.amountToSpend).toString()
        });
        await this.increaseWeight({
          poolAddress: this.pool.controller,
          token: token.checksum,
          newWeight: this.weights[this.tokenIndex],
          tokenAmountIn
        });
      } else {
        const poolWeiAmountIn = bnum(this.amountToSpend);

        console.log('decreaseWeight', {
          poolAddress: this.pool.controller,
          token: token.checksum,
          newWeight: this.weights[this.tokenIndex],
          poolWeiAmountIn: poolWeiAmountIn.toString()
        });

        await this.decreaseWeight({
          poolAddress: this.pool.controller,
          token: token.checksum,
          newWeight: this.weights[this.tokenIndex],
          poolWeiAmountIn
        });
      }
      this.$emit('close');
      this.loading = false;
    }
  },
  mounted() {
    this.fetchAssets([getAddress(this.pool.controller)]);
    this.getPoolAllowances([getAddress(this.pool.controller)]);
  }
};
</script>
<style lang="scss" scoped>
.edit-token-popup {
  max-width: 376px;
  @media (max-width: 767px) {
    max-width: 332px;
  }
}
.title {
  color: var(--text-color) !important;
}
.content {
  margin-bottom: 30px !important;
}
.footer {
  padding-bottom: 40px;
}
.input-text {
  color: var(--text-color);
}
.custom-table {
  overflow: hidden;
  margin-bottom: 20px;
}

input.game-btn-input-2 {
  min-height: 20px !important;
  line-height: 1 !important;
  width: 80%;
  font-size: 11px !important;
}
</style>
