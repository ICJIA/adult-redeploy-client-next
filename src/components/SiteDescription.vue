<template>
  <div>
    <div v-if="!$store.getters.selectedCountyData" class="text-center">
      <h2>Select a county or judicial circuit for more information.</h2>
    </div>
    <div v-if="error">
      Not found. Please try again.
    </div>

    <base-content :loading="loading">
      <template v-slot:content v-if="content">
        <div class="animated fadeIn">
          <BaseDescription :content="content"></BaseDescription>
        </div>
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
import BaseContent from "@/components/BaseContent";
import BaseDescription from "@/components/BaseDescription";

export default {
  components: {
    BaseContent,
    BaseDescription
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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
