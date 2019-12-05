<template>
  <div>
    <base-content :loading="loading">
      <template v-slot:content>
        <v-container v-if="content">
          <v-row>
            <v-col cols="12">
              <SiteDescriptionCard :content="content"></SiteDescriptionCard>
            </v-col>
          </v-row>
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
import SiteDescriptionCard from "@/components/SiteDescriptionCard";
import { handleClicks } from "@/mixins/handleClicks";

export default {
  components: {
    BaseContent,
    SiteDescriptionCard
  },
  mixins: [handleClicks],
  metaInfo() {
    return {
      title: this.computedTitle
    };
  },
  data() {
    return {
      description: null,
      loading: false,
      content: null,
      renderToHtml,
      error: null,
      title: null
    };
  },
  watch: {
    $route: "fetchContent"
  },
  mounted() {
    this.fetchData();
  },
  computed: {
    computedTitle() {
      return this.title;
    }
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
      this.title = this.content[0].title;
      this.$ga.page({
        page: this.$route.path,
        title: this.title,
        location: window.location.href
      });
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
        .catch(err => {
          console.log(err);
        });
    }
  }
};
</script>

<style></style>
