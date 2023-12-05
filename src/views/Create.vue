<template>
  <Page>
    <Title :title="$t('tokens')" class="title-create-pools" />
    <div class="d-flex px-4 px-md-0 mb-3">
      <Toggle
        :class="`tooltipped tooltipped-n ${_isThemeGame ? 'game-tooltip' : ''}`"
        :value="type"
        :options="poolTypes"
        :aria-label="
          $t(type === 'SMART_POOL' ? 'createSmartTip' : 'createSharedTip')
        "
        @select="handleSelectType"
      />
    </div>
    <div class="d-flex flex-items-center px-4 px-md-0 mb-3">
      <h4
        v-text="$t('assets')"
        :class="`flex-auto text-size ${_isThemeGame ? 'game' : ''}`"
      />
      <div class="btn-lock">
        <a
          @click="togglePadlock"
          :class="
            `px-1 mr-1 tooltipped tooltipped-n tooltip-lock ${
              _isThemeGame ? 'game-tooltip' : ''
            }`
          "
          :aria-label="$t(padlock ? 'marketAmounts' : 'customAmounts')"
        >
          <span v-if="padlock"><Icon name="lock" size="20"/></span>
          <span v-else><Icon name="unlock" size="20"/></span>
        </a>
      </div>
    </div>
    <UiTable class="mb-4 table-create-pools pool-table">
      <UiTableTh>
        <div
          v-text="$t('asset')"
          class="flex-auto text-left"
          style="min-width: 110px;"
        />
        <div v-text="$t('myBalance')" class="column-create-pool" />
        <div v-text="$t('weights')" class="column-create-pool" />
        <div v-text="$t('percent')" class="column-create-pool" />
        <div class="column-create-pool">
          <a
            @click="togglePadlock"
            :class="
              `px-1 mr-1 tooltipped tooltipped-n ${
                _isThemeGame ? 'game-tooltip' : ''
              }`
            "
            :aria-label="$t(padlock ? 'marketAmounts' : 'customAmounts')"
          >
            <span v-if="padlock"><Icon name="lock" size="16"/></span>
            <span v-else><Icon name="unlock" size="16"/></span>
          </a>
          {{ $t('amount') }}
        </div>
        <div v-text="$t('price')" class="column-create-pool hide-sm" />
        <div v-text="$t('totalValue')" class="column-create-pool hide-sm" />
        <div class="column-xs" />
      </UiTableTh>
      <div v-for="(token, i) in tokens" :key="token">
        <UiTableTr :class="`${i === tokens.length - 1 ? 'last-child' : ''}`">
          <div
            class="d-flex flex-auto flex-items-center text-left"
            @click="
              tokenModalOpen = true;
              activeToken = i;
            "
          >
            <Token :address="token" :symbol="token" class="mr-3" />
            {{ _ticker(token) }}
            <a class="d-block text-white p-1" style="margin-bottom: 10px">
              <Icon
                v-if="!_isThemeGame"
                name="arrow-down"
                class="icon-arrow-down"
              />
              <img
                v-else
                src="~@/assets/icon/game/arrow-down-icon.png"
                style="width: 40px"
                :class="_isThemeGame ? 'mt-2' : ''"
              />
            </a>
          </div>
          <div
            v-text="
              getBalance(token) === 0
                ? 0
                : getBalance(token) < 0.0001
                ? '< 0.0001'
                : _num(getBalance(token))
            "
            class="column-create-pool hide-sm"
          />
          <div
            class="column-create-pool"
            :aria-label="currentDenorm(token)"
            :class="{
              tooltipped: currentDenorm(token),
              'tooltipped-n': currentDenorm(token),
              'game-tooltip': _isThemeGame
            }"
          >
            <currency-input
              class="cards__input-number input pool-input text-right"
              :class="
                `${
                  isWeightInputValid(token) && isPercentValid(token)
                    ? 'text-input'
                    : 'text-red'
                } ${
                  _isThemeGame ? 'game-btn-input-2 game-placeholder-small' : ''
                }`
              "
              placeholder="0.0"
              type="text"
              :precision="_getPrecision(token)"
              v-model="weights[token]"
              @keyup="handleWeightChange(token)"
            />
          </div>
          <div class="column-create-pool hide-sm">
            <div v-text="_num(getPercentage(token) / 100, 'percent')" />
          </div>
          <div class="column-create-pool">
            <currency-input
              class="cards__input-number input pool-input text-right"
              :class="
                `${isAmountInputValid(token) ? 'text-input' : 'text-red'} ${
                  _isThemeGame ? 'game-btn-input-2 game-placeholder-small' : ''
                }`
              "
              v-model="amounts[token]"
              placeholder="0.0"
              type="text"
              :precision="_getPrecision(token)"
              @keyup="handleAmountChange(token)"
            />
          </div>
          <div class="column-create-pool hide-sm">
            <div
              v-text="_num(parseFloat(price.values[token]), 'usd')"
              v-if="padlock"
            />
            <div v-text="'-'" v-else />
          </div>
          <div class="column-create-pool hide-sm">
            <div
              v-text="_num(parseFloat(getValue(token)), 'usd')"
              v-if="padlock"
            />
            <div v-text="'-'" v-else />
          </div>
          <div class="column-xs">
            <a
              v-if="tokens.length > 1"
              class="d-flex flex-justify-end text-white"
              @click="removeToken(token)"
            >
              <Icon v-if="!_isThemeGame" name="close" class="icon-close-pool" />
              <img
                v-else
                src="~@/assets/icon/game/close-token-icon.png"
                style="width: 20px"
              />
            </a>
          </div>
        </UiTableTr>
      </div>
    </UiTable>
    <!-- UI Mobile-->
    <div class="list-token-mobile mb-4">
      <div v-for="(token, i) in tokens" :key="token" class="item-token-mobile">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div
            class="d-flex align-items-center"
            :class="`${_isThemeGame ? 'item-token' : ''}`"
          >
            <Token :address="token" :symbol="token" class="mr-3" size="25" />
            {{ _ticker(token) }}
            <a
              class="d-block text-white p-1"
              @click="(tokenModalOpen = true), (activeToken = i)"
              style="margin-bottom: 10px"
            >
              <Icon
                v-if="!_isThemeGame"
                name="arrow-down"
                class="icon-arrow-down"
              />
              <img
                v-else
                src="~@/assets/icon/game/arrow-down-icon.png"
                style="width: 40px"
              />
            </a>
          </div>
          <div>
            <a
              v-if="tokens.length > 1"
              class="d-flex flex-justify-end text-white"
              :class="`${_isThemeGame ? 'icon-delete-token' : ''}`"
              @click="removeToken(token)"
            >
              <Icon v-if="!_isThemeGame" name="close" class="icon-close-pool" />
              <img
                v-else
                src="~@/assets/icon/game/close-token-icon.png"
                style="width: 20px"
              />
            </a>
          </div>
        </div>
        <div class="d-flex mb-3">
          <div class="item-column-first text-left">
            <div
              v-text="$t('myBalance')"
              :class="`mb-2 text-label ${_isThemeGame ? 'game' : ''}`"
            />
            <div>
              <div
                :class="_isThemeGame ? 'game-text' : ''"
                v-text="
                  getBalance(token) < 0.0001
                    ? '< 0.0001'
                    : _num(getBalance(token))
                "
              />
            </div>
          </div>
          <div class="item-column-second text-left">
            <div
              v-text="$t('percent')"
              :class="`mb-2 text-label ${_isThemeGame ? 'game' : ''}`"
            />
            <div
              :class="_isThemeGame ? 'game-text' : ''"
              v-text="getDisplayPercentage(token)"
            />
          </div>
          <div class="text-right" style="width: 100%">
            <div
              v-text="$t('weights')"
              :class="`mb-2 text-label ${_isThemeGame ? 'game' : ''}`"
            />
            <div
              :aria-label="currentDenorm(token)"
              :class="{
                tooltipped: currentDenorm(token),
                'tooltipped-n': currentDenorm(token),
                'game-tooltip': _isThemeGame
              }"
            >
              <currency-input
                class="cards__input-number input pool-input text-right"
                :class="
                  `${
                    isWeightInputValid(token) && isPercentValid(token)
                      ? 'text-input'
                      : 'text-red'
                  } ${
                    _isThemeGame
                      ? 'game-btn-input-2 game-placeholder-small'
                      : ''
                  }`
                "
                placeholder="0.0"
                :precision="_getPrecision(token)"
                v-model="weights[token]"
                @keyup="handleWeightChange(token)"
              />
            </div>
          </div>
        </div>

        <div class="d-flex">
          <div class="item-column-first">
            <div
              v-text="$t('price')"
              :class="`mb-2 text-label ${_isThemeGame ? 'game' : ''}`"
            />
            <div :class="_isThemeGame ? 'game-text' : ''">
              <div
                v-text="_num(parseFloat(price.values[token]).toFixed(4), 'usd')"
                v-if="padlock"
              />
              <div v-text="'-'" v-else />
            </div>
          </div>
          <div class="item-column-second text-left">
            <div
              v-text="$t('totalValue')"
              :class="`mb-2 text-label ${_isThemeGame ? 'game' : ''}`"
            />
            <div :class="_isThemeGame ? 'game-text' : ''">
              <div
                v-text="_num(parseFloat(getValue(token)), 'usd')"
                v-if="padlock"
              />
              <div v-text="'-'" v-else />
            </div>
          </div>
          <div class="text-right" style="width: 100%">
            <div :class="`mb-2 text-label ${_isThemeGame ? 'game' : ''}`">
              {{ $t('amount') }}
            </div>
            <div>
              <currency-input
                class="cards__input-number input pool-input text-right"
                :class="
                  `${isAmountInputValid(token) ? 'text-input' : 'text-red'} ${
                    _isThemeGame
                      ? 'game-btn-input-2 game-placeholder-small'
                      : ''
                  }`
                "
                v-model="amounts[token]"
                placeholder="0.0"
                :precision="_getPrecision(token)"
                @keyup="handleAmountChange(token)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- UI Mobile-->
    <div :class="`${_isThemeGame ? 'pl-2' : ''}`">
      <UiButton
        v-if="tokens.length < 8"
        :class="`mb-4 button-add ${_isThemeGame ? 'game-border-btn-add' : ''}`"
        @click="addToken"
      >
        <div :class="_isThemeGame ? 'd-flex' : ''">
          <Icon v-if="!_isThemeGame" name="add" />
          <img v-else src="~/@/assets/icon/game/plus.png" class="icon-game" />
        </div>
        <div class="text-button">{{ $t('addToken') }}</div>
      </UiButton>
    </div>
    <div class="d-flex flex-items-center px-4 px-md-0 mb-3">
      <h4
        v-text="$t('swapFeePct')"
        :class="`flex-auto text-size  ${_isThemeGame ? 'game' : ''}`"
      />
    </div>
    <div class="mb-4">
      <currency-input
        class="cards__input-number input pool-input text-right"
        :class="
          `${isSwapFeeInputValid() ? 'text-input' : 'text-red'} ${
            _isThemeGame
              ? 'game-btn-input-2 game-pool-input-responsive game-placeholder-small ml-2'
              : 'pool-input-responsive'
          }`
        "
        v-model="swapFee"
        placeholder="0.15"
        type="text"
        value="0.15"
        step="0.01"
        min="0.01"
        max="10"
        :precision="18"
        @keyup="handleFeeChange(swapFee)"
      />
    </div>
    <div v-if="type === 'SMART_POOL'">
      <FormCrp
        :rights="crp.rights"
        :minimumWeightChangeBlockPeriod="crp.minimumWeightChangeBlockPeriod"
        @toggle-right="toggleRight"
        @change-weight-period="changeWeightPeriod"
      />
      <!-- <FormCrp
        :rights="crp.rights"
        :minimumWeightChangeBlockPeriod="crp.minimumWeightChangeBlockPeriod"
        :addTokenTimeLockInBlocks="crp.addTokenTimeLockInBlocks"
        @toggle-right="toggleRight"
        @change-weight-period="changeWeightPeriod"
        @change-add-timelock="changeAddTimelock"
      /> -->
    </div>
    <MessageError
      v-if="getValidationError()"
      :text="getValidationError()"
      class="mt-4 message"
    />
    <MessageSimilarPools v-if="pool" :pool="pool" class="mt-4 message" />
    <MessageWarningToken
      v-if="!getValidationError() && !warningAccepted"
      :custom="hasCustomToken"
      @accept="warningAccepted = true"
      class="mt-4 message"
    />
    <MessageWarningSetupProxy
      v-if="!this.$store.state.account.proxy"
      :question="$t('proxyQuestion')"
      :linkText="$t('setupProxyRedirect')"
      class="mt-4 message"
    />
    <div :class="`btn-create ${_isThemeGame ? 'ml-4' : ''}`">
      <Button
        :requireLogin="true"
        :requireProxy="true"
        :requireApprovals="requiredApprovals"
        :loading="loading"
        :disabled="getValidationError() || !warningAccepted"
        @submit="confirmModalOpen = true"
        :class="`mt-4 button-create ${_isThemeGame ? 'game-button' : ''}`"
      >
        {{ $t('create') }}
      </Button>
    </div>
    <portal to="modal">
      <ModalSelectToken
        :open="tokenModalOpen"
        @close="tokenModalOpen = false"
        @input="changeToken"
        :not="selectTokenNot"
      />
      <ModalPoolCreation
        :open="confirmModalOpen"
        :padlock="padlock"
        :tokens="tokens"
        :amounts="amounts"
        :weights="weights"
        @close="confirmModalOpen = false"
        @create="create"
      />
    </portal>
  </Page>
</template>

<script>
import Vue from 'vue';
import { mapActions } from 'vuex';
import { getAddress } from '@ethersproject/address';
import {
  bnum,
  normalizeBalance,
  denormalizeBalance,
  getTokenBySymbol,
  poolTypes,
  toWei,
  amplAddress,
  clone
} from '@/helpers/utils';
import { validateNumberInput, formatError } from '@/helpers/validation';
import {
  getDivisor,
  getMaxPercentage,
  getDenorm,
  isValidDenormValue
} from '@/helpers/weights';
import { BNB_KEY } from '@/utils/helpers';
import { find, filter } from 'lodash';
import config from '@/config';
import BigNumber from 'bignumber.js';
import CurrencyInput from '@/components/CurrencyInput.vue';

// The contract defaults are 90,000 for the weight change duration, and 500 for the add token timelock
// Since broadcast currently calls the createPool overload that passes in the block time parameters, we
//   are overriding those defaults with these
const DEFAULT_LP_TOKEN_SYMBOL = 'BPT';
const DEFAULT_LP_TOKEN_NAME = 'Buni Pool Token';
const DEFAULT_WEIGHT_CHANGE_DURATION = '10';
const DEFAULT_ADD_TOKEN_TIMELOCK = '10';
const DEFAULT_INITIAL_SUPPLY = '100';
const ENV = process.env.VUE_APP_ENV;

export default {
  metaInfo: {
    title: 'Create Pool'
  },
  data() {
    return {
      poolTypes,
      type: 'SHARED_POOL',
      amounts: {},
      weights: {},
      totalWeight: 0,
      swapFee: '0.15',
      tokens: [],
      loading: false,
      crp: {
        poolTokenSymbol: DEFAULT_LP_TOKEN_SYMBOL,
        poolTokenName: DEFAULT_LP_TOKEN_NAME,
        rights: {},
        minimumWeightChangeBlockPeriod: DEFAULT_WEIGHT_CHANGE_DURATION,
        addTokenTimeLockInBlocks: DEFAULT_ADD_TOKEN_TIMELOCK,
        initialSupply: DEFAULT_INITIAL_SUPPLY
      },
      activeToken: 0,
      tokenModalOpen: false,
      confirmModalOpen: false,
      padlock: true,
      warningAccepted: false,
      hasStablecoin: false,
      lastTokenInput: null
    };
  },
  components: {
    CurrencyInput
  },
  watch: {
    tokens() {
      let recheckStableCoin = false;
      this.tokens.forEach(token => {
        if (config.reserveCurrencies.includes(token)) {
          recheckStableCoin = true;
        }
      });
      this.hasStablecoin = recheckStableCoin;
    }
  },
  created() {
    // Initialize an (arbitrary) two-token pool, with weights
    const fromAsset = getTokenBySymbol(config.systemCoin.wrap).address;
    const toAsset = getTokenBySymbol('BUNI').address;

    this.tokens = [fromAsset, toAsset];
    // weights contain percentage values - denorms are calculated later
    Vue.set(this.weights, fromAsset, '60');
    Vue.set(this.weights, toAsset, '40');
    this.loading = false;
  },
  computed: {
    pool() {
      if (this.getValidationError()) {
        return;
      }
      const tokens = this.tokens.map(token => {
        return {
          checksum: token,
          weightPercent: this.getPercentage(token)
        };
      });
      const swapFee = (parseFloat(this.swapFee) / 100).toString();
      const liquidity = '0';
      return {
        tokens,
        swapFee,
        liquidity
      };
    },
    validationError() {
      return this.getValidationError();
    },
    requiredApprovals() {
      return Object.fromEntries(
        this.tokens.map(token => [token, this.amounts[token]])
      );
    },
    hasCustomToken() {
      for (const token of this.tokens) {
        const tokenMetadata = this.$store.state.networkdata.tokenMetadata[
          token
        ];
        if (!tokenMetadata || !tokenMetadata.whitelisted) {
          return true;
        }
      }
      return false;
    },
    selectTokenNot() {
      const not = clone(this.tokens);
      const metadata = this.$store.getters['assets/metadata'];

      if (!this.$router.currentRoute.query.anyToken) {
        not.push(amplAddress);
      }
      // TODO disable usdt,usdc when create pool
      const USDTContract = '0x9792F3977Ac74833EA55Da9B2Aa63277eaB05A5C';
      const USDCContract = '0x0B22E57e4e1E236f1E4C4d68c15E064E1Cc2e265';
      not.push(USDTContract);
      if (ENV === 'staging') not.push(USDCContract);
      const activeToken = this.activeToken;
      const currentAddress = metadata[this.tokens[activeToken]];
      const otherAddreses = this.tokens.filter((address, index) => {
        return index !== activeToken;
      });
      const isStableCurrentAddress = metadata[currentAddress]
        ? metadata[currentAddress].forKurve
        : false;
      const isStableOther = find(metadata, asset => {
        return otherAddreses.includes(asset.address) && asset.forKurve;
      });

      if (!isStableCurrentAddress && isStableOther) {
        const stableAddresses = filter(metadata, asset => {
          return asset.forKurve;
        }).map(asset => {
          return asset.address;
        });

        return not.concat(stableAddresses);
      }
      return not;
    }
  },
  methods: {
    ...mapActions(['createPool', 'createSmartPool']),
    getValidationError() {
      for (const token of this.tokens) {
        const tokenAmount =
          this.amounts[token] || this.amounts[token.toLowerCase()];
        console.log(
          'tokenAmount',
          tokenAmount,
          'token',
          token,
          this.amounts[token],
          this.amounts[token.toLowerCase()]
        );

        const amountError = validateNumberInput(tokenAmount);
        const amountErrorText = formatError(
          amountError,
          `${this.$t('amount')}`
        );
        if (amountErrorText) return amountErrorText;
        const weightError = validateNumberInput(this.weights[token]);
        const weightErrorText = formatError(weightError, this.$t('weight'));
        if (weightErrorText) return weightErrorText;
      }
      const feeError = validateNumberInput(this.swapFee);
      const feeErrorText = formatError(feeError, this.$t('swapFee'));
      if (feeErrorText) return feeErrorText;
      // Token count validation
      if (this.tokens.length < 2) {
        return this.$t('errMinPoolTokens');
      }
      if (this.tokens.length > 8) {
        return this.$t('errMaxPoolTokens');
      }
      // Weight validation
      for (const token of this.tokens) {
        if (!this.isDenormValid(token)) {
          return this.$t('errInvalidDenorm', {
            min: getDivisor(this.isSharedOrLocked()),
            max: getMaxPercentage(this.isSharedOrLocked())
          });
        }
      }
      // Amount validation
      for (const token of this.tokens) {
        const amount = bnum(this.amounts[token]);
        const weiAmount = denormalizeBalance(
          amount,
          this.$store.state.networkdata.tokenMetadata[token].decimals
        );
        if (weiAmount.lt('1e6')) {
          return this.$t('errMinTokenBalance');
        }
        const balance = normalizeBalance(
          this.$store.state.account.balances[token],
          this.$store.state.networkdata.tokenMetadata[token].decimals
        );
        if (amount.gt(balance)) {
          return this.$t('errExceedsBalance');
        }
      }
      // Fee validation
      const fee = new BigNumber(this.swapFee);
      if (fee.lt(0.0001) || fee.gt(10)) {
        return this.$t('errFeeRange');
      }
      // Smart pool validation
      if (this.type == 'SMART_POOL') {
        if (!this.crp.poolTokenSymbol) {
          return this.$t('errEmptyTokenSymbol');
        }
        if (!this.crp.poolTokenName) {
          return this.$t('errEmptyTokenName');
        }

        const weightPeriodError = validateNumberInput(
          this.crp.minimumWeightChangeBlockPeriod
        );
        const weightPeriodErrorText = formatError(
          weightPeriodError,
          this.$t('minimumUpdateErr')
        );
        if (this.crp.rights.canChangeWeights && weightPeriodErrorText)
          return weightPeriodErrorText;
        const addTimelockError = validateNumberInput(
          this.crp.addTokenTimeLockInBlocks
        );
        const addTimelockErrorText = formatError(
          addTimelockError,
          this.$t('timeLockErr')
        );
        if (this.crp.rights.canAddRemoveTokens && addTimelockErrorText)
          return addTimelockErrorText;
        const initialSupplyError = validateNumberInput(this.crp.initialSupply);
        const initialSupplyErrorText = formatError(
          initialSupplyError,
          this.$t('initialSupply')
        );
        if (initialSupplyErrorText) return initialSupplyErrorText;

        const weightPeriod = parseFloat(
          this.crp.minimumWeightChangeBlockPeriod
        );
        const addTimelock = parseFloat(this.crp.addTokenTimeLockInBlocks);
        if (
          this.crp.rights.canChangeWeights &&
          this.crp.rights.canAddRemoveTokens &&
          weightPeriod < addTimelock
        ) {
          return this.$t('errInconsistentTimelock');
        }
        const initialSupply = parseFloat(this.crp.initialSupply);
        if (initialSupply < 100 || initialSupply > 1e9) {
          return this.$t('errInitialSupplyRange');
        }
      }
      return undefined;
    },
    handleSelectType(type) {
      this.type = type;
    },
    togglePadlock() {
      this.padlock = !this.padlock;
      for (const token of this.tokens) {
        Vue.set(this.amounts, token, '');
      }
    },
    changeToken(selectedToken) {
      const tokenAddress = selectedToken;
      Vue.set(this.tokens, this.activeToken, tokenAddress);
      Vue.set(this.weights, tokenAddress, '');
      Vue.set(this.amounts, tokenAddress, '');
      this.tokenModalOpen = false;
    },
    addToken() {
      const anotherToken = this.getAnotherToken(
        this.config.tokens,
        this.tokens
      );
      this.tokens.push(anotherToken);
      Vue.set(this.weights, anotherToken, '');
      Vue.set(this.amounts, anotherToken, '');
    },
    removeToken(tokenAddress) {
      const index = this.tokens.indexOf(tokenAddress);
      this.tokens.splice(index, 1);

      const calculatedToken =
        this.lastTokenInput && this.lastTokenInput !== tokenAddress
          ? this.lastTokenInput
          : this.tokens[0];
      // Need to recalculate weights if you remove a token!
      this.handleWeightChange(calculatedToken);
    },
    toggleRight(right) {
      Vue.set(this.crp.rights, right, !this.crp.rights[right]);
      // If we remove the right, don't leave the old values (could be invalid, causing createPool to revert)
      if (!this.crp.rights.canChangeWeights)
        this.crp.minimumWeightChangeBlockPeriod = DEFAULT_WEIGHT_CHANGE_DURATION;
      if (!this.crp.rights.canAddRemoveTokens)
        this.crp.addTokenTimeLockInBlocks = DEFAULT_ADD_TOKEN_TIMELOCK;
    },
    changeWeightPeriod(weightPeriod) {
      this.crp.minimumWeightChangeBlockPeriod = weightPeriod;
    },
    changeAddTimelock(addTimelock) {
      this.crp.addTokenTimeLockInBlocks = addTimelock;
    },
    async create() {
      this.loading = true;
      const weights = this.tokens.map(token =>
        toWei(
          getDenorm(
            this.getPercentage(token),
            this.isSharedOrLocked()
          ).toString()
        ).toString()
      );

      if (this.type === 'SHARED_POOL') {
        const poolParams = {
          tokens: this.tokens,
          balances: this.amounts,
          weights: weights,
          swapFee: this.swapFee
        };
        try {
          // this.$mixpanel.track('CREATE_SHARED_POOL', { poolParams });
          await this.createPool(poolParams);
          this.$router.push({ name: 'wallet' });
        } catch (error) {
          console.error(error);
        }
      }
      if (this.type === 'SMART_POOL') {
        const {
          poolTokenSymbol,
          poolTokenName,
          rights,
          minimumWeightChangeBlockPeriod,
          addTokenTimeLockInBlocks,
          initialSupply
        } = this.crp;
        const poolParams = {
          poolTokenSymbol,
          poolTokenName,
          constituentTokens: this.tokens,
          tokenBalances: this.amounts,
          tokenWeights: weights,
          swapFee: this.swapFee
        };
        const crpParams = {
          minimumWeightChangeBlockPeriod,
          addTokenTimeLockInBlocks,
          initialSupply
        };

        try {
          // this.$mixpanel.track('CREATE_SMART_POOL', {
          //   poolParams,
          //   crpParams,
          //   rights
          // });
          await this.createSmartPool({
            poolParams,
            crpParams,
            rights
          });
          this.$router.push({ name: 'wallet' });
        } catch (e) {
          console.error(e);
        }
      }
      this.loading = false;
    },
    handleWeightChange(tokenAddress) {
      this.lastTokenInput = tokenAddress;
      this.weights[tokenAddress] =
        this.weights[tokenAddress] &&
        this._validInputNumber(
          this.weights[tokenAddress],
          this._hasLimitedDecimalToken(tokenAddress) ? 6 : 18
        );
      this.handleAmountChange(tokenAddress);
    },
    handleFeeChange(fee) {
      this.swapFee = fee && this._validInputNumber(fee);
    },
    handleAmountChange(tokenAddress) {
      if (this.loading) return true;
      this.lastTokenInput = tokenAddress;
      this.amounts[tokenAddress] =
        this.amounts[tokenAddress] &&
        this._validInputNumber(
          this.amounts[tokenAddress],
          this._hasLimitedDecimalToken(tokenAddress) ? 6 : 18
        );
      const tokenPrice = this.price.values[tokenAddress];
      if (!tokenPrice) {
        return;
      }
      const tokenValue = bnum(this.amounts[tokenAddress]).times(tokenPrice);
      const totalValue = tokenValue.div(this.weights[tokenAddress]);

      this.totalWeight = this.tokens.reduce((acc, token) => {
        const weight = parseFloat(this.weights[token]);
        return acc + weight;
      }, 0);

      for (const token of this.tokens) {
        if (token === tokenAddress || !this.padlock) {
          continue;
        }
        const tokenWeight = bnum(this.weights[token] || '');
        if (totalValue.isNaN() || tokenWeight.isNaN()) {
          Vue.set(this.amounts, token, '');
          continue;
        }
        const tokenPrice = this.price.values[token];
        if (!tokenPrice) {
          continue;
        }
        const tokenValue = tokenWeight.times(totalValue);
        const tokenAmount = tokenValue.div(tokenPrice);
        Vue.set(this.amounts, token, tokenAmount.toString());
      }
    },
    isWeightInputValid(tokenAddress) {
      if (this.loading) return true;
      if (!this.weights[tokenAddress] || isNaN(this.weights[tokenAddress])) {
        return false;
      }
      // They can enter *any* positive number - system will figure out percentages, then denorms
      const weight = bnum(this.weights[tokenAddress]);
      if (weight.lte(0)) {
        return false;
      }

      return true;
    },
    isAmountInputValid(tokenAddress) {
      if (!this.amounts[tokenAddress] || isNaN(this.amounts[tokenAddress])) {
        return false;
      }
      const amount = bnum(this.amounts[tokenAddress]);
      if (amount.lte(0)) {
        return false;
      }
      const weiAmount = denormalizeBalance(
        amount,
        this.$store.state.networkdata.tokenMetadata[tokenAddress].decimals
      );
      if (weiAmount.lt('1e6')) {
        return false;
      }
      const balance = normalizeBalance(
        this.$store.state.account.balances[tokenAddress],
        this.$store.state.networkdata.tokenMetadata[tokenAddress].decimals
      );
      if (amount.gt(balance)) {
        return false;
      }
      return true;
    },
    isSwapFeeInputValid() {
      if (!this.swapFee || isNaN(this.swapFee)) {
        return false;
      }
      const swapFee = new BigNumber(this.swapFee);
      if (swapFee.lte(0)) {
        return false;
      }
      if (swapFee.lt(0.0001) || swapFee.gt(10)) {
        return false;
      }
      return true;
    },
    getBalance(tokenAddress) {
      const balance = normalizeBalance(
        this.$store.state.account.balances[tokenAddress],
        this.$store.state.networkdata.tokenMetadata[tokenAddress].decimals
      );
      return parseFloat(balance);
    },
    getValue(tokenAddress) {
      const tokenPrice = this.price.values[tokenAddress];
      if (!tokenPrice || !this.amounts[tokenAddress]) {
        return 0;
      }
      return bnum(this.amounts[tokenAddress]).times(tokenPrice);
    },
    isSharedOrLocked() {
      // If it is a shared pool, or the user cannot change weights,
      // we can safely allow the full range of denorm weights
      return this.type === 'SHARED_POOL' || !this.crp.rights.canChangeWeights;
    },
    getPercentage(token) {
      return this.totalWeight == 0
        ? 0
        : (this.weights[token] / this.totalWeight) * 100;
    },
    currentDenorm(token) {
      const pct = this.getPercentage(token);
      if (!pct || isNaN(pct)) {
        return null;
      }

      return `Denorm: ${getDenorm(
        this.getPercentage(token),
        this.isSharedOrLocked()
      ).toFixed(3)}`;
    },
    isDenormValid(token) {
      const denorm = getDenorm(
        this.getPercentage(token),
        this.isSharedOrLocked()
      );

      return isValidDenormValue(denorm);
    },
    isPercentValid(token) {
      if (this.loading) return true;
      const percentage = this.getPercentage(token);

      return (
        percentage >= getDivisor(this.isSharedOrLocked()) &&
        percentage <= getMaxPercentage(this.isSharedOrLocked())
      );
    },
    getAnotherToken(tokens, selectedTokens) {
      const tokenAddresses = Object.keys(tokens);
      for (const tokenAddress of tokenAddresses) {
        const token = tokens[tokenAddress];
        if (token.symbol.toUpperCase() === BNB_KEY.toUpperCase()) {
          continue;
        }
        if (
          !selectedTokens.includes(token.address) &&
          !this.selectTokenNot.includes(token.address) &&
          ((!this.hasStablecoin &&
            config.reserveCurrencies.includes(token.address)) ||
            (this.hasStablecoin &&
              !config.reserveCurrencies.includes(token.address)))
        ) {
          return token.address;
        }
      }
    },
    getDisplayPercentage(token) {
      const tokenPercentage = this.getPercentage(token);

      return (
        BigNumber(tokenPercentage).decimalPlaces(2, BigNumber.ROUND_FLOOR) + '%'
      );
    }
  }
};
</script>

<style scoped lang="scss">
.pool-input {
  width: 110px;
}

.pool-input.game-btn-input-2 {
  border-radius: 0 !important;
  min-height: auto !important;
}

.message {
  @media only screen and (max-width: 767px) {
    margin-left: 20px !important;
    margin-right: 20px !important;
  }
}

.title-create-pools {
  font-size: 35px !important;
  line-height: 42px !important;
  margin-bottom: 20px !important;

  @media only screen and (max-width: 767px) {
    width: 90%;
    margin: 0 auto;
  }
}

.pool-table {
  @media only screen and (max-width: 767px) {
    width: 95%;
    margin: 0 auto;
  }
}

.pool-last {
  border-bottom: none !important;
}

.button-add {
  color: $color-button-add-token;
  border: none;
  background: none;
  display: flex;
  padding: 8px 15px !important;
  align-items: center;
  &:hover {
    color: $color-button-add-token-hover !important;
    background: none !important;

    @media only screen and (max-width: 767px) {
      margin-left: 1.5rem;
      background: none !important;
      color: $color-button-add-token !important;
    }
  }

  @media only screen and (max-width: 767px) {
    margin-left: 1.5rem;
  }
}

.button-add.game-border-btn-add {
  height: inherit !important;
  background-color: $game-btn-hover-color !important;
  color: $text-white;
  margin-bottom: 35px !important;
  padding: 4px 15px !important;
  border: 0 !important;
  .text-button {
    font-family: $font-forward !important;
    font-size: 12px;
    @media only screen and (max-width: 767px) {
      font-size: 10px;
    }
  }

  img {
    @media only screen and (max-width: 767px) {
      width: 12px !important;
      height: 12px !important;
    }
  }

  &:hover {
    background: $color-primary !important;
    color: $text-white !important;
    @media only screen and (max-width: 767px) {
      background: $game-btn-hover-color !important;
      color: $text-white !important;
    }
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

.btn-create {
  @media only screen and (max-width: 768px) {
    display: flex;
    justify-content: center;
  }
}

.button-create.game-button {
  font-size: 15px;
  @media only screen and (max-width: 768px) {
    font-size: 13px;
  }
}

.text-button {
  font-family: $font-bold;
  font-size: 13px;
  line-height: 20px;
}

.icon-close-pool {
  color: var(--link-color) !important;
}

.icon-arrow-down {
  color: var(--color-arrow-down) !important;
  &:hover {
    color: $btn-bg-hover-color !important;
  }
}

.text-size {
  font-family: $font-bold;
  font-style: normal;
  font-weight: 600;
  font-size: 18px;
  line-height: 20px;
  color: var(--text-color);

  @media only screen and (max-width: 768px) {
    width: 90%;
    margin: 0 auto;
  }
}

.text-size.game {
  font-size: 14px !important;
  margin-top: 20px;

  @media only screen and (max-width: 768px) {
    font-size: 12px !important;
  }
}

.text-input {
  color: var(--text-color);
}

.list-token-mobile,
.btn-lock {
  display: none;
}

.icon-game {
  width: 15px;
  height: 15px;
  margin-right: 10px;
}

@media only screen and (max-width: 768px) {
  .item-token {
    font-size: 13px !important;
  }

  .icon-delete-token {
    img {
      width: 12px !important;
      height: 12px !important;
    }
  }
  .pool-input-responsive {
    margin-left: 25px;
  }

  .game-pool-input-responsive {
    margin-left: 33px !important;
  }

  .table-create-pools {
    display: none;
  }
  .btn-lock {
    display: block;
  }
  .list-token-mobile {
    display: block;
    box-shadow: 0 0 5px var(--border-table);
    background-color: var(--panel-background);

    .item-token-mobile {
      padding: 10px 20px 20px 20px;
      border-bottom: 1px solid var(--color-border);
      color: var(--text-color);
      font-size: 15px;
      .text-label {
        color: var(--color-arrow-down);
        font-size: 13px;
        font-family: $font-bold;
      }

      .item-column-second,
      .item-column-first {
        min-width: 110px;
      }
      input {
        min-height: 30px !important;
        height: 30px !important;
        width: 100px !important;
      }
    }
  }

  input.game-border {
    font-size: 12px !important;
  }

  .text-label.game {
    font-size: 9px !important;
    margin-bottom: 15px !important;
  }
}

.game-text {
  font-size: 11px !important;
}
</style>
