<template>
  <v-app-bar color="white" class="mt-12" height="80">
    <v-app-bar-nav-icon
      @click="toggleDrawer"
      class="hidden-md-and-up"
    ></v-app-bar-nav-icon>

    <div style="width: 15px"></div>

    <img
      src="/icjia-logo.png"
      alt="Illinois Criminal Justice Information Authority"
      height="50"
      style="margin-left: -15px"
    />&nbsp;&nbsp;&nbsp;&nbsp;
    <v-toolbar-title class="heavy hover" @click="$router.push('/')"
      ><span style="color: #555; font-size: 22px"
        >ADULT REDEPLOY ILLINOIS</span
      ></v-toolbar-title
    >

    <div class="flex-grow-1"></div>

    <v-toolbar-items class="hidden-sm-and-down">
      <span v-for="link in links" :key="link.name" class="flexitem">
        <span v-if="link.displayNav">
          <v-menu offset-y left eager style="background: yellow">
            <template v-slot:activator="{ on }">
              <v-btn
                depressed
                style="height: 99%; margin-bottom: 1px; margin-top: 0px; font-size: 14px;"
                class="heavy white "
                v-on="on"
              >
                {{ link.name
                }}<v-icon right small v-if="link.subMenu"
                  >arrow_drop_down</v-icon
                >
              </v-btn>
            </template>

            <v-list nav dense v-if="link.subMenu">
              <v-list-item-group v-model="item" color="primary">
                <v-list-item v-for="(subItem, i) in link.subMenu" :key="i">
                  <v-list-item-content @click="$router.push(subItem.url)">
                    <v-list-item-title
                      v-text="subItem.name"
                    ></v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-menu>
        </span>
      </span>
    </v-toolbar-items>
  </v-app-bar>
</template>

<script>
import { EventBus } from "@/event-bus";
export default {
  data() {
    return {
      items: [
        { text: "My Files", icon: "mdi-folder" },
        { text: "Shared with me", icon: "mdi-account-multiple" },
        { text: "Starred", icon: "mdi-star" },
        { text: "Recent", icon: "mdi-history" },
        { text: "Offline", icon: "mdi-check-circle" },
        { text: "Uploads", icon: "mdi-upload" },
        { text: "Backups", icon: "mdi-cloud-upload" }
      ],
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
          displayDrawer: true
        },
        {
          name: "Grants",
          url: "/grants",
          displayNav: true,
          displayFooter: true,
          displayDrawer: true
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
          displayDrawer: true
        },

        {
          name: "Search",
          url: "/search",
          displayNav: false,
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
  },
  methods: {
    toggleDrawer() {
      EventBus.$emit("toggleDrawer");
    }
  }
};
</script>

<style>
.theme--light.v-list {
  background: white !important;
}
</style>
