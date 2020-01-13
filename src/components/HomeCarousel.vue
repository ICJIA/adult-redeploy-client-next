<template>
  <v-img
    :src="require('@/assets/ari-splash-01.jpg')"
    :lazy-src="require('@/assets/ari-splash-01-tiny.jpg')"
    aspect-ratio="1"
    class="grey lighten-2"
    max-height="600"
    ><v-container
      class="fill-height text-center"
      fluid
      style="margin: 0 !important; padding: 0 !important; margin-left: 12px;"
    >
      <v-row align="center">
        <div class="banner">
          <v-col cols="12">
            <h1 class="default-font carousel-large heavy carousel-main-text">
              Adult Redeploy Illinois
            </h1>
            <div
              class="default-font carousel-medium mt-10 px-12 carousel-sub-text"
            >
              Reallocating state resources to develop more effective, less
              expensive community-based alternatives to incarceration and
              improve access to interventions that reduce crime.
            </div>
            <v-btn
              class="mt-6"
              color="white"
              @click="$vuetify.goTo('#about', { offset: 210 })"
              >Learn More</v-btn
            >&nbsp;&nbsp;
            <v-btn class="mt-6" to="/about/faqs" outlined color="white"
              >FAQs</v-btn
            >
          </v-col>
        </div>
      </v-row>
    </v-container>
  </v-img>
</template>

<script>
export default {
  data() {
    return {
      colors: ["grey darken-1", "grey darken-1", "grey darken-1"],
      slides: ["First", "Second", "Third"]
    };
  },
  mounted() {
    // a11y fix for nav buttons

    document.addEventListener("DOMContentLoaded", () => {
      let arr = [
        ...document.getElementsByClassName("v-carousel__controls__item")
      ];
      arr.forEach(item => {
        item.setAttribute("aria-label", "navigation button");
      });
    });
  }
};
</script>

<style scoped>
.banner {
  width: 100%;
  background: rgba(79, 80, 79, 0.7);
  padding: 30px;
  margin-top: 100px;
}

@media only screen and (max-width: 600px) {
  .banner {
    height: 100%;
    background: rgba(79, 80, 79, 0.5);
  }
}
</style>
