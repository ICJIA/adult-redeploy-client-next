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
      path: "/programs",
      name: "programs",
      component: () =>
        import(/* webpackChunkName: "programs" */ "./views/Programs.vue")
    },
    {
      path: "/news/:slug",
      name: "newsItem",
      component: () =>
        import(/* webpackChunkName: "news" */ "./views/NewsItem.vue")
    },

    {
      path: "/error",
      name: "error",
      component: () =>
        import(/* webpackChunkName: "error" */ "./views/Error.vue")
    },
    {
      path: "/:slug",
      name: "page",
      component: () => import(/* webpackChunkName: "page" */ "./views/Page.vue")
    },
    {
      path: "*",
      name: "redirect",
      component: () =>
        import(/* webpackChunkName: "error" */ "./views/Error.vue")
    }
  ]
});
