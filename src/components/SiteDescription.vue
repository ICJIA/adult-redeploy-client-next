<template>
  <div>
    <div v-if="!$store.getters.selectedCountyData" class="text-center">
      <h2>Select a county or judicial circuit for more information.</h2>
    </div>
    <div v-if="error">
      Not found. Please try again.
    </div>

    <base-content :loading="loading">
      <template v-slot:content>
        <v-card class="mx-auto" color="white" v-if="content">
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
      </template>
    </base-content>
  </div>
</template>

<script>
import { EventBus } from "@/event-bus";

import { renderToHtml } from "@/services/Markdown";
import { getSiteDescription } from "@/services/Content";
// eslint-disable-next-line no-unused-vars
import { getHash, checkIfValidPage } from "@/services/Utilities";
import Loader from "@/components/Loader";
import BaseContent from "@/components/BaseContent";

export default {
  components: {
    Loader,
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
  mounted() {
    EventBus.$on("mapClick", mapData => {
      this.error = null;
      this.fetchData(mapData);
    });
  },
  methods: {
    async fetchData(mapData) {
      this.loading = true;
      const contentMap = new Map();
      //console.log(mapData.slug);
      const slug = mapData.slug;
      const name = `getSiteDescription-${slug}`;
      contentMap.set(name, {
        hash: getHash(name),
        query: getSiteDescription,
        params: { slug }
      });

      await this.$store.dispatch("cacheContent", contentMap);
      this.content = this.$store.getters.getContentFromCache(contentMap, name);
      if (!this.content) {
        this.error = "County not found";
      }
      this.loading = false;
    }
  }
};
</script>

<style></style>
