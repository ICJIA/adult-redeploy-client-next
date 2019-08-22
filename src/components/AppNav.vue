<template>
  <v-app-bar color="white" fixed height="90" class="noprint">
    <v-app-bar-nav-icon
      @click="toggleDrawer"
      class="hidden-md-and-up"
      style="color: black"
      large
    ></v-app-bar-nav-icon>

    <div style="width: 15px"></div>

    <img
      src="/icjia-logo.png"
      alt="Illinois Criminal Justice Information Authority"
      :width="logoWidth()"
      style="margin-left: -5px; margin-right: 8px;"
      class="hover"
      @click="
        $router.push('/').catch(err => {
          $vuetify.goTo(0);
        })
      "
    />&nbsp;&nbsp;&nbsp;&nbsp;
    <v-toolbar-title
      class="heavy hover"
      @click="
        $router.push('/').catch(err => {
          $vuetify.goTo(0);
        })
      "
      ><span style="" class="agency"
        >ADULT REDEPLOY ILLINOIS</span
      ></v-toolbar-title
    >

    <div class="flex-grow-1"></div>

    <v-toolbar-items class="hidden-sm-and-down">
      <span v-for="link in sections" :key="link.title" class="flexitem">
        <span v-if="link.displayNav">
          <v-menu offset-y left eager style="background: yellow">
            <template v-slot:activator="{ on }">
              <v-btn
                v-if="link.hasSubMenus && link.pages.length > 0"
                depressed
                style="height: 99%; margin-bottom: 1px; margin-top: 0px; font-size: 13px;"
                class="heavy white "
                v-on="on"
              >
                {{ link.title }}<v-icon right small>arrow_drop_down</v-icon>
              </v-btn>
              <v-btn
                v-else
                depressed
                style="height: 99%; margin-bottom: 1px; margin-top: 0px; font-size: 13px;"
                class="heavy white "
                :to="`/${link.slug}`"
              >
                {{ link.title }}
              </v-btn>
            </template>

            <v-list nav dense flat elevation="1">
              <v-list-item-group color="primary">
                <v-list-item v-for="(subItem, i) in link.pages" :key="i">
                  <v-list-item-content
                    @click="
                      $router
                        .push(`/${link.slug}/${subItem.slug}`)
                        .catch(err => {
                          $vuetify.goTo(0);
                        })
                    "
                  >
                    <v-list-item-title
                      style="font-size: 14px; font-weight: bold; "
                    >
                      <span v-if="subItem.addDivider">
                        <div class="mb-5">
                          <v-divider></v-divider>
                        </div>
                      </span>
                      {{ subItem.title }}
                    </v-list-item-title>
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
  props: {
    sections: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    toggleDrawer() {
      EventBus.$emit("toggleDrawer");
    },
    logoWidth() {
      //console.log(this.$vuetify.breakpoint);
      if (this.$vuetify.breakpoint.xs) {
        return 50;
      } else {
        return 90;
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
