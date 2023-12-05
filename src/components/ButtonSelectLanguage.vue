<template>
  <div
    class="select-language"
    :class="
      `${_isThemeGame && ui.sidebarIsOpen ? 'game-border-select-language' : ''}`
    "
  >
    <div
      :class="`list-language ${_isThemeGame ? 'game game-border-select' : ''}`"
      v-if="ui.selectLanguageIsOpen"
    >
      <ul v-if="_isThemeGame">
        <li
          :key="listLanguages[0].code"
          @click="selectLanguage(listLanguages[0])"
          :class="{ active: listLanguages[0].code === languageSelected }"
        >
          {{ listLanguages[0].language }}
        </li>
      </ul>
      <ul v-else>
        <li
          v-for="item in listLanguages"
          :key="item.code"
          @click="selectLanguage(item)"
          :class="{ active: item.code === languageSelected }"
        >
          {{ item.language }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { allLanguages } from '@/config/language.ts';
import { mapActions } from 'vuex';
import i18n from '@/i18n';
import Storage from '@/utils/storage';

export default {
  computed: {
    listLanguages: () => allLanguages,
    languageSelected() {
      return this.$store.state.theme.language || 'en-US';
    }
  },
  methods: {
    ...mapActions(['toggleSelectLanguage', 'hideSelectLanguage']),

    selectLanguage(item) {
      this.$store.dispatch('theme/setLanguage', item.code);
      this.hideSelectLanguage();
      i18n.locale = Storage.getLanguage();
    }
  },

  created() {
    window.addEventListener('click', e => {
      if (!this.$el.contains(e.target)) {
        this.hideSelectLanguage();
      }
    });
  }
};
</script>
<style scoped lang="scss">
.btn-select-language {
  font-size: 14px;
  border-radius: 100px;
  outline: none;
  color: var(--color-icon-social);
  padding: 11px 9px;
  font-family: $font-bold;
  display: flex;
  cursor: pointer;
  min-width: 37px;
  justify-content: center;
  box-shadow: 0 2px 10px var(--border-shadow-search);
  background: none;
  border: 1px solid $text-white;

  &:hover {
    background-color: $text-white;
    border: 1px solid $text-white;
    color: $color-primary;
  }

  span {
    line-height: 1;
  }
  .icon-down-language {
    transition: transform 0.4s;
    line-height: 1;
  }
}

.btn-select-language.game {
  font-family: $font-forward;
  font-size: 12px;
  border: 0 !important;
  background-color: inherit;
  padding: 5px !important;
  box-shadow: none !important;
}

.btn-select-language.show_sidebar.game {
  margin-bottom: 10px;
  padding: 0 !important;
}

.btn-select-language.show {
  .icon-down-language {
    transform: rotate(-180deg);
    transition: transform 0.4s;
  }
}

.select-language {
  position: relative;
}

.list-language {
  position: absolute;
  left: 30%;
  bottom: 40px;
  width: 120px;
  max-height: 330px;
  overflow: auto;
  box-shadow: 1px 1px 15px 0 rgb(0 0 0 / 20%);
  border: 1px solid rgba(232, 232, 232, 0.1);
  border-radius: 10px;
  background-color: var(--bg-child);
  padding: 10px 0;
  z-index: 2;
}

.list-language.game {
  ul li {
    font-family: $font-forward;
    font-size: 10px;
  }
}

.game-border-select {
  border-radius: 0 !important;
}

.game-border-select-language {
  .btn-select-language {
    font-size: 10px;
  }
}

ul li {
  list-style-type: none;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 14px;
  font-family: $font-weight-semibold;
  color: var(--pool-text-color);
  text-align: center;
}

li:hover,
li.active {
  color: $color-primary;
}

ul {
  padding: 0;
  margin: 0;
}
</style>
