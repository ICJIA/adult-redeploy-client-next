import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: `https://${process.env.BASE_URL}`,
  // eslint-disable-next-line no-unused-vars
  scrollBehavior(to, from, savedPosition) {
    return { x: 0, y: 0 };
  },
  routes: [
    /**
     *
     * Home
     *
     */
    {
      path: "/",
      name: "home",
      component: Home,
      meta: {
        hideBreadcrumb: true
      }
    },
    { path: "/home", redirect: { name: "home" } },
    /**
     *
     * Local Programs / Illinois Map / Sites
     *
     */
    {
      path: "/programs/local-programs",
      name: "localPrograms",
      component: () =>
        import(/* webpackChunkName: "programs" */ "./views/LocalPrograms.vue")
    },
    {
      path: "/sites",
      name: "siteDescriptions",
      component: () =>
        import(/* webpackChunkName: "sites" */ "./views/SiteDescriptions.vue")
    },
    {
      path: "/sites/:slug",
      name: "siteDescriptionSingle",
      component: () =>
        import(/* webpackChunkName: "sites" */ "./views/SiteDescriptionSingle.vue")
    },

    /**
     *
     * Archives
     *
     */

    {
      path: "/archives/meeting-archives",
      name: "meetingsArchive",
      component: () =>
        import(/* webpackChunkName: "meetings" */ "./views/MeetingsArchive.vue")
    },

    /**
     *
     * News
     *
     */
    {
      path: "/news/:slug",
      name: "newsSingle",
      component: () =>
        import(/* webpackChunkName: "news" */ "./views/NewsSingle.vue")
    },

    {
      path: "/news",
      name: "news",
      component: () => import(/* webpackChunkName: "news" */ "./views/News.vue")
    },

    /**
     *
     * Biographies
     *
     */

    {
      path: "/about/oversight",
      name: "oversightBoard",
      component: () =>
        import(/* webpackChunkName: "biographies" */ "./views/Oversight.vue")
    },
    {
      path: "/about/staff",
      name: "stafff",
      component: () =>
        import(/* webpackChunkName: "biographies" */ "./views/Staff.vue")
    },
    {
      path: "/about/biographies/:slug",
      name: "biographiesSingle",
      component: () =>
        import(/* webpackChunkName: "biographies" */ "./views/BiographiesSingle.vue")
    },
    /**
     *
     * Meetings
     *
     */
    {
      path: "/about/meetings",
      name: "meetings",
      component: () =>
        import(/* webpackChunkName: "meetings" */ "./views/Meetings.vue")
    },
    {
      path: "/about/meetings/:category/:slug",
      name: "meetingsSingle",
      component: () =>
        import(/* webpackChunkName: "meetings" */ "./views/MeetingsSingle.vue")
    },
    // {
    //   path: "/about/meetings/:category",
    //   name: "meetingsCategory",
    //   component: () =>
    //     import(/* webpackChunkName: "meetings" */ "./views/MeetingsCategory.vue")
    // },

    /**
     *
     * Tags
     *
     */

    {
      path: "/tags/:slug",
      name: "tagsSingle",

      component: () =>
        import(/* webpackChunkName: "tags" */ "./views/TagsSingle.vue")
    },

    /**
     *
     * Resources
     *
     */

    {
      path: "/resources",
      name: "resources",

      component: () =>
        import(/* webpackChunkName: "resources" */ "./views/Resources.vue")
    },
    {
      path: "/resources/:category",
      name: "resourcesByCategory",

      component: () =>
        import(/* webpackChunkName: "resources" */ "./views/ResourcesByCategory.vue")
    },
    {
      path: "/resources/:category/:slug",
      name: "resourcesSingle",

      component: () =>
        import(/* webpackChunkName: "resources" */ "./views/ResourcesSingle.vue")
    },

    /**
     *
     * Error
     *
     */

    {
      path: "/error",
      name: "error",
      component: () =>
        import(/* webpackChunkName: "error" */ "./views/Error.vue")
    },
    /**
     *
     * Sandbox
     *
     */

    {
      path: "/sandbox",
      name: "sandbox",
      component: () =>
        import(/* webpackChunkName: "sandbox" */ "./views/Sandbox.vue")
    },
    /**
     *
     * Search
     *
     */
    {
      path: "/search",
      name: "search",
      component: () =>
        import(/* webpackChunkName: "search" */ "./views/Search.vue")
    },
    /**
     *
     * Sections/Page
     *
     */

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
    /**
     *
     * Catch-all
     *
     */

    {
      path: "*",
      name: "redirect",
      component: () =>
        import(/* webpackChunkName: "error" */ "./views/Error.vue")
    }
  ]
});
