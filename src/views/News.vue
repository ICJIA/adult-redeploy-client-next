<template>
  <div>
    <base-content :loading="loading">
      <template v-slot:title>
        <v-container
          v-if="content"
          :fluid="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
        >
          <v-row>
            <v-col cols="12">
              <h1 class="page-title">News Archive</h1>
            </v-col>
          </v-row>
        </v-container>
      </template>
      <template v-slot:content>
        <v-container
          v-if="content"
          :fluid="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
        >
          <v-row> </v-row>
          <v-row>
            <v-col cols="12" class="mb-10">
              <ListTableNews :items="newsSorted"></ListTableNews>
            </v-col>
          </v-row>
        </v-container>
      </template>
    </base-content>
  </div>
</template>

<script>
import BaseContent from "@/components/BaseContent";

import ListTableNews from "@/components/ListTableNews";
// eslint-disable-next-line no-unused-vars
import { getPageBySection, getAllNews } from "@/services/Content";
import { sortBy } from "lodash";
// eslint-disable-next-line no-unused-vars
import { getHash, checkIfValidPage } from "@/services/Utilities";
import { renderToHtml } from "@/services/Markdown";
import { handleClicks } from "@/mixins/handleClicks";
export default {
  components: {
    BaseContent,

    ListTableNews
  },
  mixins: [handleClicks],
  metaInfo() {
    return {
      title: this.title
    };
  },
  data() {
    return {
      loading: false,
      content: [],
      sectionContent: [],
      news: [],
      renderToHtml,
      title: "News Archive",
      newsSorted: []
    };
  },
  created() {
    this.fetchContent();
  },
  methods: {
    async fetchContent() {
      this.loading = true;

      const contentMap = new Map();
      // const section = "news";
      // const slug = "news";

      // const name = `getPageBySection-${section}${slug}`;
      // contentMap.set(name, {
      //   hash: getHash(name),
      //   query: getPageBySection,
      //   params: { section, slug }
      // });

      const newsName = `getNews`;
      contentMap.set(newsName, {
        hash: getHash(newsName),
        query: getAllNews,
        params: {}
      });

      await this.$store.dispatch("cacheContent", contentMap);

      this.sectionContent = this.$store.getters.getContentFromCache(
        contentMap,
        name
      );

      this.news = this.$store.getters.getContentFromCache(contentMap, newsName);
      this.newsSorted = sortBy(this.news, "createdAt").reverse();

      // if (checkIfValidPage(this.sectionContent)) {
      //   this.content = this.sectionContent[0].summary;
      // } else {
      //   this.routeToError();
      // }

      this.$ga.page({
        page: this.$route.path,
        title: this.title,
        location: window.location.href
      });

      this.loading = false;
    },
    routeToError() {
      this.content = null;
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
  },
  props: {
    display: {
      type: String,
      default: "modal"
    }
  }
};
</script>

<style lang="scss" scoped></style>
