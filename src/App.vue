<template>
  <v-app id="page-top">
    <app-nav :sections="sections"></app-nav>
    <app-drawer :sections="sections"></app-drawer>

    <breadcrumb></breadcrumb>
    <div v-if="!loading">
      <v-content
        id="content-top"
        aria-live="polite"
        style="background: #fafafa; min-height: 68vh"
      >
        <transition name="fade" mode="out-in">
          <router-view v-if="$store.getters.isApiReady"></router-view>
          <div v-else>
             <v-alert
              type="warning"
              class="text-center"
              v-if="env === 'development'"
            >
              You're running in <strong>development</strong> mode.<br />Be sure
              the Netlify 'Status' function is running.&nbsp;&nbsp;
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
           
          </div>
        </transition>
      </v-content>

      <app-footer :sections="sections"></app-footer>
    </div>
    <div v-if="loading">
      <v-container>
        <v-layout wrap>
          <v-flex class="text-center">
            <!-- <img
              src="/icjia-logo.png"
              alt="Illinois Criminal Justice Information Authority"
              style="margin-top: 150px;"
            /> -->
            <!-- <h1 class="lato heavy" style="margin-top: 150px;">
              Adult Redeploy Illinois
            </h1> -->
            <div style="margin-top: 150px;">
              <loader></loader>
            </div>
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

      this.sections = await getSections();
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
