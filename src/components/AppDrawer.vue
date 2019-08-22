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
    <v-row class="fill-height">
      <v-list class="drawer" rounded>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="text-center heavy"
              >ADULT REDEPLOY ILLINOIS</v-list-item-title
            >
          </v-list-item-content>
        </v-list-item>

        <v-divider></v-divider>

        <v-list dense v-for="link in sections" :key="link.name">
          <v-list-item
            class="link-item"
            v-if="!link.hasSubMenus && link.pages.length > 0"
          >
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

          <v-list-group no-action sub-group v-if="link.hasSubMenus">
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title style="font-weight: 900 !important">{{
                  link.title
                }}</v-list-item-title>
              </v-list-item-content>
            </template>

            <span v-if="link.pages.length > 0">
              <div v-for="(item, i) in link.pages" :key="i" link>
                <v-list-item v-if="item.displayNav">
                  <v-list-item-title
                    v-text="item.title"
                    class="push-right"
                    @click="
                      $router.push(`/${link.slug}/${item.slug}`).catch(err => {
                        $vuetify.goTo(0);
                      })
                    "
                  ></v-list-item-title>
                </v-list-item>
              </div>
            </span>
          </v-list-group>
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
    </v-row>
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
  padding-left: 50px;
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
