<template>
  <v-app id="page-top">
    <div v-if="!loading">
      <app-nav :links="links"></app-nav>
      <app-drawer :links="links"></app-drawer>
      <breadcrumb></breadcrumb>
      <v-content
        id="content-top"
        aria-live="polite"
        style="background: #fafafa"
      >
        <transition name="fade" mode="out-in">
          <router-view></router-view>
        </transition>
      </v-content>
      <app-footer :links="links"></app-footer>
    </div>
    <div v-else>
      <v-container>
        <v-layout wrap>
          <v-flex>
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
        ? import("@/config.json")
        : Promise.resolve(require("@/config.json"));
      let config = await configPromise;
      this.links = config.links;
      this.$store.dispatch("setConfig", config);
      this.loading = false;
    }
  },
  data() {
    return {
      links: [],
      loading: true
    };
  }
};
</script>
<style></style>
