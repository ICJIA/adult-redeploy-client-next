<template>
  <div>
    <base-content :loading="loading">
      <template v-slot:title>
        <v-container
          v-if="content"
          :fluid="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
        >
          <v-layout wrap>
            <v-flex xs12>
              <PostedDate
                :createdAt="content[0].createdAt"
                :updatedAt="content[0].updatedAt"
                style="margin-left: -15px"
              ></PostedDate>
              <h1 class="page-title">{{ content[0].title }}</h1>
            </v-flex>
          </v-layout>
        </v-container>
      </template>
      <template v-slot:content>
        <v-container
          v-if="content"
          :fluid="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
        >
          <v-layout wrap>
            <v-flex xs12 class="mb-10">
              <div
                v-html="renderToHtml(content[0].content)"
                v-if="content[0].content"
              ></div>
            </v-flex>
          </v-layout>
        </v-container>
      </template>
    </base-content>
  </div>
</template>

<script>
import BaseContent from "@/components/BaseContent";
import PostedDate from "@/components/PostedDate";
import { getPost } from "@/services/Content";
import { getHash, checkIfValidPage } from "@/services/Utilities";
import { renderToHtml } from "@/services/Markdown";
export default {
  watch: {
    $route: "fetchContent"
  },
  data() {
    return {
      loading: true,
      content: null,
      renderToHtml
    };
  },
  components: {
    BaseContent,
    PostedDate
  },
  created() {
    this.fetchContent();
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
          $vuetify.goTo(0);
        });
    }
  }
};
</script>

<style lang="scss" scoped></style>
