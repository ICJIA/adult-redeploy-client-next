<template>
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
</template>

<script>
export default {};
</script>

<style lang="scss" scoped></style>
