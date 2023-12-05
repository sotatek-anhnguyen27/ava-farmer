<template>
  <UiModal
    :open="open"
    @close="handleClose"
    class="modal-liquidity"
    :class="`${_isThemeGame ? 'game' : ''}`"
    v-if="pool.id"
  >
    <UiModalForm class="style-addLiquidity">
      <template slot="header">
        <div
          v-text="$t('addLiquidity')"
          :class="_isThemeGame && 'game-text-addLiquidity'"
          class="text-addLiquidity"
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
                class="column text-token"
                :class="`${_isThemeGame ? 'game' : ''}`"
              >
                {{ _num(parseFloat(getBalance(token.address)).toFixed(2)) }}
                <a
                  class="ml-3"
                  @click="
                    handleInputChange(
                      getBalance(token.address),
                      index === 0 ? 'tokenIn' : 'tokenOut',
                      pool.tokens
                    )
                  "
                  :class="buttonState.loading && 'disable'"
                >
                  <UiLabel v-text="$t('max')" />
                </a>
              </div>
              <div class="column-sm">
                <div
                  class="flex-auto ml-1 text-left d-flex flex-items-center position-relative"
                >
                  <currency-input
                    class="cards__input-number input flex-auto text-right text-input"
                    :class="
                      `${
                        _isThemeGame
                          ? 'game-placeholder-crp-input game-btn-input-liquidity'
                          : ''
                      }
                      ${isInputValid(token, index) ? 'text-red' : ''}
                      ${buttonState.loading ? 'disable' : ''}`
                    "
                    placeholder="0.0"
                    v-if="index === 0"
                    v-model="tokenAmountA"
                    type="text"
                    ref="number"
                    :precision="_getPrecision(token.address)"
                    @keyup="
                      handleInputChange(
                        tokenAmountA,
                        index === 0 ? 'tokenIn' : 'tokenOut',
                        pool.tokens
                      )
                    "
                  />
                  <currency-input
                    class="cards__input-number input flex-auto text-right text-input"
                    :class="
                      `${
                        _isThemeGame
                          ? 'game-placeholder-crp-input game-btn-input-liquidity'
                          : ''
                      }
                      ${isInputValid(token, index) ? 'text-red' : ''}
                      ${buttonState.loading ? 'disable' : ''}`
                    "
                    placeholder="0.0"
                    v-else
                    v-model="tokenAmountB"
                    type="text"
                    ref="number"
                    :precision="_getPrecision(token.address)"
                    @keyup="
                      handleInputChange(
                        tokenAmountB,
                        index === 0 ? 'tokenIn' : 'tokenOut',
                        pool.tokens
                      )
                    "
                  />
                </div>
              </div>
            </UiTableTr>
          </UiTable>

          <div
            class="price d-flex mb-1"
            v-if="usdTokensPrice[tokenA] && usdTokensPrice[tokenB]"
          >
            <div class="text" :class="`${_isThemeGame ? 'game' : ''}`">
              {{ `1 ${symbolA} = $${_num(usdTokensPrice[tokenA], 'long')}` }}
            </div>
          </div>

          <div
            class="price d-flex mb-3"
            v-if="usdTokensPrice[tokenA] && usdTokensPrice[tokenB]"
          >
            <div class="text" :class="`${_isThemeGame ? 'game' : ''}`">
              {{ `1 ${symbolB} = $${_num(usdTokensPrice[tokenB], 'long')}` }}
            </div>
          </div>

          <div
            class="b-dashed rounded mb-3"
            v-if="poolInfo.pool"
            :class="`${_isThemeGame ? 'game' : ''}`"
          >
            <div
              class="my-3 px-3 text"
              :class="`${_isThemeGame ? 'game' : ''}`"
            >
              {{ $t('amp') }} = {{ poolInfo.pool.amp.decimalPlaces(5) }}
            </div>
            <div
              class="my-3 px-3 text"
              :class="`${_isThemeGame ? 'game' : ''}`"
            >
              {{ $t('dynamicFee') }}: {{ feeRangeCalc(poolInfo.pool.amp) }}
            </div>
          </div>

          <div
            class="amount mb-3"
            v-if="poolInfo.pool && poolShare && poolShare.isCaculated"
            :class="`${_isThemeGame ? 'game game-border-table' : ''}`"
          >
            <div
              class="space d-flex my-3 px-3 text"
              :class="`${_isThemeGame ? 'game' : ''}`"
            >
              <div>BPT {{ $t('amount') }}</div>
              <div
                v-if="poolShare.balanceAfter"
                class="d-flex align-items-center"
              >
                {{ poolShare.balanceBefore | formatAmount }}
                <span class="d-flex mx-2">
                  <span class="d-flex" v-if="!_isThemeGame"> → </span>
                  <span v-else class="d-flex">
                    <img
                      src="~/@/assets/icon/game/arrow-icon.png"
                      style="width: 20px"
                    />
                  </span>
                </span>
                {{ poolShare.balanceAfter | formatAmount }}
                <span class="ml-2">
                  BPT
                </span>
              </div>
              <div v-else>
                {{ poolShare.balanceAfter | formatAmount }}
                <span class="ml-2">
                  BPT
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="m-4">
        <MessageError v-if="errorMessage" :text="errorMessage" class="mb-4" />
      </div>
      <div class="m-4">
        <MessageWarningToken
          v-if="warningAccepted && !errorMessage"
          @accept="warningAccepted = false"
          class="text-left"
        />
      </div>

      <template slot="footer">
        <!-- <div class="d-flex justify-content-center list-btn-approve">
          <div
            class="mt-4 mx-2"
            v-if="
              tokenAmountA && approvalState[tokenA] !== ApprovalState.APPROVED
            "
          >
            <button
              class="liquidity btn-liquidity btn-approve"
              :class="_isThemeGame ? 'game-button' : ''"
              @click="handleAppove(tokenA)"
            >
              <UiLoading v-if="approvalLoading[tokenA]" />
              <span v-else>{{ $t('approve') }} {{ symbol(tokenA) }}</span>
            </button>
          </div>
          <div
            class="mt-4 mx-2"
            v-if="
              tokenAmountB && approvalState[tokenB] !== ApprovalState.APPROVED
            "
          >
            <button
              class="liquidity btn-liquidity btn-approve"
              :class="_isThemeGame ? 'game-button' : ''"
              @click="handleAppove(tokenB)"
            >
              <UiLoading v-if="approvalLoading[tokenB]" />
              <span v-else>{{ $t('approve') }} {{ symbol(tokenB) }}</span>
            </button>
          </div>
        </div> -->
        <div class="my-4">
          <button
            :class="
              ` ${isActionButtonDisabled ? 'btn-disable' : ''} ${
                _isThemeGame ? 'game-button' : ''
              }`
            "
            :disabled="errorMessage || isActionButtonDisabled"
            class="liquidity btn-liquidity"
            @click="handleNextAction"
          >
            <UiLoading v-if="buttonState.loading" />
            <span v-else>{{ actionButtonText }}</span>
          </button>
        </div>
        <!-- <div v-if="requireLogin" class="mt-4">
          <button
            :disabled="!requireLogin"
            @click="handleConnectWallet"
            class="liquidity btn-liquidity"
            :class="_isThemeGame ? 'game-button' : ''"
          >
            <span>{{ $t('connectWallet') }}</span>
          </button>
        </div> -->
      </template>
    </UiModalForm>
  </UiModal>
</template>
<script>
import Vue from 'vue';
import { normalizeBalance } from '@/helpers/utils';
import config from '@/config';
import { mapActions } from 'vuex';
import BigNumber from 'bignumber.js';
import { scale, BNB_KEY, getEtherscanLink } from '@/utils/helpers';
import {
  wrappedToken,
  getKurveAllowances,
  kurveAddLiquidity
} from '@/helpers/kurve';
import { ApprovalState } from '@/utils';
import Storage from '@/utils/storage';
import dayjs from 'dayjs';
import { ErrorCode } from '@ethersproject/logger';
import _provider from '@/helpers/provider';
import CurrencyInput from '@/components/CurrencyInput.vue';

let inputInterval = null;
let approveProcessingInterval = null;
export default {
  data() {
    return {
      buttonState: {
        loading: true,
        disable: true
      },
      errorMessage: '',
      tokenAmountA: '',
      tokenAmountB: '',
      warningAccepted: false,
      poolInfo: {},
      usdTokensPrice: {},
      // approvalLoading: {},
      provider: null,
      approvalState: {},
      tokenA: '',
      tokenB: '',
      ApprovalState,
      isShowInvertedPrice: false
    };
  },
  props: {
    open: {
      type: Boolean,
      require: true
    },
    pool: {
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
    account() {
      const { connector, address } = this.$store.state.account;
      if (!connector || !connector.id || !address) {
        return '';
      }
      return address;
    },
    requireLogin() {
      return !this.isAuthenticated;
    },
    symbolA() {
      return this.symbol(this.tokenA);
    },
    symbolB() {
      return this.symbol(this.tokenB);
    },
    poolShare() {
      if (!this.poolInfo || !this.poolInfo.price) {
        return null;
      }
      if (this.poolInfo.noLiquidity && this.poolInfo.price) {
        return { percentage: 100 };
      }

      let liquidityMinted;
      if (
        this.poolInfo.pool.totalSupply.isGreaterThan(0) &&
        this.tokenAmountA &&
        this.tokenAmountB
      ) {
        const [tokenAmountA, tokenAmountB] =
          wrappedToken(this.tokenA).toLowerCase() <
          wrappedToken(this.tokenB).toLowerCase()
            ? [this.tokenAmountA, this.tokenAmountB]
            : [this.tokenAmountB, this.tokenAmountA];
        const amount0 = new BigNumber(tokenAmountA)
          .multipliedBy(this.poolInfo.pool.totalSupply)
          .dividedBy(this.poolInfo.pool.tokenA.tokenAmount);
        const amount1 = new BigNumber(tokenAmountB)
          .multipliedBy(this.poolInfo.pool.totalSupply)
          .dividedBy(this.poolInfo.pool.tokenB.tokenAmount);
        const liquidity = amount0.isLessThanOrEqualTo(amount1)
          ? amount0
          : amount1;
        if (liquidity.isGreaterThan(0)) {
          liquidityMinted = liquidity;
        }
      }

      let poolTokenPercentage;
      let balanceAfter;
      const balanceBefore = new BigNumber(this.defaultPoolShare).multipliedBy(
        this.poolInfo.pool.totalSupply
      );
      if (liquidityMinted) {
        poolTokenPercentage = liquidityMinted
          .plus(balanceBefore)
          .dividedBy(this.poolInfo.pool.totalSupply.plus(liquidityMinted))
          .multipliedBy(100);
        balanceAfter = balanceBefore.plus(liquidityMinted);
      }

      return {
        isCaculated: true,
        percentage: poolTokenPercentage,
        balanceBefore,
        balanceAfter
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

      if (percentage.isEqualTo(0)) {
        return '-';
      }

      const percentageStr = `${
        percentage.isLessThan(0.01)
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
        this.tokenAmountA &&
        this.approvalState[this.tokenA] !== ApprovalState.APPROVED
      ) {
        return `${this.$t('unlock')} ${this.symbol(this.tokenA)}`;
      }
      if (
        this.tokenAmountB &&
        this.approvalState[this.tokenB] !== ApprovalState.APPROVED
      ) {
        return `${this.$t('unlock')} ${this.symbol(this.tokenB)}`;
      }
      return this.$t('addLiquidity');
    },
    isActionButtonDisabled() {
      if (this.buttonState.loading) {
        return true;
      }
      if (this.warningAccepted) {
        return true;
      }
      if (this.requireLogin) {
        return false;
      }
      if (
        this.tokenAmountA &&
        this.approvalState[this.tokenA] !== ApprovalState.APPROVED
      ) {
        return false;
      }
      if (
        this.tokenAmountB &&
        this.approvalState[this.tokenB] !== ApprovalState.APPROVED
      ) {
        return false;
      }
      return this.buttonState.disable;
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
        // this.approvalLoading[this.tokenA] = false;
        // this.approvalLoading[this.tokenB] = false;

        await this.getPoolAllowances();
        const assets = this.$store.getters['assets/metadata'];
        const poolInfo = await this.getKurvePoolDetailByAddress({
          provider: this.provider,
          address: this.pool.id,
          tokenA: this.tokenA,
          tokenB: this.tokenB,
          assets
        });
        this.poolInfo = poolInfo;
        this.handlebuttonState();
        this.buttonState.loading = false;
      }
    }
  },
  async created() {
    this.provider = await this.$store.getters['account/provider'];
    const tokenA = this.tokenAProps;
    const tokenB = this.tokenBProps;
    this.tokenA =
      wrappedToken(tokenA).toLowerCase() < wrappedToken(tokenB).toLowerCase()
        ? tokenA
        : tokenB;
    this.tokenB =
      wrappedToken(tokenA).toLowerCase() < wrappedToken(tokenB).toLowerCase()
        ? tokenB
        : tokenA;
    await this.getPoolAllowances();
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

    this.handlebuttonState();
    this.buttonState.loading = false;
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
    setShowInvertedPrice() {
      this.isShowInvertedPrice = !this.isShowInvertedPrice;
    },
    feeRangeCalc(amp) {
      let baseFee = 0;
      if (amp > 20) baseFee = 4;
      if (amp <= 20 && amp > 5) baseFee = 10;
      if (amp <= 5 && amp > 2) baseFee = 20;
      if (amp <= 2) baseFee = 30;

      return `${(baseFee / 2 / 100).toPrecision()}% - ${(
        (baseFee * 2) /
        100
      ).toPrecision()}%`;
    },
    handleInputChange(value, type, tokens) {
      const assets = this.$store.getters['assets/metadata'];

      if (new BigNumber(value).isNaN()) {
        this.tokenAmountA = '';
        this.tokenAmountB = '';

        return this.handlebuttonState();
      }

      if (type === 'tokenIn') {
        this.tokenAmountA = this._validInputNumber(
          value,
          this._hasLimitedDecimalToken(tokens[0].address) ? 6 : 18
        );

        if (this.poolInfo.price.price && !this.poolInfo.price.price.isNaN()) {
          this.tokenAmountB = this._validInputNumber(
            new BigNumber(value)
              .multipliedBy(this.poolInfo.price.price)
              .decimalPlaces(assets[this.tokenB].decimals)
              .toString(),
            this._hasLimitedDecimalToken(tokens[1].address) ? 6 : 18
          );
        }
      } else if (type === 'tokenOut') {
        this.tokenAmountB = this._validInputNumber(
          value,
          this._hasLimitedDecimalToken(tokens[1].address) ? 6 : 18
        );

        if (this.poolInfo.price.invert && !this.poolInfo.price.invert.isNaN()) {
          this.tokenAmountA = this._validInputNumber(
            new BigNumber(value)
              .multipliedBy(this.poolInfo.price.invert)
              .decimalPlaces(assets[this.tokenA].decimals)
              .toString(),
            this._hasLimitedDecimalToken(tokens[0].address) ? 6 : 18
          );
        }
      }

      this.$forceUpdate();

      if (inputInterval) {
        clearTimeout(inputInterval);
        inputInterval = null;
      }

      inputInterval = setTimeout(async () => {
        await this.getPoolAllowances();
        this.handlebuttonState();

        clearTimeout(inputInterval);
        inputInterval = null;
      }, 500);
    },
    handlebuttonState() {
      if (!this.account) {
        this.buttonState.disable = true;
        this.errorMessage = 'Connect Wallet';
        this.warningAccepted = false;
      }
      if (
        (this.tokenAmountA === '' && this.tokenAmountB === '') ||
        this.tokenAmountA === 'NaN' ||
        this.tokenAmountB === 'NaN' ||
        new BigNumber(this.tokenAmountA).isEqualTo(0) ||
        new BigNumber(this.tokenAmountB).isEqualTo(0)
      ) {
        this.buttonState.disable = true;
        this.errorMessage = this.$t('amountEmptyWarning');
        this.warningAccepted = false;
        return;
      }
      if (
        new BigNumber(this.tokenAmountA).isGreaterThan(
          this.getBalance(this.tokenA)
        )
      ) {
        this.buttonState.disable = true;
        this.errorMessage = this.$t('amountExceedsBalance');
        this.warningAccepted = false;
        return;
      }
      if (
        new BigNumber(this.tokenAmountB).isGreaterThan(
          this.getBalance(this.tokenB)
        )
      ) {
        this.buttonState.disable = true;
        this.errorMessage = this.$t('amountExceedsBalance');
        this.warningAccepted = false;
        return;
      }

      this.buttonState.disable = false;
      this.errorMessage = '';
      this.warningAccepted = true;
    },
    formatBalance(balanceString, tokenDecimals) {
      return normalizeBalance(balanceString, tokenDecimals);
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
    async getPoolAllowances() {
      const allowanceAddresses = [];
      const tokenInputAmounts = [];
      if (this.tokenA !== BNB_KEY && this.tokenA !== config.addresses.weth) {
        allowanceAddresses.push(this.tokenA);
        tokenInputAmounts.push(new BigNumber(this.tokenAmountA || 0));
      } else {
        this.approvalState[this.tokenA] = ApprovalState.APPROVED;
      }
      if (this.tokenB !== BNB_KEY && this.tokenB !== config.addresses.weth) {
        allowanceAddresses.push(this.tokenB);
        tokenInputAmounts.push(new BigNumber(this.tokenAmountB || 0));
      } else {
        this.approvalState[this.tokenB] = ApprovalState.APPROVED;
      }

      const allowances = await getKurveAllowances(
        this.provider,
        this.account,
        config.kurve.addresses.routerV2,
        allowanceAddresses,
        tokenInputAmounts
      );
      allowances.map(allowance => {
        Vue.set(this.approvalState, allowance.address, allowance.state);
      });
    },
    async handleNextAction() {
      if (this.requireLogin) {
        this.handleConnectWallet();
        return;
      }
      if (
        this.tokenAmountA &&
        this.approvalState[this.tokenA] !== ApprovalState.APPROVED
      ) {
        await this.handleAppove(this.tokenA);
        return;
      }
      if (
        this.tokenAmountB &&
        this.approvalState[this.tokenB] !== ApprovalState.APPROVED
      ) {
        await this.handleAppove(this.tokenB);
        return;
      }
      await this.handleAddLiquidity();
    },
    handleConnectWallet() {
      this.$store.dispatch('openAccountModal');
    },
    async handleAppove(address) {
      this.buttonState.loading = true;
      try {
        await this.approve({
          token: address,
          spender: config.kurve.addresses.routerV2
        });

        approveProcessingInterval = setInterval(async () => {
          await this.getPoolAllowances();
          this.buttonState.loading = false;

          clearInterval(approveProcessingInterval);
          approveProcessingInterval = null;
        }, 3000);
      } catch (error) {
        this.buttonState.loading = false;
      }
    },
    async handleAddLiquidity() {
      const assets = this.$store.getters['assets/metadata'];
      const finalTokenAmountA = new BigNumber(this.tokenAmountA)
        .multipliedBy(new BigNumber(10).pow(assets[this.tokenA].decimals))
        .decimalPlaces(0);
      const finalTokenAmountB = new BigNumber(this.tokenAmountB)
        .multipliedBy(new BigNumber(10).pow(assets[this.tokenB].decimals))
        .decimalPlaces(0);

      const slippage = this.poolInfo.noLiquidity ? 0 : Storage.getSlippage();
      const finalMinTokenAmountA = finalTokenAmountA
        .multipliedBy(1 - slippage)
        .decimalPlaces(0);
      const finalMinTokenAmountB = finalTokenAmountB
        .multipliedBy(1 - slippage)
        .decimalPlaces(0);
      const deadline = Storage.getDeadline();
      this.buttonState.loading = true;
      this.buttonState.disable = true;
      try {
        const tx = await kurveAddLiquidity(
          this.pool.id,
          this.tokenA,
          this.tokenB,
          finalTokenAmountA,
          finalTokenAmountB,
          finalMinTokenAmountA,
          finalMinTokenAmountB,
          this.account,
          new BigNumber(dayjs().valueOf())
            .dividedBy(1000)
            .plus(deadline * 60)
            .decimalPlaces(0),
          new BigNumber(slippage),
          assets,
          this.provider
        );
        // Vue.prototype.$mixpanel.track('addLiquidityStable', {
        //   tx: tx,
        //   params: {
        //     poolId: this.pool.id,
        //     tokenA: this.tokenA,
        //     tokenB: this.tokenB,
        //     finalTokenAmountA: new BigNumber(finalTokenAmountA).toString(),
        //     finalTokenAmountB: new BigNumber(finalTokenAmountB).toString(),
        //     finalMinTokenAmountA: new BigNumber(
        //       finalMinTokenAmountA
        //     ).toString(),
        //     finalMinTokenAmountB: new BigNumber(
        //       finalMinTokenAmountB
        //     ).toString(),
        //     account: this.account
        //   }
        // });
        await this.handleTransaction(
          tx,
          'transactionTitles.addStablecoinLiquidity'
        );
        this.$store.dispatch('account/fetchAssets', [this.tokenA, this.tokenB]);
      } catch (e) {
        // do nothing
      }

      this.$store.dispatch('farm/getFarmUserData');
      this.$store.dispatch('prestaking/fetchPreStakingUserData');
      this.buttonState.loading = false;
      this.buttonState.disable = false;
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
      this.tokenAmountA = '';
      this.tokenAmountB = '';
      this.buttonState.loading = true;
      this.buttonState.disable = true;
      this.$emit('close', reload);
    },
    isInputValid(token, index) {
      if (index === 0) {
        return this.getBalance(token.address) < this.tokenAmountA;
      }
      return this.getBalance(token.address) < this.tokenAmountB;
    }
  }
};
</script>
<style lang="scss" scoped>
.disable {
  pointer-events: none;
  opacity: 0.5;
}
.asset.active {
  opacity: 1;
}

.column-lg-liquidity {
  width: 100px;
}

.text-token.column {
  min-width: 120px !important;
  width: inherit !important;
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
.content-add-liquidity {
  color: var(--color-text-tooltip);
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

.column-one-liquidity {
  flex-grow: 1;
}

.column-two-liquidity {
  width: 50px;
}

.column-three-liquidity {
  width: 175px;
  @media only screen and (max-width: 768px) {
    width: 145px !important;
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

.game {
  font-size: 11px;
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
.space {
  justify-content: space-between;
  font-size: 15px !important;
  font-family: $font-weight-regular !important;
}

.text-addLiquidity.game-text-addLiquidity {
  font-size: 18px;
}
.hand {
  cursor: pointer;
}
.price {
  align-items: center;
  justify-content: flex-end;
  align-content: center;
}

.b-dashed {
  border: 1px dashed var(--color-border) !important;

  .text {
    color: var(--text-color-liquidity) !important;
    opacity: 1 !important;
    font-size: 15px !important;
    font-family: $font-weight-regular !important;
  }
  .text.game {
    font-family: $font-forward !important;
    font-size: 11px !important;
  }
}

.amount {
  border: 1px solid var(--color-border) !important;
  border-radius: 5px;
  .text {
    color: var(--text-color-liquidity) !important;
    opacity: 1 !important;
  }

  .text.game {
    font-family: $font-forward !important;
    font-size: 11px !important;
  }
}

.price {
  .text {
    color: var(--text-color-liquidity) !important;
    opacity: 1 !important;
  }
}

.game-btn-input-liquidity {
  border-radius: 0 !important;
  border: 0;
  line-height: 25px !important;
}

.b-dashed.game {
  border: 3px dashed #dee2e6 !important;
  font-family: $font-forward;

  @media only screen and (max-width: 768px) {
    margin-bottom: 30px;
  }
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

.btn-approve {
  margin-bottom: 0 !important;
}

.btn-approve.game-button {
  margin: 20px 30px 20px 30px !important;
}

@media only screen and (max-width: 768px) {
  .modal-liquidity.game {
    .text-addLiquidity {
      font-size: 18px !important;
    }

    .text-token {
      font-size: 10px !important;
    }
  }

  .btn-liquidity.game-button {
    margin: 15px 30px !important;
    font-size: 13px !important;
    height: 20px !important;
    padding: 0 10px !important;
  }

  .list-btn-approve {
    flex-direction: column !important;
  }
}
</style>
