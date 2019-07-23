<template>
  <v-app>
    <v-app-bar fixed color="white" elevate-on-scroll max-height="100px">
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
        >ADULT REDEPLOY ILLINOIS</v-toolbar-title
      >

      <div class="flex-grow-1"></div>
      <span class="hidden-sm-and-down">
        <v-btn to="/news" depressed class="white">
          <span class="heavy">News</span>
        </v-btn>

        <v-btn depressed class="white">
          <span class="heavy">Sites</span>
        </v-btn>

        <v-btn depressed class="white">
          <span class="heavy">Meetings</span>
        </v-btn>

        <v-btn depressed class="white">
          <span class="heavy">Board</span>
        </v-btn>

        <v-btn depressed class="white">
          <span class="heavy">FAQs</span>
        </v-btn>

        <v-btn depressed class="white">
          <span class="heavy">Publications</span>
        </v-btn>
      </span>

      <v-btn icon>
        <v-icon>search</v-icon>
      </v-btn>

      <!-- <v-btn icon>
        <v-icon>more_vert</v-icon>
      </v-btn> -->
    </v-app-bar>
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
export default {
  name: "App",
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
<style>
.heavy {
  font-weight: 900;
}
.small {
  font-size: 16px;
}

.hover {
  cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.3s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}
</style>
