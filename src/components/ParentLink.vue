<template>
  <div :class="isShowChild && ui.sidebarIsOpen ? 'show' : ''">
    <div
      :class="
        `item-menu parent ${active ? 'active' : ''}  
        ${_isThemeGame ? 'game' : ''}`
      "
      @click="toggleChild"
    >
      <div class="d-flex align-center">
        <div class="icon-link-menu">
          <img
            v-if="_isThemeGame"
            :src="`/images/games/${icon}.png`"
            class="icon-game-sidebar"
          />
          <img v-else :src="`/images/${icon}.svg`" />
        </div>
        <span> {{ $t(label) }} </span>
      </div>
    </div>

    <ul
      :class="
        `list-child-${child.length} ${active ? 'parentActive' : ''} ${
          _isThemeGame ? 'game' : ''
        }`
      "
    >
      <li v-for="item in child" :key="item.name" @click="changeRouter(item)">
        <ItemLink
          :name="item.name"
          :label="item.label"
          :icon="item.icon"
          :labelParent="label"
        />
      </li>
    </ul>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  props: ['child', 'label', 'icon'],
  data() {
    return {
      isShowChild: true,
      active: false
    };
  },

  methods: {
    ...mapActions(['toggleSidebar', 'hideSidebar']),
    changeRouter(item) {
      if (this._isMobile && this.$router.currentRoute.name === item.name) {
        this.hideSidebar();
      }
    },
    toggleChild() {
      if (!this.ui.sidebarIsOpen) {
        this.toggleSidebar();
      }
    },

    showChild() {
      if (this.child && this.child.length) {
        return true;
      }
      return false;
    },

    showActive() {
      console.log(this.$router.currentRoute.path);
      console.log(this.label);
      if (this.child && this.child.length) {
        const childName = this.child.map(item => item.name);
        const checkActiveRouter = item =>
          item === this.$router.currentRoute.name;
        return (
          childName.some(checkActiveRouter) ||
          this.$router.currentRoute.path.includes(this.label)
        );
      } else if (this.$router.currentRoute.path.includes(this.label)) {
        return true;
      }
      return false;
    }
  },

  watch: {
    $route() {
      this.active = this.showActive();
    }
  },

  created() {
    this.isShowChild = this.showChild();
    this.active = this.showActive();
    // console.log(this.isShowChild);
  }
};
</script>

<style scoped lang="scss">
.item-menu {
  padding: 15px 0;
  color: $text-white;
  font-family: $font-weight-semibold;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;

  &:hover {
    color: $sidebar-text-horver-color;
  }
  @media only screen and (max-width: 768px) {
    &:hover {
      color: $text-white;
    }
  }

  .icon-link-menu {
    min-width: 65px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .icon-drop {
    margin-right: 20px;
    color: $bg-white-opacity;
    transition: transform 0.4s;
  }

  .icon-drop.game {
    margin-right: 0 !important;
  }

  .icon-drop.show {
    color: $bg-white;
    transform: rotate(-180deg);
    transition: transform 0.4s;
  }
}

.item-menu.parent {
  height: 42px;
}

.show {
  .item-menu.parent {
    pointer-events: none !important;
    .game {
      background-color: #444444;
    }
  }
}

.item-menu.game {
  font-family: $font-forward;
  font-size: 12px;
  height: 50px !important;
}

.item-menu.parent.active {
  position: relative;
  background-color: $color-primary;
  &:before {
    content: '';
    height: 100%;
    width: 4px;
    position: absolute;
    left: 0;
    top: 0;
    background-color: white;
  }
}

.item-menu.parent.active.game {
  background-color: #444444;
}

ul {
  height: 0;
  overflow: hidden;
  transition: height 0.3s;
}

.show {
  @for $i from 1 through 10 {
    $heightChild: $i * 45px;
    $heightChildGame: $i * 50px;
    .list-child-#{$i} {
      height: $heightChild;
      // background-color: $sidebar-select-color;
    }
    .list-child-#{$i}.game {
      height: $heightChildGame;
      background-color: #444444;
    }
  }
}

.parentActive {
  background-color: $sidebar-select-color;
}

ul li {
  list-style-type: none;
  cursor: pointer;

  .link-menu {
    height: 45px;
    display: flex !important;
    font-size: 14px !important;
    padding-left: 65px !important;
    color: $sidebar-text-horver-color;

    &:hover {
      color: $text-white !important;
    }
  }
}

.icon-game-sidebar {
  height: 35px;
  width: 35px;
}
</style>
