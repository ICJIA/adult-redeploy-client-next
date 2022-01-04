<template>
  <div>
    <v-pagination
      v-model="page"
      :length="length"
      :total-visible="visible"
      @input="fetchContent($event)"
      class="mt-3"
    ></v-pagination>
    <div class="px-10 mb-10 mt-10" v-if="!loading && articles">
      <div v-for="article in articles" :key="article.slug">
        <v-card class="mx-auto mb-5 py-5">
          <v-img
            class="white--text align-end"
            height="200px"
            :src="article.splash"
          >
            <h2 class="px-5">{{ article.title }}</h2>
          </v-img>

          <div class="px-4 pt-3">
            By
            <span v-for="(author, index) in article.authors" :key="index">
              <span v-if="index === article.authors.length - 1 && index > 0"
                >&nbsp;and&nbsp;</span
              >
              <span v-if="index < article.authors.length - 1 && index > 0"
                >, </span
              ><span style="font-weight: bold">{{ author.title }}</span></span
            >
          </div>

          <v-card-subtitle class="pb-2">{{
            article.date | format
          }}</v-card-subtitle>

          <v-card-text class="text--primary mb-2">
            {{ article.abstract }}
          </v-card-text>
        </v-card>
      </div>
    </div>
    <div v-else><Loader></Loader></div>
  </div>
</template>

<script>
import { getRecentArticles } from "@/services/Content";
import { getHash, checkIfValidPage } from "@/services/Utilities";
import Loader from "@/components/Loader";
export default {
  data() {
    return {
      page: 1,
      perPage: 3,
      loading: true,
      articles: null,
      maxArticles: 98,
      error: "",
    };
  },
  components: {
    Loader,
  },
  created() {
    this.fetchContent();
  },
  computed: {
    start() {
      return this.page * this.perPage - (this.perPage - 1);
    },
    visible() {
      return 5;
    },
    length() {
      return Math.floor(this.maxArticles / this.perPage) + 1;
    },
  },

  methods: {
    async fetchContent(e) {
      console.log("Start: ", this.start);
      this.loading = true;
      const contentMap = new Map();
      contentMap.set(`getRecentArticles_${this.start}`, {
        hash: getHash(`getRecentArticles_${this.start}`),
        query: getRecentArticles,
        params: { limit: this.perPage, start: this.start },
      });
      await this.$store.dispatch("cacheContent", contentMap);
      this.articles = this.$store.getters.getContentFromCache(
        contentMap,
        `getRecentArticles_${this.start}`
      );
      if (!checkIfValidPage(this.articles)) {
        this.error = "Network error";
      }
      this.loading = false;
    },
  },
};
</script>

<style></style>
