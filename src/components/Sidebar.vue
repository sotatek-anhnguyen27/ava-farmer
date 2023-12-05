<template>
  <div
    id="sidebar"
    class="d-flex flex-column bottom-0 top-0  animate"
    :class="
      `${ui.sidebarIsOpen ? 'is-open' : 'is-closed'} ${
        _isThemeGame ? 'game-border-sidebar' : ''
      }`
    "
  >
    <nav class="d-flex flex-column height-full">
      <div class="flex-auto content-sidebar pt-3">
        <div
          v-if="!_isThemeGame & !_isMobile"
          class="flex-auto d-flex flex-items-center pl-4 mb-4"
        >
          <a class="d-block mr-4 icon-toggle" @click="handleToggleSidebar">
            <Icon v-if="ui.sidebarIsOpen" name="menu-left" size="16" />
            <Icon v-else name="menu-left-close" size="16" />
          </a>
          <router-link :to="{ name: 'tradeTokens' }" class="text-blue d-flex">
            <img
              src="~/@/assets/icon/logo-topnav-light.svg"
              class="mr-2 v-align-middle hidden"
            />
          </router-link>
        </div>
        <div v-for="item in menu" :key="item.name" class="item-menu">
          <div @click="changeRouter(item)">
            <ItemLink
              :name="item.name"
              :label="item.label"
              :icon="item.icon"
              :linkSingle="true"
            />
          </div>
        </div>
      </div>
      <div class="footer-slidebar">
        <FooterSideBar />
      </div>
    </nav>
  </div>
</template>

<script>
import pkg from '@/../package.json';
import { mapActions } from 'vuex';

const commitSha = process.env.VUE_APP_COMMIT_SHA;

export default {
  data() {
    return {
      modalOpen: false,
      pkg,
      commitSha,
      menu: [
        {
          label: 'Avax Farms',
          icon: 'trees',
          name: 'hero_arena_farms'
        }
      ]
    };
  },
  methods: {
    ...mapActions(['hideSidebar', 'toggleSidebar', 'hideSelectLanguage']),
    changeRouter(item) {
      if (this._isMobile && this.$router.currentRoute.name === item.name) {
        this.hideSidebar();
      }
    },
    handleToggleSidebar() {
      this.toggleSidebar();

      if (!this.ui.sidebarIsOpen) {
        this.hideSelectLanguage();
      }
    }
  }
};
</script>

<style lang="scss">
#sidebar {
  position: fixed;
  background: $sidebar-bg-color;
  width: 65px;
  left: 0;
  box-shadow: 3px 0 6px rgba(0, 0, 0, 0.15);
  transition: 0.4s;
  border-top-right-radius: 30px;
  z-index: 6;
  ul > li > a {
    font-size: 16px;
    display: block;
    padding: 10px 20px 12px;

    &.active {
      color: $primary-button-text;
    }
  }

  .btn-switch-theme {
    display: none;
  }
  .icon-toggle {
    color: $text-white;
  }

  @media only screen and (max-width: $width-md) {
    left: -264px;
    margin-top: 70px;
    border-radius: 0 !important;

    .btn-switch-theme {
      display: block;
      margin: 15px 0;
    }
  }

  .footer-slidebar {
    padding-top: 10px;
  }

  .content-sidebar {
    overflow-y: auto;
    overflow-x: hidden;

    @media only screen and (max-width: 768px) {
      padding-top: 0 !important;
    }
  }
}

.game-border-sidebar {
  border-top-right-radius: 0 !important;
  background: #444444 !important;
  margin-top: 79px !important;
  width: 62px !important;
}

.game-border-sidebar.is-open {
  width: 190px !important;
}

#sidebar.is-open {
  width: 190px;
  transition: width 0.4s;

  @media only screen and (max-width: $width-xl) {
    left: 0;
    transition: 0.4s;
  }
}
</style>

<style scoped lang="scss">
.link-menu {
  padding: 15px 0;
  color: $text-white;
  font-family: $font-weight-semibold;
  font-size: 16px;
  display: flex;
  align-items: center;
  height: 42px;

  &:hover {
    color: $sidebar-text-horver-color;
  }

  img {
    margin: 0 auto;
  }

  .icon-link-menu {
    display: flex;
    min-width: 65px;
  }
}

.link-menu.active,
.link-menu.current {
  color: $text-white;
  position: relative;
  background-color: #f47820;
}

.link-menu.active.game,
.link-menu.current.game {
  background-color: #444444;
}

.link-menu.active {
  &:before {
    content: '';
    height: 100%;
    width: 4px;
    position: absolute;
    left: 0;
    top: 0;
    background-color: $text-white;
  }
}

.link-menu.game {
  height: 50px !important;
}

.icon-game-sidebar {
  height: 35px;
  width: 35px;
}

.game {
  font-size: 12px;
}

.router-link-active {
  color: $text-white !important;
}
</style>
