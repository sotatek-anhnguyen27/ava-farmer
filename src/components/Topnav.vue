<template>
  <nav
    id="topnav"
    :class="
      `position-fixed topnav ${ui.sidebarIsOpen ? 'open' : 'closed'}
    ${_isThemeGame ? 'game-border-topnav' : ''}`
    "
  >
    <div
      :class="`d-flex flex-items-center ${_isThemeGame ? 'px-3' : 'px-4'}`"
      style="height: 70px"
    >
      <div class="flex-auto d-flex flex-items-center">
        <a v-if="_isThemeGame" class="d-block" @click="handleToggleSidebar">
          <span class="menu-icon" v-if="ui.sidebarIsOpen">
            <img src="~/@/assets/icon/game/toggle.png" class="icon-game" />
            <img src="~/@/assets/icon/logo.png" class="hidden" style="height: 50px;" />
          </span>
          <span class="menu-icon" v-else>
            <img src="~/@/assets/icon/game/menu-close.png" class="icon-game" />
            <img src="~/@/assets/icon/logo-2.png" class="hidden" style="height: 50px;" />
          </span>
        </a>
        <div v-else class="d-flex">
          <a
            class="d-block mr-3 icon-toggle"
            @click="handleToggleSidebar"
            style="margin-top: 12px"
          >
            <Icon v-if="ui.sidebarIsOpen" name="menu-left" size="19" />
            <Icon v-else name="menu-left-close" size="19" />
          </a>
          <router-link
            :to="{ name: 'tradeTokens' }"
            class="text-blue d-flex link-logo"
          >
            <img
              v-if="_isMobile"
              src="~/@/assets/icon/logo-mobile.svg"
              class="mr-2 v-align-middle"
            />
            <img
              v-if="theme.mode === 'dark' && !_isMobile"
              src="~/@/assets/icon/logo-topnav-dark.svg"
              class="mr-2 v-align-middle hidden"
            />
            <img
              v-if="theme.mode === 'light' && !_isMobile"
              src="~/@/assets/icon/logo-topnav-light.svg"
              class="mr-2 v-align-middle hidden"
            />
          </router-link>
        </div>
      </div>
      <div class="d-flex" style="align-items: center">
        <div :key="myAddress" class="d-flex">
          <UiButton
            v-if="isAuthenticated && !wrongNetwork && myAddress"
            @click="openAccountModal()"
            :loading="loading || ui.authLoading"
            :class="
              `btn-account d-flex ${_isThemeGame ? 'game-btn-topnav' : ''}`
            "
          >
            <div class="btn-avatar d-flex mr-2">
              <Avatar :address="myAddress" size="16" class="ml-n1 mr-n1" />
            </div>
            <div v-text="_shortenAddress(myAddress)" />
          </UiButton>
          <UiButton
            :class="
              `button-red btn-connect ${_isThemeGame ? 'game-btn-topnav' : ''}`
            "
            @click="openAccountModal()"
            v-if="isAuthenticated && wrongNetwork"
          >
            <Icon
              v-if="!_isThemeGame"
              name="warning"
              class="ml-n2 mr-1 v-align-middle"
            />
            <img
              v-else
              src="~/@/assets/icon/game/error.png"
              style="width: 20px;"
              class="ml-n2 mr-1 v-align-middle"
            />
            {{ $t('wrongNetwork') }}
          </UiButton>
          <UiButton
            v-if="!isAuthenticated || !myAddress"
            @click="openAccountModal()"
            :loading="loading || ui.authLoading"
            :class="
              `button-primary btn-connect connect ${
                _isThemeGame ? 'game-btn-topnav' : ''
              }`
            "
          >
            {{ _isMobile ? $t('connect') : $t('connectWallet') }}
          </UiButton>
          <UiButton
            v-if="myPendingTransactions.length"
            @click="modalOpen.activity = true"
            :class="
              `button-primary btn-account ${
                _isThemeGame ? 'game-btn-topnav ml-4' : 'ml-2'
              }`
            "
          >
            {{ myPendingTransactions.length }}
          </UiButton>
        </div>
      </div>
    </div>
    <portal to="modal">
      <ModalActivity
        :open="modalOpen.activity"
        @close="modalOpen.activity = false"
        @login="handleLogin"
      />
    </portal>
  </nav>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Icon from './Icon';

export default {
  components: { Icon },
  data() {
    return {
      loading: false,
      modalOpen: {
        account: false,
        activity: false
      }
    };
  },

  computed: {
    myAddress() {
      return this.$store.state.account.address;
    },
    ...mapGetters('transactions', ['myPendingTransactions']),
    wrongNetwork() {
      return this.$store.state.account.wrongNetwork;
    }
  },
  methods: {
    ...mapActions([
      'toggleSidebar',
      'login',
      'hideSelectLanguage',
      'toggleModeTheme'
    ]),
    openAccountModal() {
      this.$store.dispatch('openAccountModal');
    },

    handleToggleSidebar() {
      this.toggleSidebar();

      if (!this.ui.sidebarIsOpen) {
        this.hideSelectLanguage();
      }
    },

    async handleLogin(connector) {
      this.modalOpen.account = false;
      this.loading = true;
      this.$store.dispatch('account/connect', connector);
      this.loading = false;
    }
  }
};
</script>

<style scoped lang="scss">
#topnav {
  z-index: 6;
  height: 70px;
  background-color: var(--background-color-root);

  .text-logo {
    display: flex;
    align-items: center;
    color: var(--color-logo);

    i {
      padding-top: 5px;
    }
  }

  .icon-toggle {
    color: $text-white;
    display: none !important;
  }

  .btn-connect {
    font-family: $font-weight-semibold;
    font-size: 14px;
    line-height: 1;
    box-shadow: rgba(0, 0, 0, 0.15) 0 2px 10px;
    background: var(--bg-btn-connect);
    border: 0;
  }

  .btn-connect.connect {
    &:hover {
      background: $color-primary !important;
      color: $bg-white;
    }
  }

  .theme-icon {
    margin-right: 16px;
    cursor: pointer;
    color: var(--theme-mode-icon);
  }
}

.topnav.open {
  left: 190px;
  width: calc(100vw - 190px);

  .link-logo {
    display: none !important;
  }
}

.topnav.closed {
  left: 65px;
  width: calc(100vw - 65px);

  .link-logo {
    display: block !important;
  }
}

@media only screen and (max-width: 768px) {
  .btn-switch-theme {
    display: none !important;
  }
  #topnav {
    .icon-toggle {
      display: block !important;
      color: $text-white !important;
    }
    background: linear-gradient(270deg, #f47820 0%, #ff8c06 100%);
  }

  .btn-avatar {
    display: none !important;
  }

  .btn-account {
    padding: 0 10px;
  }

  .topnav.open,
  .topnav.closed {
    left: 0 !important;
    width: 100% !important;

    .link-logo {
      display: block !important;
    }
  }
}

.btn-account {
  color: $color-primary;
  border: none !important;
  align-items: center;
  background: var(--bg-btn-connect);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);

  &:hover {
    background: $btn-bg-hover-color !important;
    color: $bg-white;
  }
}

.game-border-topnav {
  background-color: #ff9342 !important;
  width: calc(100vw - 16px) !important;
  left: 0 !important;
  height: 55px !important;
  position: relative;

  & > div {
    height: 55px !important;
  }

  &:after {
    content: '';
    height: 15px;
    width: calc(100vw - 24px);
    background-color: #f4791a;
    box-shadow: 0 -8px #f4791a, 0 0 0 4px #f4791a !important;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 4px;
    z-index: -1;
  }
}

.game-btn-topnav {
  border-radius: 0 !important;
  padding: 8px 15px;
  font-family: $font-forward !important;
  font-size: 10px !important;
  height: inherit !important;
}

.game-btn-topnav.btn-account,
.game-btn-topnav.button-red {
  height: 30px !important;
}

.game-btn-topnav.button-red {
  padding: 0 15px !important;
}

.game-icon-wallet {
  width: 25px;
  margin: 0 13px;
  line-height: 16px !important;
}
.menu-icon {
  display: flex;
  align-items: center;
  margin-right: 8px;
}
@media only screen and (max-width: 768px) {
  #topnav.game-border-topnav {
    width: calc(100vw - 16px) !important;
  }

  .btn-account {
    background: $bg-btn-connect;

    &:hover {
      background: $bg-btn-connect !important;
      color: $color-primary;
    }
  }
}

.hidden {
  visibility: hidden;
}
</style>
