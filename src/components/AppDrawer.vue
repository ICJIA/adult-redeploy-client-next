<template>
  <!-- <v-navigation-drawer
    color="secondary"
    app
    dark
    v-model="drawer"
    clipped
    disable-resize-watcher
  >
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>Test</v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-divider></v-divider>

    <v-list dense>
      <v-list-item v-for="item in items" :key="item.title" link>
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer> -->
  <v-navigation-drawer
    class="pa-0"
    color="secondary"
    app
    dark
    v-model="drawer"
    clipped
    disable-resize-watcher
  >
    <v-layout column fill-height>
      <v-list>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="text-center heavy"
              >ADULT REDEPLOY ILLINOIS</v-list-item-title
            >
          </v-list-item-content>
        </v-list-item>

        <v-divider></v-divider>

        <v-list dense>
          <v-list-item v-for="item in items" :key="item.title" link>
            <!-- <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon> -->

            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-list>
      <v-spacer></v-spacer>
      <v-divider></v-divider>
      <div class="text-center px-3 py-5" style="color: #fff">
        <a href="http://www.icjia.state.il.us">
          <img
            src="/icjia-logo-white.png"
            alt="Illinois Criminal Justice Information Authority"
            width="65"
            class="mt-3"
          />
        </a>
        <br />

        <strong
          ><a
            href="http://www.icjia.state.il.us"
            class="footer-link"
            style="font-size: 10px;"
            >Illinois Criminal Justice Information Authority</a
          ></strong
        >
      </div>
    </v-layout>
  </v-navigation-drawer>
</template>

<script>
import { EventBus } from "@/event-bus";
export default {
  mounted() {
    EventBus.$on("toggleDrawer", () => {
      this.drawer = !this.drawer;
    });
  },
  data() {
    return {
      drawer: false,
      items: [
        { title: "Home", icon: "dashboard" },
        { title: "About", icon: "question_answer" }
      ]
    };
  }
};
</script>

<style>
.theme--light.v-list {
  background: white !important;
}
</style>
