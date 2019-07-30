<template>
  <v-app id="page-top">
    <div v-if="!loading">
      <app-nav :sections="sectionsTest"></app-nav>
      <app-drawer :sections="sectionsTest"></app-drawer>

      <breadcrumb></breadcrumb>
      <v-content
        id="content-top"
        aria-live="polite"
        style="background: #fafafa; min-height: 68vh"
      >
        <transition name="fade" mode="out-in">
          <router-view></router-view>
        </transition>
      </v-content>
      <app-footer :sections="sectionsTest"></app-footer>
    </div>
    <div v-else>
      <v-container>
        <v-layout wrap>
          <v-flex class="text-center">
            <img
              src="/icjia-logo.png"
              alt="Illinois Criminal Justice Information Authority"
            />
            <h1>Adult Redeploy Illinois</h1>
            <loader></loader>
          </v-flex>
        </v-layout>
      </v-container>
    </div>
  </v-app>
</template>

<script>
import AppNav from "@/components/AppNav";
import AppDrawer from "@/components/AppDrawer";
import AppFooter from "@/components/AppFooter";
import Breadcrumb from "@/components/Breadcrumb";
import Loader from "@/components/Loader";
import { getSections } from "@/services/Content";
export default {
  name: "App",
  components: {
    AppNav,
    AppDrawer,
    AppFooter,
    Breadcrumb,
    Loader
  },
  methods: {},
  async mounted() {},
  async created() {
    this.loading = true;
    if (!this.$store.state.isAppReady) {
      this.$store.dispatch("initApp");
      const configPromise = process.BROWSER_BUILD
        ? import("@/api/config.json")
        : Promise.resolve(require("@/api/config.json"));
      let config = await configPromise;
      this.$store.dispatch("setConfig", config);
      this.sections = config.sections;

      const routesPromise = process.BROWSER_BUILD
        ? import("@/api/routes.json")
        : Promise.resolve(require("@/api/routes.json"));
      let routes = await routesPromise;
      this.$store.dispatch("setRoutes", routes);

      const searchIndexPromise = process.BROWSER_BUILD
        ? import("@/api/searchIndex.json")
        : Promise.resolve(require("@/api/searchIndex.json"));
      let searchIndex = await searchIndexPromise;
      this.$store.dispatch("setSearchIndex", searchIndex);

      console.log("Debug: ", this.$store.getters.debug);

      this.sectionsTest = await getSections();
      this.$store.dispatch("setSections", this.sectionsTest);

      this.loading = false;
    }
  },
  data() {
    return {
      sections: [],
      loading: true,
      test: []
    };
  }
};
</script>
<style></style>
