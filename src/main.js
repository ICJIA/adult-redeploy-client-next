import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "@/plugins/vuetify";
import "@/filters";
import "@/css/app.css";

import browserDetect from "vue-browser-detect-plugin";
Vue.use(browserDetect);

import VueMeta from "vue-meta";
Vue.use(VueMeta, {
  // optional pluginOptions
  refreshOnceOnNavigation: true,
});

// vue-analytics removed — using Plausible instead.
// Provide a no-op $ga stub so existing $ga.event()/$ga.page() calls don't throw.
Vue.prototype.$ga = {
  event() {},
  page() {},
};

import VueRouterBackButton from "vue-router-back-button";
Vue.use(VueRouterBackButton, { router });

Vue.config.productionTip = false;
// eslint-disable-next-line no-undef
NProgress.configure({ showSpinner: false });

new Vue({
  router,
  store,
  // created() {
  //   AOS.init();
  // },
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
