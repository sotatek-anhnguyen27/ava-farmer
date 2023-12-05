<template>
  <UiModal
    :open="open"
    @close="$emit('close')"
    style="max-width: 440px;"
    :class="`modal-account ${_isThemeGame ? 'game-modal-account' : ''}`"
  >
    <div v-if="step === 'connect' || !myAddress || wrongNetwork">
      <h3
        v-text="$t('connectWallet')"
        class="p-4 border-bottom text-header "
        :class="_isThemeGame && 'game-text-header'"
      />
      <div class="list-connect">
        <a
          v-for="(connector, id, i) in config.connectors"
          :key="i"
          @click="$emit('login', connector.id)"
          target="_blank"
          class="mb-2 d-block item-connect"
          :class="_isThemeGame ? 'pb-4' : ''"
        >
          <UiButton
            class="width-full v-align-middle d-flex"
            :class="_isThemeGame ? 'game-border no-radius' : ''"
          >
            <div>
              {{ connector.name }}
            </div>
            <div>
              <img
                :src="`/images/connectors/${id}.png`"
                height="28"
                width="28"
                class="v-align-middle"
              />
            </div>
          </UiButton>
        </a>
        <div class="learn-connect">
          <!--          <a target="_blank" href="#">-->
          <!--            <img-->
          <!--              v-if="_isThemeGame"-->
          <!--              src="~/@/assets/icon/game/help-link.png"-->
          <!--              class="mr-2 mb-1 link"-->
          <!--            />-->
          <!--            <Icon v-else name="help" class="mr-2 link" />-->
          <!--            <span-->
          <!--              style="text-transform: capitalize;"-->
          <!--              class="link"-->
          <!--              :class="_isThemeGame ? 'game' : ''"-->
          <!--              >{{ $t('learnHowToConnect') }}-->
          <!--            </span>-->
          <!--          </a>-->
        </div>
      </div>
    </div>
    <div v-else>
      <h3 v-text="$t('account')" class="p-4 border-bottom text-header" />
      <div v-if="myAddress" class="list-connect">
        <a
          :href="_etherscanLink(myAddress)"
          target="_blank"
          class="mb-2 d-block"
          :class="_isThemeGame ? 'pb-4' : ''"
        >
          <UiButton
            class="width-full"
            :class="_isThemeGame ? 'game-border no-radius' : ''"
          >
            <Avatar :address="myAddress" size="16" class="mr-2 ml-n1" />
            <span v-text="_shortenAddress(myAddress)" class="link" />
            <Icon v-if="!_isThemeGame" name="external-link" class="ml-1 link" />
            <img
              v-else
              src="~/@/assets/icon/game/link.png"
              class="icon-link-game"
            />
          </UiButton>
        </a>
        <div :class="_isThemeGame ? 'pb-4' : ''">
          <UiButton
            @click="step = 'connect'"
            class="width-full mb-2"
            :class="_isThemeGame ? 'game-border no-radius' : ''"
          >
            {{ $t('connectWallet') }}
          </UiButton>
        </div>
        <div :class="_isThemeGame ? 'pb-4' : ''">
          <UiButton
            @click="handleLogout"
            class="width-full text-red mb-2"
            :class="_isThemeGame ? 'game-border no-radius' : ''"
          >
            {{ $t('logout') }}
          </UiButton>
        </div>
      </div>
    </div>
  </UiModal>
</template>

<script>
import { mapActions } from 'vuex';
import Icon from '../Icon';

export default {
  components: { Icon },
  props: ['open'],
  data() {
    return {
      step: null
    };
  },
  watch: {
    open() {
      this.step = null;
    }
  },
  computed: {
    myAddress() {
      return this.$store.state.account.address;
    },
    wrongNetwork() {
      return this.$store.state.account.wrongNetwork;
    }
  },
  methods: {
    ...mapActions(['logout']),
    async handleLogout() {
      this.$store.dispatch('account/disconnect');
      this.$emit('close');
    }
  }
};
</script>
<style scoped lang="scss">
.game-popup {
  .list-connect {
    .button {
      font-family: $font-forward;
      font-size: 12px;
    }
  }
}

.game {
  font-size: 11px;
}

.modal-account {
  .text-header {
    color: var(--secondary-text-color);
    background-color: var(--tab-background);
    font-size: 22px;
    line-height: 35px;
    padding: 20px 40px !important;
  }

  .icon-close-modal {
    padding: 30px 40px !important;
  }

  .list-connect {
    padding: 20px 40px;
    overflow-y: scroll;
    max-height: 440px;
  }

  .button {
    background: $bg-color-btn-account !important;
    border: 0 !important;
    align-items: center;
    justify-content: space-between;
    color: $color-primary;
    font-size: 15px;
    line-height: 20px;
    font-family: $font-bold;
    padding: 0 30px;

    &:hover {
      background: $btn-bg-hover-color !important;
      color: $text-white !important;
    }
  }

  .learn-connect {
    margin: 20px 0 30px 0;
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
}

.game-text-header {
  font-size: 15px !important;
}

.game-modal-account {
  .text-header {
    background-color: #ff9342 !important;
    position: relative;
    z-index: 1;

    &:after {
      content: '';
      height: 50%;
      width: calc(100% - 8px);
      background-color: #f4791a;
      box-shadow: 0 -8px #f4791a, 0 0 0 4px #f4791a !important;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: 0;
      z-index: -1;
    }
  }
}
</style>
