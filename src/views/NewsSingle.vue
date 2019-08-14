<template>
  <div>
    <base-content :loading="loading">
      <template v-slot:content>
        <v-container
          v-if="content"
          :fluid="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
        >
          <v-layout wrap>
            <v-flex xs12 class="mb-10">
              <NewsCard
                :content="content[0]"
                :fullHeight="true"
                :elevation="false"
              ></NewsCard>
            </v-flex>
          </v-layout>
        </v-container>
      </template>
    </base-content>
  </div>
</template>

<script>
import BaseContent from "@/components/BaseContent";

import NewsCard from "@/components/NewsCard";
import { getPost } from "@/services/Content";
import { getHash, checkIfValidPage } from "@/services/Utilities";
import { renderToHtml } from "@/services/Markdown";
import { handleClicks } from "@/mixins/handleClicks";
export default {
  watch: {
    $route: "fetchContent"
  },
  mixins: [handleClicks],
  data() {
    return {
      loading: true,
      content: null,
      renderToHtml,
      newsContent: {}
    };
  },
  components: {
    BaseContent,

    NewsCard
  },
  created() {
    this.fetchContent();
    this.newsContent.content = "Test content";
  },
  methods: {
    async fetchContent() {
      this.loading = true;

      const contentMap = new Map();
      const slug = this.$route.params.slug.toLowerCase();
      const name = `getPost-${slug}`;
      contentMap.set(name, {
        hash: getHash(name),
        query: getPost,
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
      this.$router
        .push({
          name: "error",
          params: { msg: "Page not found", statusCode: 404 }
        })
        // eslint-disable-next-line no-unused-vars
        .catch(err => {
          this.$vuetify.goTo(0);
        });
    }
  }
};
</script>

<style lang="scss" scoped></style>
