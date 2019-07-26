<template>
  <!-- <v-carousel
    height="500"
    hide-delimiter-background
    show-arrows-on-hover
    class="home"
  >
    <v-carousel-item v-for="(slide, i) in slides" :key="i">
      <v-sheet :color="colors[i]" height="100%">
       
        <v-container fill-height text-center>
          <v-layout align-center>
            <v-flex xs12>
              <div class="default-font carousel-large heavy carousel-main-text">
                Adult Redeploy Illinois
              </div>
              <div class="default-font carousel-medium mt-10 carousel-sub-text">
                Results expected with Adult Redeploy Illinois include reduced
                prison overcrowding, lowered cost to taxpayers, and an end to
                the expensive and vicious cycle of crime and incarceration.
              </div>
            
              <v-btn
                class="mt-12 mb-12"
                to="/about"
                aria-label="Return home"
                outlined
                >Learn More</v-btn
              >
            </v-flex>
          </v-layout>
        </v-container>
      </v-sheet>
    </v-carousel-item>
  </v-carousel> -->

  <v-img
    src="/ari-splash-01.jpg"
    lazy-src="/ari-splash-01.jpg"
    aspect-ratio="1"
    class="grey lighten-2"
    max-height="600"
    ><v-container fluid fill-height text-center style="margin: 0; padding: 0">
      <v-layout align-center>
        <div class="banner">
          <v-flex xs12>
            <div class="default-font carousel-large heavy carousel-main-text">
              Adult Redeploy Illinois
            </div>
            <div
              class="default-font carousel-medium mt-10 px-12 carousel-sub-text"
            >
              Results expected with Adult Redeploy Illinois include reduced
              prison overcrowding, lowered cost to taxpayers, and an end to the
              expensive and vicious cycle of crime and incarceration.
            </div>
            <v-btn class="mt-6" color="white" to="/about" outlined
              >Learn More</v-btn
            >
          </v-flex>
        </div>
      </v-layout>
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
