<template>
  <UiModal
    :open="open"
    @close="$emit('close')"
    style="max-width: 440px;"
    class="modal-activity"
  >
    <h3
      v-text="$t('pendingTransactions')"
      class="m-4 mb-0 text-center text-header"
      :class="_isThemeGame && 'game-text-header'"
    />
    <Block
      :class="
        `m-4 ${_isThemeGame ? 'game-border-table' : 'border-block-activity'}`
      "
    >
      <div v-if="myPendingTransactions.length">
        <div
          v-for="(tx, i) in myPendingTransactions"
          :key="i"
          :style="i === 0 && 'border: 0 !important;'"
          class="border-top px-4 py-3 d-flex"
          :class="_isThemeGame && 'game'"
        >
          <div class="flex-auto">
            <a
              :href="_etherscanLink(tx.hash, 'tx')"
              target="_blank"
              class="color-link"
              style="font-size: 16px;"
            >
              <h5
                v-text="
                  tx.title
                    ? $t(
                        tx.title + '.title',
                        getTitleParams(tx).amount
                          ? {
                              amount: _num(getTitleParams(tx).amount)
                            }
                          : getTitleParams(tx)
                      )
                    : _shortenAddress(tx.hash)
                "
                class="d-inline-block mb-3"
                :class="_isThemeGame && 'game-link'"
              />
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
            <div
              v-text="$d(new Date(tx.timestamp), 'long')"
              :class="_isThemeGame ? 'game' : 'text-activity'"
            />
          </div>
          <div
            v-text="
              !tx.status ? 'Pending' : tx.status === 1 ? 'Success' : 'Failed'
            "
            :class="[
              tx.status === 1 && 'text-green',
              _isThemeGame ? 'game' : 'text-activity'
            ]"
          />
        </div>
      </div>
      <h5
        class="text-center p-4"
        v-else
        :class="_isThemeGame ? 'game' : 'text-activity'"
      >
        {{ $t('noPendingTransactions') }}
      </h5>
    </Block>
    <div v-if="myPendingTransactions.length" class="text-center mb-4">
      <UiButton
        @click="clearTransactions"
        v-text="$t('clearAll')"
        :class="[_isThemeGame ? 'game-border-btn-add' : '', 'button-activity']"
      />
    </div>
  </UiModal>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  props: ['open'],
  computed: {
    ...mapGetters('transactions', ['myPendingTransactions'])
  },
  methods: {
    ...mapActions('transactions', ['clearTransactions']),
    getTitleParams(tx) {
      return {
        symbol: tx.symbol,
        symbolIn: tx.symbolIn,
        symbolOut: tx.symbolOut,
        amount: tx.amount
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.text-header {
  color: var(--text-color) !important;
  font-size: 22px;
}
.game-text-header.text-header {
  padding-top: 10px !important;
  font-size: 18px !important;
}

.text-activity {
  color: var(--text-color) !important;
  font-family: $font-bold !important;
  font-size: 16px;
}

.color-link {
  color: $color-primary;
}

.button-activity.button {
  background: $btn-bg-color !important;
  color: $secondary-button-text !important;
  font-family: $font-bold !important;
  font-size: 16px !important;
  border: 0 !important;
  &:hover {
    background: $btn-bg-hover-color !important;
  }
}

.game-border-btn-add.button-activity.button {
  border-radius: 0 !important;
  border: 0 !important;
  height: 30px;
  background: $color-primary !important;
  font-family: $font-forward !important;
  font-size: 11px !important;
  &:hover {
    background: $game-btn-hover-color !important;
  }
}

.game {
  font-family: $font-forward !important;
  font-size: 12px !important;
  color: var(--text-color) !important;
}

.game-link {
  font-family: $font-forward !important;
  font-size: 14px !important;
  color: var(--text-color) !important;
}
</style>
