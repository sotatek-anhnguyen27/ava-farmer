import Vue from 'vue';
import Vuex from 'vuex';
import modules from '@/store/modules';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules,
  strict: process.env.NODE_ENV !== 'production'
});

// store.subscribeAction((action, state) => {
//   if (action.type && action.payload) {
//     console.log(`Action ${action.type}`, action.payload);
//     try {
//       Vue.prototype.$mixpanel.track(`Action ${action.type}`, {
//         payload: action.payload
//       });
//     } catch (e) {
//       console.log(e);
//     }
//   }
// });

// store.subscribe((mutation, state) => {
//   if (mutation.type === 'GET_BLOCK_SUCCESS') {
//     return;
//   }
//   try {
//     Vue.prototype.$mixpanel.track(`Mutation ${mutation.type}`, {
//       payload: mutation.payload
//     });
//   } catch (e) {
//     console.log(e);
//   }
// });

export default store;
