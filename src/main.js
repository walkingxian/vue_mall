// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import App from './App'
import router from './router'
import VueLazyLoad from 'vue-lazyload'
import infiniteScroll from 'vue-infinite-scroll'
import { currency } from './util/currency'

import './assets/css/base.css'
import './assets/css/checkout.css'
import './assets/css/login.css'
import './assets/css/product.css'

Vue.use(Vuex);
Vue.use(infiniteScroll);
Vue.use(VueLazyLoad,{
  loading: "/static/loading-svg/loading-bubbles.svg",
  try: 3
})

Vue.filter('currency',currency);
Vue.config.productionTip = false;

//vuex
const store = new Vuex.Store({
  state: {
    nickName:'',
    cartCount:""
  },
  mutations:{
    updateUserInfo(state, nickName) {
      state.nickName = nickName;
    },
    updateCartCount(state, cartCount) {
      state.cartCount = cartCount;
    }
  }
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
