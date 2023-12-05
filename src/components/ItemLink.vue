<template>
  <router-link
    :to="{ name: name }"
    :class="
      `${active && linkSingle ? 'active' : ''} ${active ? 'current' : ''} ${
        _isThemeGame ? 'game' : ''
      }`
    "
    class="link-menu"
  >
    <div v-if="icon" class="icon-link-menu">
      <img
        v-if="_isThemeGame"
        :src="`/images/games/${icon}.png`"
        class="icon-game-sidebar"
      />
      <img v-else :src="`/images/${icon}.svg`" />
    </div>
    <span :class="_isThemeGame ? 'game' : ''"> {{ $t(label) }} </span>
  </router-link>
</template>

<script>
export default {
  props: ['name', 'label', 'icon', 'linkSingle', 'labelParent'],
  data() {
    return {
      active: false
    };
  },
  methods: {
    checkIsActive() {
      const { name, path } = this.$router.currentRoute;
      return (
        name === this.name || name.includes(this.label) ||
        (this.labelParent &&
          path.includes(this.label) &&
          path.includes(this.labelParent))
      );
    }
  },
  watch: {
    $route() {
      this.active = this.checkIsActive();
    }
  },
  created() {
    this.active = this.checkIsActive();
  }
};
</script>

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
