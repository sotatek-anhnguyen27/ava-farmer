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
        <h3 v-text="$t('removeTokens')" class="title" />
      </template>
      <div class="mx-4">
        <UiTable
          v-if="step === 0"
          :class="!_isThemeGame ? 'custom-table' : 'table-pool-setting mb-5'"
        >
          <UiTableTh>
            <div v-text="$t('tokens')" class="flex-auto text-left" />
            <div v-text="$t('balance')" class="flex-auto text-left" />
          </UiTableTh>
          <UiTableTr v-for="(token, i) in pool.metadata.tokens" :key="i">
            <Token :address="token.checksum" class="mr-2" />
            <div class="flex-auto text-left">
              {{ _ticker(token.checksum) }}
            </div>
            <div
              v-text="
                parseFloat(token.balance) < 0.0001
                  ? '< 0.0001'
                  : _num(parseFloat(token.balance))
              "
              class="flex-auto text-left"
            />
            <a
              @click="handleRemoveToken(token.checksum, token.denormWeight)"
              class="mt-n2 mr-n3 text-primary"
            >
              <Icon v-if="!_isThemeGame" name="close" class="p-3" />
              <img
                v-else
                src="~@/assets/icon/game/close-token-icon.png"
                style="width: 20px"
              />
            </a>
          </UiTableTr>
        </UiTable>
      </div>

      <div v-if="step === 1" class="m-4 px-4 text-center">
        <h5
          v-text="
            `${$t('confirmRemove')} ${_ticker(pendingRemove)} ${$t('fromPool')}`
          "
          class="mb-3 description"
        />

        <h5 class="mb-3 description">
          {{ $t('willBurn') }}
          {{ _num(poolAmountIn / 1e18) }}
          {{ pool.metadata.symbol }}
        </h5>

        <ButtonUnlock
          v-if="allowance < poolAmountIn"
          :tokenAddress="pool.getBptAddress()"
          :amount="poolAmountIn"
          :decimals="18"
          @approved="allowance = poolAmountIn"
          class="btn-unlock mb-3"
          :class="_isThemeGame ? 'game-border-btn-add' : ''"
        />
        <div
          class="d-flex flex-items-center text-left p-3 warning-box"
          :class="_isThemeGame && 'game-border-message-warning'"
        >
          <Icon v-if="!_isThemeGame" name="warning" size="22" class="mr-3" />
          <img
            v-else
            src="~/@/assets/icon/game/warning.png"
            style="width: 30px;"
            class="mr-4 text game-text"
          />
          <div v-html="$t('removeTokenWarning')" />
        </div>
      </div>
      <template slot="footer">
        <div class="footer">
          <UiButton
            :disabled="step !== 1 || loading || poolAmountIn > allowance"
            :loading="loading"
            class="btn-setting-confirm btn-setting"
            :class="_isThemeGame ? 'game-border-btn-add' : ''"
          >
            {{ $t('confirm') }}
          </UiButton>
          <UiButton
            @click="$emit('close')"
            type="button"
            class="btn-setting-cancel btn-setting ml-4"
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
import { calcPoolInGivenTokenRemove } from '@/helpers/math';
import { bnum, denormalizeBalance } from '@/helpers/utils';

export default {
  props: ['open', 'pool'],
  data() {
    return {
      step: 0,
      allowance: 0,
      loading: false,
      pendingRemove: '',
      pendingWeight: 0
    };
  },
  watch: {
    async open() {
      this.step = 0;
      this.loading = false;
      this.pendingRemove = '';
      this.pendingWeight = 0;
    }
  },
  computed: {
    poolAmountIn() {
      return calcPoolInGivenTokenRemove(
        bnum(this.pool.metadata.totalWeight).times('1e18'),
        denormalizeBalance(this.pool.metadata.totalShares, 18),
        bnum(this.pendingWeight).times('1e18')
      );
    }
  },
  methods: {
    ...mapActions(['removeToken']),
    ...mapActions('account', ['getPoolAllowances']),
    async handleSubmit() {
      this.loading = true;
      await this.removeToken({
        poolAddress: this.pool.metadata.controller,
        token: this.pendingRemove,
        poolAmountIn: this.poolAmountIn
      });
      this.loading = false;
      this.$emit('close');
    },
    async handleRemoveToken(tokenAddress, tokenWeight) {
      this.pendingRemove = tokenAddress;
      this.pendingWeight = tokenWeight;
      this.step = 1;
      const allowances = await this.getPoolAllowances([
        this.pool.getBptAddress()
      ]);
      this.allowance = parseInt(
        allowances[this.pool.getBptAddress()][this.$store.state.account.proxy]
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.title {
  color: var(--text-color) !important;
}
.content {
  margin-bottom: 30px !important;
}
.footer {
  padding-bottom: 40px;
  @media only screen and (max-width: 768px) {
    padding-top: 20px;
  }
}
.custom-table {
  width: 100% !important;
  margin: auto;
  overflow: hidden;
  margin-bottom: 40px;
}

.btn-add-token {
  background-color: $color-primary !important;
  border: 0 !important;

  &:disabled {
    opacity: 0.3;
  }
}

.btn-unlock {
  border: 1px solid $color-primary;
  background-color: inherit !important;
  color: $color-primary;

  &:hover {
    background-color: $color-primary !important;
    color: $text-white !important;
  }
}

.text-primary {
  i {
    color: $color-primary !important;
  }
}

.description {
  color: var(--text-btn-search);
}

.warning-box.game-border-message-warning {
  background: $game-warning-bg-color !important;
  font-family: $font-forward;
  font-size: 12px;
}
</style>
