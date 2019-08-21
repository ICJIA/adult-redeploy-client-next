import "babel-polyfill";
import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import "@/filters";
import "@/css/app.css";

import browserDetect from "vue-browser-detect-plugin";
Vue.use(browserDetect);

Vue.config.productionTip = false;
// eslint-disable-next-line no-undef
NProgress.configure({ showSpinner: false });

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
