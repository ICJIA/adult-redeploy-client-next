<template>
  <error-content>
    <template v-slot:title>
      <v-container>
        <v-layout wrap>
          <v-flex xs12>
            <h1>Error</h1>
          </v-flex>
        </v-layout>
      </v-container>
    </template>
    <template v-slot:content>
      <v-container>
        <v-layout wrap>
          <v-flex xs12>
            {{ $route.params }}
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
  }
};
</script>

<style lang="scss" scoped></style>
