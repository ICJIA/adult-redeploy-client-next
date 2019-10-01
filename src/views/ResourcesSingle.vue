<template>
  <div>
    <base-content :loading="loading">
      <template v-slot:content>
        <v-container v-if="content">
          <v-row>
            <v-col cols="12">
              <resource-display :item="content[0]"></resource-display>
              <!-- {{ content[0] }} -->
            </v-col>
          </v-row>
        </v-container>
      </template>
    </base-content>
  </div>
</template>

<script>
import { renderToHtml } from "@/services/Markdown";
import { getSingleResource } from "@/services/Content";
// eslint-disable-next-line no-unused-vars
import { getHash, checkIfValidPage } from "@/services/Utilities";
import BaseContent from "@/components/BaseContent";
import { handleClicks } from "@/mixins/handleClicks";
import ResourceDisplay from "@/components/ResourceDisplay";
export default {
  components: {
    BaseContent,
    ResourceDisplay
  },
  mixins: [handleClicks],
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
      const name = `getSingleResource-${slug}`;
      contentMap.set(name, {
        hash: getHash(name),
        query: getSingleResource,
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
          params: {
            msg: "Page not found",
            statusCode: 404,
            debug: this.$route.params
          }
        })
        // eslint-disable-next-line no-unused-vars
        .catch(err => {});
    }
  }
};
</script>

<style></style>
