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
    </base-content>
  </div>
</template>

<script>
import BaseContent from "@/components/BaseContent";
import { getPage } from "@/services/Content";
import { getHash, checkIfValidPage } from "@/services/Utilities";
export default {
  watch: {
    $route: "fetchContent"
  },
  data() {
    return {
      loading: true,
      content: null,
      checkIfValidPage
    };
  },
  components: {
    BaseContent
  },
  created() {
    this.fetchContent();
  },
  methods: {
    async fetchContent() {
      this.loading = true;

      const contentMap = new Map();
      const slug = this.$route.params.slug;
      const name = `getPage-${slug}`;
      contentMap.set(name, {
        hash: getHash(name),
        query: getPage,
        params: { slug }
      });

      await this.$store.dispatch("cacheContent", contentMap);

      this.content = this.$store.getters.getContentFromCache(contentMap, name);

      checkIfValidPage(this.content) ? null : this.routeToError();
      this.loading = false;
    },
    routeToError() {
      this.content = null;
      this.loading = false;
      this.$router.push({
        name: "error",
        params: { msg: "Page not found", statusCode: 404 }
      });
    }
  }
};
</script>

<style lang="scss" scoped></style>
