<template>
  <v-app id="page-top">
    <a href="#content-top" class="skip-link">Skip to main content</a>
    <app-nav :sections="sections"></app-nav>

    <app-drawer :sections="sections"></app-drawer>

    <!-- <outdated-browser v-if="$browserDetect.isIE"></outdated-browser> -->

    <div v-if="!loading">
      <div aria-live="polite" aria-atomic="true" class="sr-only" role="status">
        {{ routeAnnouncement }}
      </div>
      <v-content
        id="content-top"
        role="main"
        tabindex="-1"
        style="background: #fafafa; min-height: 75vh; outline: none"
      >
        <transition name="fade" mode="out-in">
          <router-view style="min-height: 75vh !important"></router-view>
        </transition>
      </v-content>

      <app-footer :sections="sections"></app-footer>
    </div>
    <div v-if="loading">
      <v-container>
        <v-row>
          <v-col class="text-center">
            <div style="margin-top: 150px">
              <loader></loader>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </v-app>
</template>

<script>
import { EventBus } from "@/event-bus";
import AppNav from "@/components/AppNav";
import AppDrawer from "@/components/AppDrawer";
import AppFooter from "@/components/AppFooter";

import Loader from "@/components/Loader";

import {
  getAllSections,
  getAppCount,
  getArticleCount,
} from "@/services/Content";
export default {
  name: "App",
  metaInfo() {
    return {
      // if no subcomponents specify a metaInfo.title, this title will be used
      title: "Adult Redeploy Illinois",
      // all titles will be injected into this template
      titleTemplate: "ARI | %s",
      htmlAttrs: {
        lang: "en",
      },
      link: [{ vmid: "canonical", rel: "canonical", href: this.canonical }],
      meta: [
        { charset: "utf-8" },
        {
          vmid: "robots",
          name: "robots",
          content: "index, follow",
        },
        {
          vmid: "description",
          name: "description",
          content:
            "Adult Redeploy Illinois was established by the Crime Reduction Act (Public Act 96-0761) to provide financial incentives to local jurisdictions for programs that allow diversion of individuals from state prisons by providing community-based services.",
        },
      ],
    };
  },
  components: {
    AppNav,
    AppDrawer,
    AppFooter,

    Loader,
  },
  computed: {
    canonical() {
      return "https://icjia.illinois.gov/adultredeploy" + this.$route.path;
    },
  },
  methods: {
    focusMainContent() {
      this.$nextTick(() => {
        const main = document.getElementById("content-top");
        if (main) main.focus();
      });
    },
  },
  watch: {
    // eslint-disable-next-line no-unused-vars
    $route(to, from) {
      if (this.$refs.alert) this.$refs.alert.reset();
      // Announce route change to screen readers
      const title =
        to.meta && to.meta.title
          ? to.meta.title
          : document.title || "Page loaded";
      this.routeAnnouncement = "";
      this.$nextTick(() => {
        this.routeAnnouncement = "Navigated to " + title;
      });
      // Move focus to main content
      this.focusMainContent();
    },
  },
  async mounted() {
    EventBus.$on("showWarning", (bool) => (this.showWarning = bool));
  },
  async created() {
    this.loading = true;

    if (!this.$store.state.isAppReady) {
      const configPromise = process.BROWSER_BUILD
        ? import("@/config.json")
        : Promise.resolve(require("@/config.json"));
      let config = await configPromise;
      this.$store.dispatch("setConfig", config);
      this.sections = config.sections;
      // const routesPromise = process.BROWSER_BUILD
      //   ? import("@/api/routes.json")
      //   : Promise.resolve(require("@/api/routes.json"));
      // let routes = await routesPromise;
      // this.$store.dispatch("setRoutes", routes);

      const searchIndexPromise = process.BROWSER_BUILD
        ? import("@/api/searchIndex.json")
        : Promise.resolve(require("@/api/searchIndex.json"));
      let searchIndex = await searchIndexPromise;
      this.$store.dispatch("setSearchIndex", searchIndex);

      this.sections = await getAllSections();
      this.$store.dispatch("setSections", this.sections);

      await this.$store.dispatch("setApiStatus");

      this.appCount = await getAppCount();
      this.$store.dispatch("setAppCount", this.appCount);

      this.articleCount = await getArticleCount();
      this.$store.dispatch("setArticleCount", this.articleCount);

      this.$store.dispatch("initApp");
      this.loading = false;
    }
  },
  data() {
    return {
      sections: [],
      loading: true,
      test: [],
      env: process.env.NODE_ENV,
      appCount: null,
      showWarning: true,
      routeAnnouncement: "",
    };
  },
};
</script>
