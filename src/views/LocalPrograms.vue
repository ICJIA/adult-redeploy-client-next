<template>
  <div>
    <base-content :loading="loading">
      <template v-slot:title>
        <v-container v-if="content">
          <v-layout wrap>
            <v-flex xs12>
              <h1 class="page-title">{{ content[0].title }}</h1>
            </v-flex>
          </v-layout>
        </v-container>
      </template>
      <template v-slot:content>
        <v-container v-if="content">
          <v-layout wrap>
            <v-flex xs12 class="mb-10">
              {{ content[0].content }}
            </v-flex>
          </v-layout>
        </v-container>
      </template>
      <template v-slot:special>
        <v-container>
          <v-layout wrap>
            <v-flex xs12 sm12 md6>
              <div>
                <illinois :maxWidth="400"></illinois>
              </div>
            </v-flex>
            <v-flex xs12 sm12 md6>
              FactSheet here
            </v-flex>
          </v-layout>
        </v-container>
      </template>
    </base-content>
  </div>
</template>

<script>
import Illinois from "@/components/Illinois";
import BaseContent from "@/components/BaseContent";
export default {
  components: {
    Illinois,
    BaseContent
  },
  data() {
    return {
      loading: false,
      content: null
    };
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
