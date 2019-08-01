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
            <v-flex xs12>
              <div v-html="renderToHtml(content[0].content)"></div>
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

<style>
.site-desription-title {
  background: #067879;
  font-weight: 900;
  color: #ffff;
  text-transform: uppercase;
  margin-bottom: 20px;
}
.site-description {
  color: #000;
}
.site-description h2 {
  margin-bottom: 15px;
  line-height: 1.5em;
}
</style>
