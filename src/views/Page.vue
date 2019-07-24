<template>
  <div>
    <base-content :loading="loading">
      <template v-slot:content>
        <v-container>
          <v-layout wrap>
            <v-flex
              xs12
              style="padding-left: 30px; padding-right: 30px"
              class="mb-10"
            >
              {{ content }}
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
import { getHash } from "@/services/Utilities";
export default {
  watch: {
    $route: "fetchContent"
  },
  data() {
    return {
      loading: true,
      content: []
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

      let res = await this.$store.dispatch("cacheContent", contentMap);
      console.log(res);
      this.content = this.$store.getters.getContentFromCache(contentMap, name);
      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped></style>
