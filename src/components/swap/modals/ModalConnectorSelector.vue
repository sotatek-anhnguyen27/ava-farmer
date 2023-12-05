<template>
  <ModalBase
    :title="$t('connectWallet')"
    :open="open"
    @close="close"
    :class="`connect-modal ${_isThemeGame ? 'game' : ''}`"
  >
    <template #default>
      <div
        v-for="connector in connectors"
        :key="connector.id"
        :class="
          `connector  ${_isThemeGame ? 'game-border no-radius mb-4 ' : ''}`
        "
        @click="select(connector.id)"
      >
        <div>
          {{ connector.name }}
        </div>
        <img :src="connector.logo" class="connector-icon" />
      </div>
      <div class="learn-connect" :class="_isThemeGame && 'game-learn-connect'">
        <!--        <a target="_blank" href="#">-->
        <!--          <img-->
        <!--            v-if="_isThemeGame"-->
        <!--            src="~/@/assets/icon/game/help-link.png"-->
        <!--            class="mr-2"-->
        <!--          />-->
        <!--          <Icon v-else name="help" class="mr-2 link" />-->
        <!--          <span class="link">{{ $t('learnHowToConnect') }} </span>-->
        <!--        </a>-->
      </div>
    </template>
  </ModalBase>
</template>

<script>
import config from '@/config';
import {
  getConnectorLogo,
  getConnectorName,
  hasInjectedProvider
} from '@/utils/connectors';

import ModalBase from '@/components/swap/modals/ModalBase.vue';
import { mapActions } from 'vuex';

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
    connectors() {
      return Object.keys(config.connectors)
        .filter(connectorId => {
          if (connectorId === 'injected') {
            return hasInjectedProvider();
          }
          return true;
        })
        .map(connectorId => {
          return {
            id: connectorId,
            name: getConnectorName(connectorId),
            logo: getConnectorLogo(connectorId)
          };
        });
    }
  },
  methods: {
    ...mapActions(['closeConnectorModal']),
    async select(connectorId) {
      this.close();
      await this.$store.dispatch('account/connect', connectorId);
    },
    close() {
      this.closeConnectorModal();
    }
  }
};
</script>

<style lang="scss" scoped>
.connector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  background: $bg-color-btn-account !important;
  color: $color-primary;
  border: none;
  border-radius: 22px;
  padding: 0 28px;
  outline: none;
  height: 45px;
  font-size: 15px;
  margin-bottom: 10px !important;
}

.connector.game-border {
  margin-bottom: 30px !important;
  font-size: 12px;
}

.connector:hover {
  background: $color-primary !important;
  color: #fff;
}

.connector-icon {
  width: 28px;
  height: 28px;
  margin-right: 0.5rem;
  position: relative;
}
.learn-connect {
  margin: 20px 0 10px 0;
  display: flex;
  justify-content: center;
  a {
    color: $color-primary;
    font-size: 14px;
    line-height: 20px;
    display: flex;
    align-items: center;
  }

  i {
    margin-top: 4px;
  }
}

.game-learn-connect.learn-connect {
  a {
    font-size: 11px !important;
  }
}
</style>
