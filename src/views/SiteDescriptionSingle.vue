<template>
  <div>
    <base-content :loading="loading">
      <template v-slot:content>
        <v-container v-if="content">
          <v-layout wrap>
            <v-flex xs12>
              <v-card class="mx-auto" color="white">
                <v-card-title class="site-desription-title px-3">{{
                  content[0].title
                }}</v-card-title>
                <v-card-text
                  ><div
                    v-html="renderToHtml(content[0].content)"
                    v-if="content[0].content"
                    class="site-description"
                  ></div
                ></v-card-text>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </template>
    </base-content>
  </div>
</template>

<script>
import { renderToHtml } from "@/services/Markdown";
import { getSiteDescription } from "@/services/Content";
// eslint-disable-next-line no-unused-vars
import { getHash, checkIfValidPage } from "@/services/Utilities";

import BaseContent from "@/components/BaseContent";

export default {
  components: {
    BaseContent
  },
  data() {
    return {
      description: null,
      loading: false,
      content: null,
      renderToHtml,
      error: null
    };
  },
  watch: {
    $route: "fetchContent"
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      const contentMap = new Map();

      const slug = this.$route.params.slug.toLowerCase();
      const name = `getSiteDescription-${slug}`;
      contentMap.set(name, {
        hash: getHash(name),
        query: getSiteDescription,
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
        params: {
          msg: "Page not found",
          statusCode: 404,
          debug: this.$route.params
        }
      });
    }
  }
};
</script>

<style></style>
