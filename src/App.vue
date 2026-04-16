<template>
  <v-app id="page-top">
    <header>
      <a href="#content-top" class="skip-link">Skip to main content</a>
      <app-nav :sections="sections"></app-nav>
    </header>

    <app-drawer :sections="sections"></app-drawer>

    <v-content
      id="content-top"
      tabindex="-1"
      style="background: #fafafa; min-height: 75vh; outline: none"
    >
      <div
        aria-live="polite"
        aria-atomic="true"
        class="visually-hidden"
        role="status"
      >
        {{ routeAnnouncement }}
      </div>
      <transition name="fade" mode="out-in">
        <router-view style="min-height: 75vh !important"></router-view>
      </transition>
    </v-content>

    <app-footer :sections="sections"></app-footer>
  </v-app>
</template>

<script>
import { EventBus } from "@/event-bus";
import AppNav from "@/components/AppNav";
import AppDrawer from "@/components/AppDrawer";
import AppFooter from "@/components/AppFooter";

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
  created() {
    if (this.$store.state.isAppReady) return;

    const config = require("@/config.json");
    this.$store.dispatch("setConfig", config);
    const searchIndex = require("@/api/searchIndex.json");
    this.$store.dispatch("setSearchIndex", searchIndex);
    this.$store.dispatch("setApiStatus");
    this.$store.dispatch("initApp");

    getAllSections()
      .then((sections) => {
        this.sections = sections;
        this.$store.dispatch("setSections", sections);
      })
      .catch(() => {});

    getAppCount()
      .then((count) => this.$store.dispatch("setAppCount", count))
      .catch(() => {});

    getArticleCount()
      .then((count) => this.$store.dispatch("setArticleCount", count))
      .catch(() => {});
  },
  data() {
    return {
      sections: [],
      env: process.env.NODE_ENV,
      showWarning: true,
      routeAnnouncement: "",
    };
  },
};
</script>
