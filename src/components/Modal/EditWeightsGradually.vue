<template>
  <UiModal
    :open="open"
    @close="$emit('close')"
    style="max-width: 440px"
    class="modal-setting-pool"
    :class="_isThemeGame ? 'game' : ''"
  >
    <UiModalForm @submit="handleSubmit">
      <template slot="header">
        <h3
          v-text="$t('gradualWeightUpdate')"
          class="gradual-weight-update-title"
        />
      </template>
      <div class="mx-3">
        <UiTable
          :class="!_isThemeGame ? 'custom-table' : 'table-pool-setting mb-5'"
        >
          <UiTableTh>
            <div v-text="$t('tokens')" class="flex-auto text-left" />
            <div v-text="$t('weights')" class="column" />
            <div v-text="$t('percent')" class="column" />
          </UiTableTh>
          <UiTableTr v-for="(token, i) in pool.tokens" :key="token.checksum">
            <Token :address="token.checksum" size="28" class="mr-2" />
            <div class="flex-auto text-left">
              {{ _ticker(token.checksum) }}
            </div>
            <div
              class="column-sm text-right tooltipped tooltipped-n"
              :class="_isThemeGame ? 'game-tooltip' : ''"
              :aria-label="currentDenorm(weights[i])"
            >
              <currency-input
                v-model="weights[i]"
                class="input text-right"
                placeholder="50"
                :class="
                  `${
                    isWeightInputValid(weights[i]) ? 'input-text' : 'text-red'
                  } ${
                    _isThemeGame
                      ? 'game-btn-input-2 game-placeholder-small no-radius mr-2'
                      : ''
                  }`
                "
                type="text"
                ref="number"
                :precision="18"
                @keyup="
                  e => {
                    handleInputChange(i);
                  }
                "
              />
            </div>
            <div class="column-sm text-right">
              {{
                _num(
                  (
                    parseFloat(pool.tokens[i].denormWeight) / oldTotalWeight
                  ).toFixed(4),
                  'percent'
                )
              }}
              → {{ _num((weights[i] / totalWeight).toFixed(4), 'percent') }}
            </div>
          </UiTableTr>
        </UiTable>
      </div>
      <div class="m-4">
        <div
          v-if="this.networkdata.blockNumber > 0"
          class="d-flex flex-items-center mb-2"
          :class="_isThemeGame ? 'mb-4' : ''"
        >
          <div
            v-text="$t('startBlock')"
            class="flex-auto text-label time-block"
            :class="_isThemeGame ? 'game' : ''"
          />
          <div class="column-sm">
            <currency-input
              v-model="startBlock"
              class="input input-blocknumber text-right ml-2"
              placeholder="0"
              :class="
                `${isStartBlockValid ? 'input-text' : 'text-red'} ${
                  _isThemeGame
                    ? 'game-btn-input-2 game-placeholder-small no-radius ml-4'
                    : ''
                }`
              "
              :precision="18"
            />
          </div>
          <div
            v-text="formatBlockNumber(startBlock)"
            class="column-lg text-right text-label "
            :class="_isThemeGame ? 'game' : ''"
          />
        </div>
        <div class="d-flex flex-items-center mb-2">
          <div
            v-text="$t('endBlock')"
            class="flex-auto text-label time-block"
            :class="_isThemeGame ? 'game' : ''"
          />
          <div class="column-sm">
            <currency-input
              v-model="endBlock"
              class="input input-blocknumber text-right ml-2"
              placeholder="0"
              :class="
                `${isEndBlockValid ? 'input-text' : 'text-red'} ${
                  _isThemeGame
                    ? 'game-btn-input-2 game-placeholder-small no-radius ml-4'
                    : ''
                }`
              "
              :precision="18"
            />
          </div>
          <div
            v-text="formatBlockNumber(endBlock)"
            class="column-lg text-right text-label "
            :class="_isThemeGame ? 'game' : ''"
          />
        </div>
      </div>
      <MessageError
        v-if="validationError"
        :text="validationError"
        class="mt-4"
      />
      <template slot="footer">
        <div class="footer">
          <UiButton
            :disabled="loading || !isValid || this.networkdata.blockNumber == 0"
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
import { mapActions } from 'vuex';
import { blockNumberToTimestamp, bnum } from '@/helpers/utils';
import {
  getDenorm,
  getDivisor,
  getMaxTotalWeight,
  isValidDenormValue
} from '@/helpers/weights';
import CurrencyInput from '../CurrencyInput.vue';

// Testing Guide
//
// 1) Open a 45/5 pool; "old" percentages will be 90/10
//   Check that "new" denorms are 22.5/2.5 (max 25)
//   90% -> 90% / 10% -> 10% -- same percentages, but denorms are different
// 2) Open a 49/1 pool; "old" percentages are 98/2
//      "new" percentages will show the same, but the "1" will be red (invalid)
//    Change the 49 to 24
//      Error cleared; now shows 98% -> 96%, 2% -> 4%
// 3) Open a 15/5 pool (75%/25%)
//      Shows 75% -> 75%, 25% -> 25%, but denorms show 18.75/6.25 (20 -> 25 total)
//    Change the 5 to 50
//      Shows 75% -> 23.08%, 25% -> 76.92%; denorms 5.769/19.231
//    Change to 50 to 500
//      15 is now red (out of range error), denorm 0.728, 75% -> 2.91%
//    Change the 15 to 150
//      Error cleared; percentages and denorms same as 15/50
// 4) Confirm button desensitized whenever the input is red
// 5) Type in a start block before the present
//      Start block turns red; confirm button disabled
// 6) Type in the end block equal to the start block
//      End block turns red; confirm button disabled

// Allow time to edit and submit the form before the update starts
// Initialize the start block to the current block + BLOCK_BUFFER
const BLOCK_BUFFER = 200;

export default {
  components: { CurrencyInput },
  props: ['open', 'pool', 'bPool'],
  data() {
    return {
      loading: false,
      weights: [],
      currentTime: 0,
      startBlock: 0,
      endBlock: 0,
      maxPercentage: 0,
      divisor: 0,
      tokenIndex: 0
    };
  },
  watch: {
    async open(value) {
      if (value) {
        this.loading = false;
        this.divisor = getDivisor(false);
        this.maxPercentage = 100 - this.divisor;
        this.weights = this.pool.tokens.map(token =>
          parseFloat(token.denormWeight)
        );
        this.currentTime = Date.now();
        this.startBlock = this.networkdata.blockNumber + BLOCK_BUFFER;
        // The contract imposes a minimum block duration; initialize to respect this
        this.endBlock =
          this.startBlock + parseInt(this.minimumWeightChangeBlockPeriod);
      }
    }
  },
  computed: {
    // The initial denorm weights come from the contract, and can be anything valid (1-49)
    // In particular, the total weight could still be 50 if you load a "legacy" pool, even though
    //   current code would limit the max to 25
    // So we need to compute the total from the data, then calculate the relative percentages
    oldTotalWeight() {
      return this.pool.tokens.reduce(
        (a, b) => a + parseFloat(b.denormWeight),
        0
      );
    },
    // This is the "new" total weight, from which the current percentages will be calculated
    // Note that *any* number > 0 is allowed, so this total could have any positive value at all
    //   i.e., it is NOT a total denorm or total percentage
    totalWeight() {
      return this.weights.reduce((a, b) => a + parseFloat(b), 0);
    },
    minimumWeightChangeBlockPeriod() {
      return this.bPool.metadata.minimumWeightChangeBlockPeriod || 0;
    },
    isStartBlockValid() {
      return this.validStartBlock();
    },
    isEndBlockValid() {
      return this.validEndBlock();
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
    isValid() {
      const isWeightChange = this.isWeightIncrease || this.isWeightDecrease;
      // Check three conditions:
      // 1) The update is not starting in the past
      // 2) The total duration respects the minimum duration set in the contract
      // 3) The denorm weights that will be passed to the contract are in the valid range
      const correctBlocks = this.validStartBlock() && this.validEndBlock();
      const totalDenorm = this.weights.reduce((a, b) => a + parseFloat(b), 0);
      let correctWeight = true;

      for (let i = 0; i < this.pool.tokens.length; i++) {
        if (
          // The individual weights can be any positive number
          // Calculate the corresponding percentage, and pass it to
          //   the function that calculates the denorm from this percentage,
          //   (isLockedOrSharedPool flag is false if we are on this form)
          // This would be passed to the contract, so ensure it's valid
          !isValidDenormValue(
            getDenorm((this.weights[i] / totalDenorm) * 100, false)
          )
        ) {
          correctWeight = false;
          break;
        }
      }

      return correctBlocks && correctWeight && isWeightChange;
    },
    validationError() {
      // Ensure percentages are within the valid range (user can type any numbers)
      const totalWeight = this.weights.reduce((a, b) => a + parseFloat(b), 0);

      if (totalWeight > getMaxTotalWeight(true)) {
        return this.$t('errInvalidTotalDenorm', {
          min: 0,
          max: getMaxTotalWeight(true)
        });
      }

      for (let idx = 0; idx < this.weights.length; idx++) {
        const percentage = (this.weights[idx] / totalWeight) * 100;

        if (percentage < this.divisor || percentage > this.maxPercentage) {
          return this.$t('errInvalidDenorm', {
            min: this.divisor,
            max: this.maxPercentage
          });
        }
      }

      return false;
    }
  },
  methods: {
    ...mapActions(['updateWeightsGradually']),
    handleInputChange(i) {
      this.tokenIndex = i;
    },
    async handleSubmit() {
      this.loading = true;
      const newWeights = {};
      const totalWeight = this.weights.reduce((a, b) => a + parseFloat(b), 0);

      for (let i = 0; i < this.pool.tokens.length; i++) {
        const token = this.pool.tokens[i];
        // Denorm calculation matches the code in the validation above
        newWeights[token.checksum] = getDenorm(
          (this.weights[i] / totalWeight) * 100,
          false
        );
      }
      await this.updateWeightsGradually({
        poolAddress: this.pool.controller,
        tokens: this.pool.tokensList,
        newWeights,
        startBlock: this.startBlock,
        endBlock: this.endBlock
      });
      this.$emit('close');
      this.loading = false;
    },
    formatBlockNumber(blockNumber) {
      const blockTimestamp = blockNumberToTimestamp(
        this.currentTime,
        this.networkdata.blockNumber,
        blockNumber
      );
      const blockDate = new Date(blockTimestamp);
      return blockDate.toLocaleString('en-US');
    },
    isWeightInputValid(weight) {
      if (!weight || isNaN(weight)) {
        return false;
      }
      // They can enter *any* positive number - system will figure out percentages, then denorms
      if (bnum(weight).lte(0)) {
        return false;
      }

      return isValidDenormValue(this.currentDenorm(weight));
    },
    currentDenorm(weight) {
      // Calculate what the denorm would be given current input
      //   (e.g., for tooltip display)
      const total = this.weights.reduce((a, b) => a + parseFloat(b), 0);

      return getDenorm((weight / total) * 100, false).toFixed(3);
    },
    validStartBlock() {
      return this.startBlock >= this.networkdata.blockNumber;
    },
    validEndBlock() {
      return (
        this.endBlock - this.startBlock >= this.minimumWeightChangeBlockPeriod
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.time-block {
  @media only screen and (max-width: 768px) {
    width: 30px;
  }
}
.custom-table {
  overflow: hidden;
}
.gradual-weight-update-title {
  color: var(--text-color);
  max-width: 80%;
  margin: 0 auto;
}
.footer {
  padding-bottom: 40px;
}
.text-label {
  color: var(--text-btn-search);
}

.text-label.game {
  font-size: 10px;
  @media only screen and (max-width: 768px) {
    font-size: 9px;
  }
}
.input-text {
  color: var(--text-color);
}

input.game-btn-input-2 {
  min-height: 20px !important;
  line-height: 24px !important;
  width: 80%;
  font-size: 10px !important;
}

.input-blocknumber.game-btn-input-2 {
  @media only screen and (max-width: 768px) {
    width: 100% !important;
  }
}
</style>
