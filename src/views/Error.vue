<template>
  <error-content>
    <template v-slot:content>
      <v-container grid-list-md text-center>
        <v-layout wrap align-center>
          <v-flex>
            <h1 style="font-size: 48px; color: #666">Oops.</h1>
            <h2 class="mt-10">
              {{ $route.params.statusCode }} | {{ $route.params.msg }}
            </h2>
            <p class="mt-12"><router-link to="/">Go back home</router-link></p>
          </v-flex>
        </v-layout>
      </v-container>
    </template>
  </error-content>
</template>

<script>
import ErrorContent from "@/components/ErrorContent";
export default {
  components: {
    ErrorContent
  },
  mounted() {
    this.$store.commit("CLEAR_CACHE");
  }
};
</script>

<style lang="scss" scoped></style>
