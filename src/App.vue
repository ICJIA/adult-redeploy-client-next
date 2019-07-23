<template>
  <v-app>
    <app-nav></app-nav>
    <v-navigation-drawer app v-model="drawer" clipped disable-resize-watcher>
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
    </v-navigation-drawer>

    <v-content>
      <transition name="fade" mode="out-in">
        <router-view></router-view>
      </transition>
    </v-content>
  </v-app>
</template>

<script>
import AppNav from "@/components/AppNav";
export default {
  name: "App",
  components: {
    AppNav
  },
  methods: {
    toggleDrawer() {
      this.drawer = !this.drawer;
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
<style></style>
