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

    { path: "/home", redirect: { name: "home" } },
    {
      path: "/local-programs",
      name: "programs",
      component: () =>
        import(/* webpackChunkName: "programs" */ "./views/LocalPrograms.vue")
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
      path: "/sandbox",
      name: "sandbox",
      component: () =>
        import(/* webpackChunkName: "error" */ "./views/Sandbox.vue")
    },
    {
      path: "/search",
      name: "search",
      component: () =>
        import(/* webpackChunkName: "search" */ "./views/Search.vue")
    },
    {
      path: "/news",
      name: "news",
      component: () => import(/* webpackChunkName: "news" */ "./views/News.vue")
    },
    {
      path: "/:section",
      name: "section",
      component: () =>
        import(/* webpackChunkName: "section" */ "./views/Section.vue")
    },

    {
      path: "/:section/:slug",
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
