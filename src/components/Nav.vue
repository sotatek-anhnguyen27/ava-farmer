<template>
  <nav class="nav">
    <ul class="list-style-none">
      <li v-for="(item, i) in items" :key="i">
        <router-link
          :to="item.to"
          :class="{ active: item.to.name === $router.currentRoute.name }"
        >
          <span :class="`item-name ${_isThemeGame && 'game-font-size'}`">{{
            item.name
          }}</span>
          <UiCounter
            v-if="item.count > 0"
            v-text="_num(item.count)"
            class="ml-2"
            :class="{ active: item.to.name === $router.currentRoute.name }"
          />
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  props: ['items']
};
</script>

<style scoped lang="scss">
.nav {
  ul > li > a {
    font-size: 16px;
    color: $white;
    display: block;
    padding: 24px 0 0;
  }
}
.item-name {
  color: var(--tab-label-color);

  &:hover {
    color: var(--theme-mode-icon-hover);
  }
}

.game-font-size {
  font-size: 11px !important;
}

@media only screen and (max-width: 768px) {
  .router-table {
    .nav {
      ul {
        display: flex !important;
        a {
          font-size: 13px !important;
          padding: 0 7px !important;
          height: 40px !important;
        }
      }
    }
  }

  .game-font-size {
    font-size: 9px !important;
  }
}
</style>
