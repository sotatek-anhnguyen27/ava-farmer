<template>
  <div class="switch-theme position-relative">
    <div
      :class="
        `switch-theme-action ${modeLogo} ${
          _isThemeGame ? 'game-btn-topnav' : ''
        }`
      "
    >
      <div class="icon-theme" @click="switchTheme('dark')">
        <Icon
          v-if="modeLogo !== 'dark' && !_isThemeGame"
          name="moon"
          size="16"
        />
        <img
          v-if="modeLogo !== 'dark' && _isThemeGame"
          src="~@/assets/icon/game/moon.png"
          style="width: 20px"
        />
      </div>
      <div class="icon-theme" @click="switchTheme('light')">
        <Icon
          v-if="modeLogo !== 'light' && !_isThemeGame"
          name="sun"
          size="18"
        />
        <img
          v-if="modeLogo !== 'dark' && _isThemeGame"
          src="~@/assets/icon/game/sun.png"
          style="width: 20px"
          class="ml-1"
        />
      </div>
      <div class="icon-theme" @click="switchTheme('game')">
        <img v-if="modeLogo !== 'game'" src="~@/assets/icon/games.svg" />
      </div>
    </div>
  </div>
</template>

<script>
import Storage from '@/utils/storage';
import { allLanguages } from '@/config/language.ts';
import i18n from '@/i18n';

export default {
  computed: {
    modeLogo() {
      return this.$store.state.theme.mode;
    },
    languageSelected() {
      return this.$store.state.theme.language;
    }
  },
  methods: {
    switchTheme(theme) {
      if (theme === 'game') {
        this.$store.dispatch('theme/setLanguage', allLanguages[0].code);
      }
      i18n.locale = Storage.getLanguage();

      this.$store.dispatch('theme/setTheme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  }
};
</script>

<style scoped lang="scss">
.switch-theme {
  margin-right: 30px;
  cursor: pointer;
  @media only screen and (max-width: 768px) {
    display: flex;
    justify-content: center;
    margin-right: 0 !important;

    .icon-moon {
      padding-bottom: 2px;
    }
  }

  .switch-theme-action {
    background: linear-gradient(270deg, #ff8c06 0%, #f47820 100%);
    border-radius: 100px;
    width: 95px;
    height: 30px;
    display: flex;
    position: relative;
    align-items: center;

    .icon-theme {
      padding: 0 5px;
      display: flex;
      width: 40px;
      transition: 0.4s;
      color: rgba(255, 255, 255, 0.5);
      .icon-sun {
        padding-top: 3px;
      }
    }

    &::after {
      content: '';
      width: 22px !important;
      height: 22px !important;
      background-color: $white !important;
      box-shadow: -1px 0px 3px rgba(0, 0, 0, 0.22),
        inset -2px -2px 0px rgba(0, 0, 0, 0.11);
      border-radius: 100px !important;
      top: 4px !important;
      cursor: pointer;
      position: absolute;
      transition: 0.4s;
    }
  }

  .switch-theme-action.game-btn-topnav {
    border-radius: 0 !important;
    background: #692700;
    height: 20px;

    &::after {
      width: 12px !important;
      height: 12px !important;
      box-shadow: 4px 0 #fff, -4px 0 #fff, 0 -4px #fff, 0 4px #fff, 8px 0 black,
        -8px 0 black, 0 -8px black, 0 8px black, 0 0 0 4px black !important;
      margin: 8px;
      border-radius: 0 !important;
      top: -4px !important;
      cursor: pointer;
      position: absolute;
      transition: 0.4s;
    }
  }

  .switch-theme-action.game-btn-topnav {
    &::after {
      left: 74px !important;
    }
  }

  .light {
    &::after {
      left: 50% !important;
      transform: translateX(-50%);
    }
  }

  .dark {
    &::after {
      left: 5px !important;
    }
  }

  .game {
    &::after {
      left: 68px !important;
    }
  }
}
</style>
