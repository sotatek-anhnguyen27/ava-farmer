import Vue from 'vue';
import PortalVue from 'portal-vue';
import autofocus from 'vue-autofocus-directive';
import VueSwitch from '@vue/ui/src/components/VueSwitch.vue';
import infiniteScroll from 'vue-infinite-scroll';
import Jazzicon from 'vue-jazzicon';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import App from '@/App.vue';
import router from '@/router';
import store from '@/store';
import mixins from '@/mixins';
import i18n from '@/i18n';
import VueMeta from 'vue-meta';
import '@/style.scss';
import '@/helpers/fathom';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import BigNumber from 'bignumber.js';
import VueGtag from 'vue-gtag';
import ToggleButton from 'vue-js-toggle-button';

Vue.use(infiniteScroll);
Vue.use(PortalVue);
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
Vue.use(VueMeta, {
  refreshOnceOnNavigation: true
});
Vue.use(ToggleButton);
const requireComponent = require.context('@/components', true, /[\w-]+\.vue$/);
requireComponent.keys().forEach(fileName => {
  const componentConfig = requireComponent(fileName);
  const componentName = upperFirst(
    camelCase(fileName.replace(/^\.\//, '').replace(/\.\w+$/, ''))
  );
  Vue.component(componentName, componentConfig.default || componentConfig);
});

Vue.component('jazzicon', Jazzicon);
Vue.component('VueSwitch', VueSwitch);
Vue.mixin(mixins);
Vue.directive('autofocus', autofocus);

Vue.filter('formatAmount', function(number: string | number | BigNumber) {
  if (!number || number.toString() === '0') {
    return '-';
  }

  if (number < 1e-8) {
    return '< 0.00000001';
  }

  return new BigNumber(number).decimalPlaces(8).toString();
});

Vue.filter('formatBlock', function(number: any) {
  if (!number || number === '0') {
    return '-';
  }
  if (number._hex) {
    number = new BigNumber(number._hex).toString();
  }

  return new BigNumber(number).toFormat();
});

Vue.config.productionTip = false;

// require('./sentry');

if (process.env.VUE_APP_GOOGLE_TRACKING_ID) {
  console.log('====Setup google analytic===');
  Vue.use(
    VueGtag,
    {
      config: { id: process.env.VUE_APP_GOOGLE_TRACKING_ID }
    },
    router
  );
}

new Vue({
  i18n,
  router,
  store,
  render: h => h(App),
  mounted() {
    if (
      process.env.VUE_APP_BASE_URL &&
      process.env.VUE_APP_GOOGLE_TRACKING_ID
    ) {
      console.log(`====Setup cross-domain: ${process.env.VUE_APP_BASE_URL}===`);
      this.$gtag.linker({
        domains: [`${process.env.VUE_APP_BASE_URL}`]
      });
    }
  }
}).$mount('#app');
