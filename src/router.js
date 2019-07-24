import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  // eslint-disable-next-line no-unused-vars
  scrollBehavior(to, from, savedPosition) {
    return { x: 0, y: 0 };
  },
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
      meta: {
        hideBreadcrumb: true
      }
    },
    {
      path: "/about",
      name: "about",

      component: () =>
        import(/* webpackChunkName: "about" */ "./views/About.vue")
    },
    {
      path: "/programs",
      name: "programs",

      component: () =>
        import(/* webpackChunkName: "programs" */ "./views/Programs.vue")
    }
  ]
});
