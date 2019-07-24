<template>
  <v-app id="page-top">
    <app-nav :links="links"></app-nav>
    <app-drawer :links="links"></app-drawer>
    <breadcrumb></breadcrumb>
    <v-content id="content-top" aria-live="polite">
      <transition name="fade" mode="out-in">
        <router-view></router-view>
      </transition>
    </v-content>
    <app-footer :links="links"></app-footer>
  </v-app>
</template>

<script>
import AppNav from "@/components/AppNav";
import AppDrawer from "@/components/AppDrawer";
import AppFooter from "@/components/AppFooter";
import Breadcrumb from "@/components/Breadcrumb";
export default {
  name: "App",
  components: {
    AppNav,
    AppDrawer,
    AppFooter,
    Breadcrumb
  },
  methods: {},
  async created() {
    if (!this.$store.state.isAppReady) {
      this.$store.dispatch("initApp");
    } else {
      console.log("isAppReady: ", this.$store.state.isAppReady);
    }
  },
  data() {
    return {
      links: [
        { name: "Home", url: "/", displayNav: false, displayFooter: true },
        { name: "Board", url: "/board", displayNav: true, displayFooter: true },
        { name: "News", url: "/news", displayNav: true, displayFooter: true },
        {
          name: "Local Programs",
          url: "/programs",
          displayNav: true,
          displayFooter: true
        },
        {
          name: "Meetings",
          url: "/meetings",
          displayNav: true,
          displayFooter: true
        },
        {
          name: "Publications",
          url: "/publications",
          displayNav: true,
          displayFooter: true
        },
        {
          name: "Contact",
          url: "/contact",
          displayNav: true,
          displayFooter: true
        },
        {
          name: "Search",
          url: "/search",
          displayNav: false,
          displayFooter: true
        }
      ]
    };
  }
};
</script>
<style></style>
