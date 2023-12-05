import Vue from 'vue';
// import mixpanel from '@/mixpanel';
import VueRouter, { RouteConfig } from 'vue-router';

import HeroArenaFarm from '@/views/Farms/HeroArenaFarm.vue';
Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'hero_arena_farms',
    component: HeroArenaFarm
  },
  {
    path: '/hero-arena-farms',
    name: 'hero_arena_farms',
    component: HeroArenaFarm
  },
  { path: '/*', name: 'error-404', beforeEnter: (to, from, next) => next('/') }
];

const router = new VueRouter({
  routes
});
export default router;
