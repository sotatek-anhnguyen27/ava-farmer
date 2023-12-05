<template>
  <UiButton
    @click="handleSubmit"
    type="button"
    class="button-sm"
    v-if="locked"
    :loading="loading"
  >
    {{ $t('unlock') }}
  </UiButton>
</template>

<script>
import { mapActions } from 'vuex';

import { isLocked } from '@/helpers/utils';

export default {
  props: ['tokenAddress', 'amount', 'decimals'],
  data() {
    return {
      loading: false,
      input: false
    };
  },
  computed: {
    locked() {
      const res = isLocked(
        this.$store.state.account.allowances,
        this.tokenAddress,
        this.$store.state.account.proxy,
        this.amount,
        this.decimals ||
          this.networkdata.tokenMetadata[this.tokenAddress].decimals
      );
      this.$emit('input', res);
      return res;
    }
  },
  methods: {
    ...mapActions(['approve']),
    async handleSubmit() {
      this.loading = true;
      try {
        await this.approve({
          token: this.tokenAddress
        });
        this.$emit('approved', true);
      } catch (e) {
        console.log(e);
      }
      this.loading = false;
    }
  }
};
</script>
