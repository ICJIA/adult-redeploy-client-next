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

        <v-list dense v-for="link in links" :key="link.name">
          <div>
            <v-list-item v-if="!link.subMenu" class="push-right">
              <v-list-item-content>
                <v-list-item-title
                  @click="$router.push(link.url)"
                  style="font-weight: 900 !important; cursor: pointer"
                  >{{ link.name }}</v-list-item-title
                >
              </v-list-item-content>
            </v-list-item>

            <v-list-group no-action sub-group v-else>
              <template v-slot:activator>
                <v-list-item-content>
                  <v-list-item-title style="font-weight: 900 !important">{{
                    link.name
                  }}</v-list-item-title>
                </v-list-item-content>
              </template>

              <v-list-item v-for="(item, i) in link.subMenu" :key="i" link>
                <v-list-item-title
                  v-text="item.name"
                  @click="$router.push(item.url)"
                ></v-list-item-title>
              </v-list-item>
            </v-list-group>
          </div>
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
  props: {
    links: {
      type: Array,
      default: () => []
    }
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

.push-right {
  margin-left: 50px;
}
.v-list-item--active {
  color: #fff !important;
}
</style>
