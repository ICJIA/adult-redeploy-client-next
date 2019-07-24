<template>
  <v-app-bar fixed color="white">
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
      ><span style="color: #555">ADULT REDEPLOY ILLINOIS</span></v-toolbar-title
    >

    <div class="flex-grow-1"></div>

    <v-toolbar-items class="hidden-sm-and-down">
      <span v-for="link in links" :key="link.name" class="flexitem">
        <span v-if="link.displayNav">
          <v-btn
            :to="link.url"
            depressed
            style="height: 99%; margin-bottom: 1px; margin-top: 0px; font-size: 12px;"
            class="heavy white "
          >
            {{ link.name }}
          </v-btn>
        </span>
      </span>
      <v-btn icon to="search" aria-label="Search">
        <v-icon>search</v-icon>
      </v-btn>
    </v-toolbar-items>
  </v-app-bar>
</template>

<script>
import { EventBus } from "@/event-bus";
export default {
  props: {
    links: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    toggleDrawer() {
      EventBus.$emit("toggleDrawer");
    }
  }
};
</script>

<style lang="scss" scoped></style>
