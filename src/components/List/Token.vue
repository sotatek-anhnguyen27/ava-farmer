<template>
  <UiTableTr>
    <div class="flex-auto text-left">
      <router-link
        :to="{ name: 'explore', query: { token: [checksum], filter: 1 } }"
        class="d-flex flex-items-center"
      >
        <Token :address="token.address" :symbol="token.symbol" class="mr-1" />
        <span
          :class="token.symbol.length > 28 && 'tooltipped tooltipped-n'"
          :aria-label="token.symbol"
        >
          <span class="name text-uppercase">
            {{ _shorten(token.symbol, 28) }}
          </span>
        </span>
      </router-link>
    </div>
    <UiNum :value="token.weightPercent / 1e2" format="percent" class="column" />
    <UiNum :value="tokenBalance" class="column hide-sm" />
    <UiNum :value="myPoolBalance" class="column hide-sm hide-md" />
    <div
      v-text="_num(myShareValue, 'usd')"
      format="currency"
      class="column hide-sm hide-md hide-lg"
    />
  </UiTableTr>
</template>

<script>
import { getAddress } from '@ethersproject/address';
import { normalizeBalance } from '@/helpers/utils';

export default {
  props: ['pool', 'bPool', 'token'],
  computed: {
    poolTokenBalance() {
      const bptAddress = this.bPool.getBptAddress();
      const balance = this.$store.state.account.balances[
        getAddress(bptAddress)
      ];
      return normalizeBalance(balance || '0', 18);
    },
    totalShares() {
      return parseFloat(this.bPool.metadata.totalShares);
    },
    checksum() {
      return getAddress(this.token.address);
    },
    myPoolBalance() {
      if (!this.poolTokenBalance) return 0;
      const balance =
        (this.poolTokenBalance / this.totalShares) * this.token.balance;
      return parseFloat(balance.toString());
    },
    myShareValue() {
      const price =
        this.price.values[this.token.checksum] ||
        this.price.values[this.token.address];
      return (price * this.myPoolBalance).toString();
    },
    tokenBalance() {
      return parseFloat(this.token.balance).toString();
    }
  }
};
</script>
<style lang="scss">
.name {
  color: var(--text-color);
  margin-left: 10px;
}
</style>
