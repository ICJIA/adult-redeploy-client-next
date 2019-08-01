<template>
  <div>
    <div v-if="!this.loading && !this.error">
      {{ content }}
    </div>
    <div v-if="error">
      County not found
    </div>
    <div v-if="this.loading">
      <div class="text-center">
        <loader></loader>
      </div>
    </div>
  </div>
</template>

<script>
import { EventBus } from "@/event-bus";
import { getSiteDescription } from "@/services/Content";
// eslint-disable-next-line no-unused-vars
import { getHash, checkIfValidPage } from "@/services/Utilities";
import Loader from "@/components/Loader";

import { renderToHtml } from "@/services/Markdown";
export default {
  components: {
    Loader
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

<style lang="scss" scoped></style>
