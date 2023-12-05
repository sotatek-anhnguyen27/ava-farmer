<template>
  <ModalBase
    :title="'Recent Transactions'"
    :open="open"
    @close="close"
    :class="'transaction-modal'"
  >
    <template #default>
      <div class="content">
        {{
          !isLoggedIn ? $t('connectWalletForTransaction') : $t('noTransaction')
        }}
      </div>
    </template>
  </ModalBase>
</template>
<script>
import ModalBase from '@/components/swap/modals/ModalBase.vue';

export default {
  components: {
    ModalBase
  },
  props: {
    open: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    isLoggedIn() {
      const { connector, address } = this.$store.state.account;
      if (!connector || !connector.id || !address) {
        return false;
      }
      return true;
    }
  },
  methods: {
    close() {
      return this.$store.dispatch('closeTransactionModal');
    }
  }
};
</script>
<style lang="scss">
.transaction-modal {
  .modal {
    width: 320px;
    height: fit-content;
    background: var(--background-color);
    .header {
      font-size: 18px;
      padding: 20px 0 0 20px;
      min-height: 35px;
      .icon-close-modal {
        display: none;
      }
    }
    .modal-body {
      padding: 20px;
    }
    .content {
      color: var(--pool-text-color);
      font-family: $font-weight-regular;
    }
  }
}
@media only screen and (max-width: 768px) {
  .transaction-modal {
    .modal {
      border-radius: 20px;
      padding: 25px 20px;
      .header {
        padding: 0;
        font-size: 18px;
        min-height: 35px;
      }
      .modal-body {
        padding: 0;
        margin-top: 20px;
      }
    }
  }
}
</style>
