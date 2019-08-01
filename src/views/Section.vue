<template>
  <div>
    <base-content :loading="loading">
      <template v-slot:title>
        <v-container v-if="content">
          <v-layout wrap>
            <v-flex xs12>
              <h1 class="page-title">{{ content.title }}</h1>
            </v-flex>
          </v-layout>
        </v-container>
      </template>
      <template v-slot:special>
        <v-container v-if="content">
          <v-layout wrap>
            <v-flex>
              {{ content }}
            </v-flex>
          </v-layout>
        </v-container>
      </template>
    </base-content>
  </div>
</template>

<script>
import BaseContent from "@/components/BaseContent";
export default {
  watch: {
    $route: "fetchContent"
  },
  data() {
    return {
      loading: null,
      content: []
    };
  },
  components: {
    BaseContent
  },
  methods: {
    routeToError() {
      this.content = null;
      this.loading = false;
      this.$router.push({
        name: "error",
        params: {
          msg: "Page not found",
          statusCode: 404,
          debug: this.$route.params
        }
      });
    },
    fetchContent() {
      this.loading = true;
      const section = this.$route.params.section.toLowerCase();
      if (section !== "home") {
        this.content = this.$store.getters.sections.find(
          x => x.slug === `${section}`
        );
        if (!this.content) {
          this.routeToError();
        }
      }

      this.loading = false;
    }
  },
  created() {
    this.fetchContent();
  }
};
</script>

<style lang="scss" scoped></style>
