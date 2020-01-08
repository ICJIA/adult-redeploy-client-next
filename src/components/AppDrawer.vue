<template>
  <v-navigation-drawer
    class="pa-0"
    color="secondary"
    app
    dark
    v-model="drawer"
    clipped
    disable-resize-watcher
  >
    <v-list class="drawer" rounded>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-center heavy"
            >ADULT REDEPLOY ILLINOIS</v-list-item-title
          >
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>
    </v-list>
    <v-spacer></v-spacer>

    <v-col>
      <v-list dense v-for="link in sections" :key="link.name">
        <v-list-item class="link-item">
          <v-list-item-content>
            <v-list-item-title
              @click="
                $router
                  .push(link.slug === 'home' ? '/' : `/${link.slug}`)
                  .catch(err => {
                    $vuetify.goTo(0);
                  })
              "
              style="font-weight: 900 !important; cursor: pointer"
              class="push-right"
              >{{ link.title }}</v-list-item-title
            >
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-col>
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
    sections: {
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
  padding-left: 20px;
}
.drawer .v-list-item--active {
  color: #fff !important;
}

/* .drawer .v-list-item-group .v-list-item--active {
  opacity: 0.1 !important;
} */

.link-item:hover {
  background: #268384;
}
</style>
