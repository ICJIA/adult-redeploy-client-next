<template>
  <div>
    <v-container>
      <v-layout row wrap>
        <v-flex xs6>
          <illinois></illinois>
        </v-flex>
        <v-flex xs6>
          card here
        </v-flex>
      </v-layout>
    </v-container>
    <div></div>
  </div>
</template>

<script>
import Illinois from "@/components/Illinois";
export default {
  components: {
    Illinois
  },
  props: {
    display: {
      type: String,
      default: "modal"
    }
  }
};
</script>

<style lang="scss" scoped></style>
