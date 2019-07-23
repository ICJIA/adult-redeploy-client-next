<template>
  <div>
    <carousel></carousel>
    <hero-boxes></hero-boxes>
    <v-container>
      <v-row>
        content here
        <div style="height: 1000px"></div>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import Carousel from "@/components/Carousel";
import HeroBoxes from "@/components/HeroBoxes";
export default {
  components: {
    Carousel,
    HeroBoxes
  }
};
</script>

<style></style>
