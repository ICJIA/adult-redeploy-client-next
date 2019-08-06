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
            <v-flex xs12>
              <div
                v-html="renderToHtml(content[0].content)"
                v-if="content[0].content"
              ></div>
            </v-flex>
          </v-layout>
        </v-container>
      </template>
      <template v-slot:page-list>
        <v-container
          v-if="news"
          :fluid="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
        >
          <v-layout wrap>
            <v-flex xs12 class="mb-10">
              <base-list :items="news" empty="">
                <template slot-scope="item">
                  <NewsCard :content="item" :height="200"></NewsCard>
                </template>
              </base-list>
            </v-flex>
          </v-layout>
        </v-container>
      </template>
    </base-content>
  </div>
</template>

<script>
import BaseContent from "@/components/BaseContent";
import BaseList from "@/components/BaseList";
import NewsCard from "@/components/NewsCard";
import { getPageBySection, getNews } from "@/services/Content";
import { getHash, checkIfValidPage } from "@/services/Utilities";
import { renderToHtml } from "@/services/Markdown";
export default {
  components: {
    BaseContent,
    BaseList,
    NewsCard
  },
  data() {
    return {
      loading: false,
      content: [],
      news: [],
      renderToHtml
    };
  },
  created() {
    this.fetchContent();
  },
  methods: {
    async fetchContent() {
      this.loading = true;

      const contentMap = new Map();
      const section = "news";
      const slug = "news";

      const name = `getPageBySection-${section}${slug}`;
      contentMap.set(name, {
        hash: getHash(name),
        query: getPageBySection,
        params: { section, slug }
      });

      const newsName = `getNews`;
      contentMap.set(newsName, {
        hash: getHash(newsName),
        query: getNews,
        params: {}
      });

      await this.$store.dispatch("cacheContent", contentMap);

      this.sectionContent = this.$store.getters.getContentFromCache(
        contentMap,
        name
      );

      this.news = this.$store.getters.getContentFromCache(contentMap, newsName);
      console.log(this.news);

      if (checkIfValidPage(this.sectionContent)) {
        this.content = this.sectionContent[0].pages;
      } else {
        this.routeToError();
      }

      this.loading = false;
    },
    routeToError() {
      this.content = null;
      this.$router.push({
        name: "error",
        params: { msg: "Page not found", statusCode: 404 }
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
