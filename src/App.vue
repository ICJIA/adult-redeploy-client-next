<template>
  <v-app id="page-top">
    <app-nav :links="links"></app-nav>
    <app-drawer :links="links"></app-drawer>
    <breadcrumb></breadcrumb>
    <v-content id="content-top" aria-live="polite" style="background: #fafafa">
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
    }
  },
  data() {
    return {
      links: [
        { name: "Home", url: "/", displayNav: false, displayFooter: true },
        {
          name: "About",
          url: "/about",
          displayNav: true,
          displayFooter: true,
          displayDrawer: true,
          subMenu: [
            { name: "Overview", url: "/overview" },
            { name: "Oversight Board", url: "/board" },
            { name: "Staff", url: "/staff" },
            { name: "Meeting Materials", url: "/meetings" },
            { name: "Media", url: "/media" },
            { name: "FAQs", url: "/faqs" }
          ]
        },

        {
          name: "Approach",
          url: "/approach",
          displayNav: true,
          displayFooter: true,
          displayDrawer: true,
          subMenu: [
            { name: "Local control", url: "/local-control" },
            { name: "Evidence-based Practicies", url: "/ebs" },
            {
              name: "Performance Measurement",
              url: "/performance-measurement"
            },
            { name: "Evaluation", url: "/evaluation" }
          ]
        },
        {
          name: "Programs",
          url: "/programs",
          displayNav: true,
          displayFooter: true,
          displayDrawer: true,
          subMenu: [
            { name: "Local programs", url: "/local-programs" },
            { name: "Training", url: "/training" },
            {
              name: "All-Sites Summits",
              url: "/summits"
            }
          ]
        },
        {
          name: "Grants",
          url: "/grants",
          displayNav: true,
          displayFooter: true,
          displayDrawer: true,
          subMenu: [
            { name: "Explore", url: "/explore" },
            { name: "Apply", url: "/apply" },
            {
              name: "Implement",
              url: "/implement"
            }
          ]
        },
        {
          name: "News",
          url: "/news",
          displayNav: true,
          displayFooter: true,
          displayDrawer: true
        },

        {
          name: "Resources",
          url: "/resources",
          displayNav: true,
          displayFooter: true,
          displayDrawer: true,
          subMenu: [
            { name: "Annual Reports", url: "/annual-reports" },
            { name: "Templates", url: "/templates" },
            {
              name: "Toolkits",
              url: "/toolkits"
            },
            {
              name: "Webinars",
              url: "/webinars"
            }
          ]
        },

        {
          name: "Search",
          url: "/search",
          displayNav: true,
          displayFooter: true,
          displayDrawer: true
        },
        {
          name: "ICJIA",
          url: "/icjia",
          displayNav: false,
          displayFooter: true,
          displayDrawer: false
        }
      ]
    };
  }
};
</script>
<style></style>
