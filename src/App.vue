<template>
  <div id="app" class="overflow-hidden">
    <UiLoadingPage v-if="ui.loading || !ui.init" class="overlay big" />
    <div v-else>
      <Topnav />
      <div class="d-flex flex-row" :class="ui.sidebarIsOpen ? 'full' : ''">
        <divPNo
          Live
          Farm
          Available
          class="shell shell-sidebar"
          :class="
            `${ui.sidebarIsOpen && 'sidebar-is-open'} ${
              _isThemeGame ? 'shell-game' : ''
            }`
          "
          @click="toggleSidebar"
        />
        <Sidebar />
        <router-view
          id="view"
          class="flex-auto"
          :class="`${_isThemeGame ? 'view-game' : ''} `"
        />
      </div>
      <Notifications />
      <portal-target name="modal" multiple />
      <ModalSettings
        v-if="!isSettingsModalForKurve"
        :open="isSettingsModalOpen"
      />
      <ModalAccount
        :open="isAccountModalOpen"
        @close="closeAccountModal"
        @login="handleLogin"
      />
      <ModalTestnetWarning
        v-if="this.isKovanNetwork"
        :open="isTestnetWarningModalOpen"
      />
      <!--      <ModalTradingCompetitionCampaign-->
      <!--        :open="isTradingCompetitionCampaignModalOpen"-->
      <!--      />-->
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import Storage from '@/utils/storage';
import { pageView } from '@/helpers/fathom';
import ModalAccount from '@/components/Modal/Account.vue';
import ModalSettings from '@/components/swap/modals/ModalSettings.vue';
import ModalTestnetWarning from '@/components/Modal/TestnetWarning.vue';
import ModalTradingCompetitionCampaign from '@/components/Modal/TradingCompetitionCampaign.vue';

import { useIntervalFn } from '@vueuse/core';
export default {
  data: () => {
    return {
      loaded: false,
      inputNumberKeysAllowed: [
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '.'
      ],
      pauseIntervalFn: undefined,
      isKovanNetwork: process.env.VUE_APP_NETWORK === 'kovan'
    };
  },
  metaInfo: {
    title: 'Pool management',
    // all titles will be injected into this template
    titleTemplate: '%s | Avax'
  },
  components: {
    ModalAccount,
    ModalSettings,
    // ModalConnectorSelector,
    ModalTestnetWarning
    // ModalTradingCompetitionCampaign
  },
  watch: {
    $route() {
      pageView();
      if (this._isMobile) {
        this.hideSidebar();
      }
    },
    'ui.modalOpen': function(val) {
      const el = document.body;
      el.classList[val ? 'add' : 'remove']('overflow-hidden');
    }
  },
  methods: {
    ...mapActions(['init', 'toggleSidebar', 'hideSidebar']),
    async handleLogin(connector) {
      this.loading = true;
      this.$store.dispatch('closeAccountModal');
      this.$store.dispatch('account/connect', connector);
      this.loading = false;
    },
    closeAccountModal() {
      this.$store.dispatch('closeAccountModal');
    }
  },
  computed: {
    isSettingsModalOpen() {
      return this.$store.state.ui.modal.settings.isOpen;
    },
    isAccountModalOpen() {
      return this.$store.state.ui.modal.account.isOpen;
    },
    isSettingsModalForKurve() {
      return this.$store.state.ui.modal.settings.forKurve;
    },
    isTestnetWarningModalOpen() {
      if (!this.isKovanNetwork) {
        return false;
      }
      return this.$store.state.ui.modal.testNestWarning.isOpen;
    }
    // isTradingCompetitionCampaignModalOpen() {
    //   return this.$store.state.ui.modal.tradingCompetitionCampaign.isOpen;
    // }
  },
  created() {
    if (this._isMobile) {
      this.hideSidebar();
    }
    const mode = Storage.getModeTheme();
    if (mode === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else if (mode === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'game');
    }
  },
  mounted() {
    this.init();
    this.$store.dispatch('assets/init');
    this.$store.dispatch('account/init');
    this.$store.dispatch('initPrices');
    if (!this.pauseIntervalFn) {
      const { pause, resume, isActive } = useIntervalFn(async () => {
        await this.$store.dispatch('fetchSummaries');
        if (!this.$store.state.account.address) {
          return null;
        }
        console.log(
          '==== Fetching state account with interval 30s at: ',
          new Date().toLocaleString()
        );
        await this.$store.dispatch('account/fetchState');
      }, 30 * 1000);

      this.pauseIntervalFn = pause;
    }
  },
  beforeDestroy() {
    if (!this.pauseIntervalFn) {
      return;
    }
    this.pauseIntervalFn();
  }
};
</script>

<style lang="scss">
@import './vars';

:root {
  --background-primary: #fafafa;
  --background-secondary: #fff;
  --background-control: #fff;
  --background-hover: #f5f5f5;
  --border: #e5e5e5;
  --text-primary: #21222c;
  --text-secondary: #718b98;
  --success: #21b66f;
  --info: #7685d5;
  --warning: #ff9a1a;
  --error: #ff5b4c;
  --font-size-tiny: 11px;
  --font-size-small: 14px;
  --font-size-medium: 16px;
  --font-size-large: 18px;
  --font-size-header: 24px;
  --border-radius-large: 25px;
  --border-radius-medium: 10px;
  --border-radius-small: 5px;
  --block-height: 50px;
}

#view {
  margin-left: 0;
  margin-top: 70px;
  color: var(--color-primary);
  width: calc(100% - 65px);
  @media (min-width: 769px) {
    margin-left: 65px;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
}

.view-game {
  font-family: $font-forward;
  font-size: 12px;

  p {
    font-family: $font-forward;
  }
}

.full {
  #view {
    width: calc(100% - 190px);
    @media (min-width: 769px) {
      margin-left: 190px;
    }
  }
}

.shell {
  &.sidebar-is-open {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 5;
  }
}

.shell.shell-game {
  z-index: 5;
}

@media (min-width: 769px) {
  .shell.shell-sidebar {
    display: none !important;
  }
}

:root {
  --background-color-root: #f1f3f6;
  --color-primary: #f47820; //use
  --background-color: #f9f9f9;
  --panel-background: #ffffff;
  --tab-background-pool: #f47820; //use
  --odd-row-background: rgb(229, 229, 229, 0.3);
  --text-color: #000000;
  --text-color-checkbox: rgb(0, 0, 0, 0.7);
  --text-color-input: rgb(0, 0, 0);
  --text-color-liquidity: #000000;
  --secondary-text-color: #000000;
  --color-arrow-down: rgba(0, 0, 0, 0.4);
  --hover-background: #fdf2e9;
  --filter-background: #f1f1f1;
  --secondary-button-background: #b0b0b0;
  --secondary-button-border: #b0b0b0;
  --secondary-button-text: #ffffff;
  --color-table-pooloverviwe: #f9f9f9;
  --button-disabled-text: #f9f9f9;
  --button-enabled-text: #f9f9f9;
  --border-color: rgba(0, 0, 0, 0.1);
  --button-color-checkbox: rgba(0, 0, 0, 0.4);
  --color-tooltip: rgba(0, 0, 0, 0.5);
  --color-text-tooltip: rgba(0, 0, 0, 0.7);
  --box-shadow-tooltip: rgba(0, 0, 0, 0.1);
  --input-hover-border: #ffffff;
  --color-border: rgba(0, 0, 0, 0.1);
  --bg-toggle: rgba(208, 208, 208, 0.3);
  --toggle-active-bg: #7a7a7a;
  --toggle-active-text: white;
  --border-toggle: rgba(0, 0, 0, 0.1);
  --border-shadow-toggle: rgba(0, 0, 0, 0.075);
  --text-toggle: #265800;
  --text-btn: rgba(0, 0, 0, 0.4);
  --text-btn-search: rgba(0, 0, 0, 0.3);
  --text-gray: rgba(0, 0, 0, 0.5);
  --border-input: rgba(0, 0, 0, 0.05);
  --tab-label-color: rgba(0, 0, 0, 0.3);
  --pool-button-background: #b0b0b0;
  --pool-text-color: rgba(0, 0, 0);
  --pool-label-color: #33670c;
  --pool-label-border: rgba(0, 0, 0, 0.05);
  --pool-label-text: #ffffff;
  --counter-background: #33670c;
  --counter-border: rgba(0, 0, 0, 0.05);
  --counter-text-color: #ffffff;
  --border-table-body: rgba(0, 0, 0, 0.2);
  --theme-mode-icon: rgb(127, 127, 127, 0.7);
  --theme-mode-icon-hover: rgb(127, 127, 127, 0.9);
  --icon-close-color: rgba(0, 0, 0, 0.5);
  --color-logo: #6b5436;
  --bg-child: #f9f9f9;
  --bg-sidebar: #ffffff;
  --bg-icon: #f9f9f9;
  --swap-btn-background: #f9f9f9;
  --setting-color: #7f7f7f;
  --slippage-option-background: #fff;
  --type-label: rgba(0, 0, 0, 0.2);
  --border-table: rgba(0, 0, 0, 0.2);
  --border-search: rgba(0, 0, 0, 0.1);
  --border-shadow-search: rgba(0, 0, 0, 0.1);
  --border-button-input: rgba(0, 0, 0, 0.075);
  --box-shadow-input: rgba(0, 0, 0, 0.075);
  --box-shadow-table: rgba(0, 0, 0, 0.2);
  --input-background: rgba(222, 222, 222, 0.3);
  --tab-background: #f4f4f4;
  --bg-switch: linear-gradient(81.63deg, #77bd41 1.42%, #4e931a 100%);
  --bg-switch-hover: #4e931a;
  --swap-background: #f9fdf5;
  --bg-input-search: rgba(222, 222, 222, 0.3);
  --color-linear-gradient: linear-gradient(
    81.63deg,
    #77bd41 1.42%,
    #4e931a 100%
  );
  --swap-balance-text-color: rgba(0, 0, 0, 0.7);
  --color-plachoder-search: rgba(0, 0, 0, 0.3);
  --color-text-not-found: rgba(0, 0, 0, 0.4);
  --bg-btn-connect: linear-gradient(
    0deg,
    rgb(255, 255, 255),
    rgb(255, 255, 255)
  );
  --color-icon-social: rgb(255, 255, 255);
  --color-warning-token: rgb(0, 0, 0, 0.7);
  --color-background-warning-token: linear-gradient(0deg, #ffffff, #ffffff);
  --color-text-button-agree: rgba(0, 0, 0, 0.7);
  --color-text-button-agree-hover: #f47820;
  --label-row-color: rgba(0, 0, 0, 0.4);
  --detail-row-background: rgba(208, 208, 208, 0.3);
  --bg-switch-sort: #d0d0d0;
  --color-border-select: rgba(0, 0, 0, 0.075);
  --bg-select: #f1f1f1;
  --backround-input: rgb(222, 222, 222, 0.3);
  --scroll-bar-background: rgba(0, 0, 0, 0.2);
  --bg-hover-btn: #ffffff;
  --color-hover-btn: #ffffff;
  --background-button-cancel: #b0b0b0;
  --button-color-checkbox-create: rgb(0, 0, 0, 0.5);
  --btn-color-primary: #f47820; //use
  --sidebar-text-color: white;
  --link-color: #3990f8; //use
  --loading-color: #fff; //use
  --vesting-header-text-color: rgba(0, 0, 0, 0.7);
  --total-value: #4f4f4f;
  --countdown-bg: #0c2a54;
}
[data-theme='dark'] {
  --countdown-bg: #ffffff;
  --background-color-root: #0d1e31;
  --color-primary: #515d69;
  --background-color: linear-gradient(59.81deg, #041627 22.76%, #0d1e31 89.02%);
  --panel-background: #0f263e;
  --odd-row-background: rgb(0, 0, 0, 0.2);
  --text-color: #f9f9f9;
  --text-color-checkbox: rgb(249, 249, 249, 0.7);
  --text-color-input: rgb(249, 249, 249);
  --secondary-text-color: #ffffff;
  --color-arrow-down: rgba(255, 255, 255, 0.4);
  --hover-background: #303844;
  --filter-background: #0f263e;
  --secondary-button-background: #0f263e;
  --secondary-button-border: #77bd41;
  --secondary-button-text: #77bd41;
  --color-table-pooloverviwe: #1b3148;
  --button-disabled-text: rgb(249, 249, 249, 0.5);
  --button-enabled-text: #f9f9f9;
  --text-color-liquidity: #ffffff;
  --border-color: rgba(255, 255, 255, 0.1);
  --button-color-checkbox: rgba(255, 255, 255, 0.4);
  --color-tooltip: rgba(255, 255, 255, 0.5);
  --color-text-tooltip: rgba(255, 255, 255, 0.7);

  --box-shadow-tooltip: none;
  --input-hover-border: #0f263e;
  --tab-label-color: rgba(255, 255, 255, 0.3);
  --pool-button-background: #3d4a59;
  --pool-text-color: rgba(255, 255, 255);
  --pool-label-color: #1b3148;
  --counter-background: #33670c;
  --counter-border: rgba(255, 255, 255, 0.05);
  --counter-text-color: #ffffff;
  --border-table-body: rgba(255, 255, 255, 0.1);
  --theme-mode-icon: rgba(255, 255, 255);
  --theme-mode-icon-hover: rgba(255, 255, 255, 0.5);
  --color-border: rgba(255, 255, 255, 0.1);
  --bg-toggle: #081d33;
  --toggle-active-bg: #31455a;
  --toggle-active-text: white;
  --border-toggle: rgba(255, 255, 255, 0.25);
  --border-shadow-toggle: rgb(0 0 0 / 50%);
  --text-toggle: rgba(78, 147, 26, 0.7);
  --text-btn: rgba(255, 255, 255, 0.4);
  --text-btn-search: rgba(255, 255, 255, 0.2);
  --text-gray: rgba(255, 255, 255, 0.5);
  --border-input: rgba(255, 255, 255, 0.05);
  --pool-label-border: rgba(255, 255, 255, 0.05);
  --pool-label-text: rgba(255, 255, 255);
  --icon-close-color: rgba(255, 255, 255, 0.5);
  --color-logo: #ffffff;
  --bg-child: #0f263e;
  --bg-sidebar: #0d2035;
  --bg-icon: rgba(255, 255, 255, 0.05);
  --swap-btn-background: rgba(255, 255, 255, 0.05);
  --setting-color: rgba(255, 255, 255, 0.3);
  --slippage-option-background: #273c51;
  --type-label: rgba(255, 255, 255, 0.2);
  --border-table: rgba(255, 255, 255, 0.2);
  --border-search: rgba(255, 255, 255, 0.1);
  --border-shadow-search: rgb(0 0 0 / 50%);
  --border-button-input: #1b3148;
  --box-shadow-input: rgb(0 0 0 / 50%);
  --box-shadow-table: rgba(255, 255, 255, 0.2);
  --tab-background-pool: #f47820; //use
  --color-linear-gradient: linear-gradient(
    81.63deg,
    #77bd41 1.42%,
    #4e931a 100%
  );
  --input-background: #081d33;
  --tab-background: #1b3148;
  --bg-switch: linear-gradient(81.63deg, #3f5165 1.42%, #274666 100%);
  --swap-background: #081d33;
  --bg-input-search: #081d33;
  --color-plachoder-search: rgba(255, 255, 255, 0.3);
  --color-text-not-found: rgba(255, 255, 255, 0.4);
  --bg-btn-connect: linear-gradient(0deg, #3f5165, #3f5165);
  --color-icon-social: rgba(255, 255, 255);
  --color-warning-token: rgb(255, 255, 255, 0.7);
  --color-background-warning-token: linear-gradient(0deg, #3f5165, #3f5165);
  --color-text-button-agree: #f47820;
  --color-text-button-agree-hover: #ffffff;
  --label-row-color: rgba(255, 255, 255, 0.4);
  --detail-row-background: #1b3148;

  --swap-balance-text-color: rgba(255, 255, 255, 0.7);
  --bg-switch-sort: linear-gradient(81.63deg, #3f5165 1.42%, #274666 100%);
  --color-border-select: #1b3148;
  --bg-select: #081d33;
  --backround-input: rgb(222, 222, 222, 0.3);
  --scroll-bar-background: rgba(255, 255, 255, 0.2);
  --bg-hover-btn: #77bd41;
  --bg-switch-hover: #4e931a;
  --color-hover-btn: #ffffff;
  --background-button-cancel: rgb(176, 176, 176, 0.4);
  --button-color-checkbox-create: rgb(255, 255, 255, 0.5);
  --btn-color-primary: #f47820; //use
  --sidebar-text-color: black; //use
  --link-color: #3990f8; //use
  --loading-color: white; //use
  --vesting-header-text-color: rgba(255, 255, 255, 0.7);
  --total-value: #f4f4f4;
}

[data-theme='game'] {
  --background-color-root: radial-gradient(
    39.96% 73.6% at 57.19% 25.27%,
    #fff9f2 0%,
    #fffcfd 100%
  );
  --loading-color: black;
  --panel-background: #ffffff;
}

@media only screen and (max-width: 768px) {
  .full {
    #view {
      height: calc(100vh - 70px);
    }
  }
}
</style>
