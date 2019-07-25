<template>
  <v-carousel
    height="500"
    hide-delimiter-background
    show-arrows-on-hover
    class="home"
  >
    <v-carousel-item v-for="(slide, i) in slides" :key="i">
      <v-sheet :color="colors[i]" height="100%">
        <!-- <v-row class="fill-height" align="center" justify="center">
          <div class="default-font carousel-large heavy">
            Adult Redeploy Illinois<br />test
          </div>
        </v-row> -->
        <v-container fill-height text-center>
          <v-layout align-center>
            <v-flex xs12>
              <div class="default-font carousel-large heavy carousel-main-text">
                Adult Redeploy Illinois
              </div>
              <div class="default-font carousel-medium mt-4 carousel-sub-text">
                Adult Redeploy Illinois was established by the Crime Reduction
                Act to provide financial incentives to local jurisdictions for
                programs that allow diversion of non-violent offenders from
                state prisons by providing community-based services.
              </div>
              <img
                src="/icjia-logo-white.png"
                alt="Illinois Criminal Justice Information Authority"
                width="110"
                class="mt-8"
              />
            </v-flex>
          </v-layout>
        </v-container>
      </v-sheet>
    </v-carousel-item>
  </v-carousel>
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

<style scoped></style>
