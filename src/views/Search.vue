<template>
  <div>
    <base-content :loading="loading">
      <!-- <template v-slot:title>
        <v-container
          v-if="content"
          :fluid="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
        >
          <v-row>
            <v-col cols="12">
              <h1 class="page-title">{{ content[0].title }}</h1>
            </v-col>
          </v-row>
        </v-container>
      </template> -->
      <template v-slot:content>
        <v-container
          v-if="content"
          :fluid="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
        >
          <v-row>
            <v-col cols="12">
              <div
                v-html="renderToHtml(content[0].content)"
                @click="handleClicks"
                class="dynamic-content"
              ></div>
            </v-col>
          </v-row>
        </v-container>
        <v-container :fluid="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm">
          <v-row>
            <v-col cols="12" class="mb-10">
              <!-- {{ searchIndex }} -->
              <search
                :search-content="searchIndex"
                class="search"
                style=""
                data-aos="zoom-in-down"
              />
            </v-col>
          </v-row>
        </v-container>
      </template>
    </base-content>
  </div>
</template>

<script>
import BaseContent from "@/components/BaseContent";
import Search from "@/components/Search";
//import { getPage } from "@/services/Content";
import {
  //getHash,
  checkIfValidPage,
  getSectionContent
} from "@/services/Utilities";
import { renderToHtml } from "@/services/Markdown";
import { getSearchIndex } from "@/services/Search";
import { handleClicks } from "@/mixins/handleClicks";
export default {
  mixins: [handleClicks],
  metaInfo() {
    return {
      title: "Search"
    };
  },
  data() {
    return {
      loading: true,
      content: null,
      checkIfValidPage,
      renderToHtml,
      searchIndex: null
    };
  },
  components: {
    BaseContent,
    Search
  },
  created() {
    this.fetchContent();
  },
  methods: {
    async fetchContent() {
      this.loading = true;

      this.content = getSectionContent(this.$store.state.sections, "search");

      // const contentMap = new Map();
      // const name = `search`;
      // contentMap.set(name, {
      //   hash: getHash(name),
      //   query: getPage,
      //   params: { slug: "search" }
      // });

      // await this.$store.dispatch("cacheContent", contentMap);

      // this.content = this.$store.getters.getContentFromCache(contentMap, name);

      checkIfValidPage(this.content) ? null : this.routeToError();

      this.searchIndex = await getSearchIndex();
      this.$ga.page({
        page: this.$route.path,
        title: "Search",
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
          params: { msg: "Page not found", statusCode: 404 }
        })
        // eslint-disable-next-line no-unused-vars
        .catch(err => {});
    }
  }
};
</script>

<style lang="scss" scoped></style>
