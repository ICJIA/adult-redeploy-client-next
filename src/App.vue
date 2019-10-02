<template>
  <v-app id="page-top">
    <app-nav :sections="sections"></app-nav>
    <app-drawer :sections="sections"></app-drawer>

    <breadcrumb></breadcrumb>
    <outdated-browser v-if="$browserDetect.isIE"></outdated-browser>
    <div v-if="!loading">
      <v-content
        id="content-top"
        aria-live="polite"
        style="background: #fafafa; min-height: 68vh"
      >
        <transition name="fade" mode="out-in">
          <router-view></router-view>
          <!-- <router-view v-if="$store.getters.isApiReady"></router-view>
          <div v-else>
            <v-alert
              type="warning"
              class="text-center mt-12"
              v-if="env === 'development'"
            >
              You're running in <strong>development</strong> mode.<br />Please
              be sure the Netlify functions are running.&nbsp;&nbsp;
            </v-alert>
            <v-alert type="error" class="text-center">
              Can't connect to the Adult Redeploy Illinois
              database.&nbsp;&nbsp;<br />
              <div class="mt-3">
                <a href="/" style="color: #fff;"
                  ><strong>Please reload and try again.</strong></a
                >
              </div>
            </v-alert>
          </div> -->
        </transition>
      </v-content>

      <app-footer :sections="sections"></app-footer>
    </div>
    <div v-if="loading">
      <v-container>
        <v-row>
          <v-col class="text-center">
            <div style="margin-top: 150px;">
              <loader></loader>
            </div>
          </v-col>
        </v-row>
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
import OutdatedBrowser from "@/components/OutdatedBrowser";
import { getAllSections } from "@/services/Content";
export default {
  name: "App",
  components: {
    AppNav,
    AppDrawer,
    AppFooter,
    Breadcrumb,
    Loader,
    OutdatedBrowser
  },
  methods: {},
  async mounted() {},
  async created() {
    this.loading = true;

    if (!this.$store.state.isAppReady) {
      const configPromise = process.BROWSER_BUILD
        ? import("@/config.json")
        : Promise.resolve(require("@/config.json"));
      let config = await configPromise;
      this.$store.dispatch("setConfig", config);
      this.sections = config.sections;
      console.log("Debug: ", this.$store.getters.debug);
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

      this.sections = await getAllSections();
      this.$store.dispatch("setSections", this.sections);

      await this.$store.dispatch("setApiStatus");

      this.$store.dispatch("initApp");
      this.loading = false;
    }
  },
  data() {
    return {
      sections: [],
      loading: true,
      test: [],
      env: process.env.NODE_ENV
    };
  }
};
</script>
<style></style>
