<template>
  <div style="margin-top: -25px;">
    <v-pagination
      small
      v-model="page"
      :length="length"
      :total-visible="visible"
      @input="fetchContent($event)"
      class="mt-3 mb-5"
    ></v-pagination>
    <div
      class="px-10 mb-10"
      v-if="!loading && articles"
      style="min-height: 450px"
    >
      <div v-for="article in articles" :key="article.slug">
        <v-card class="mx-auto mb-5 hover card" @click="routeTo(article)">
          <v-img
            class="white--text align-end"
            height="200px"
            :src="article.splash"
          >
            <div class="card-banner">
              <h2 class="px-5">{{ article.title }}</h2>
            </div>
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
    <div v-else>
      <div v-for="n in perPage" :key="`loadeer-${n}`">
        <div class="mb-8">
          <v-sheet :color="`grey lighten-4`">
            <v-boilerplate type="image, article" class="mb-6"></v-boilerplate>
          </v-sheet>
        </div>
      </div>
    </div>
    <div class="text-center">
      <v-pagination
        v-if="!loading"
        small
        v-model="page"
        :length="length"
        :total-visible="visible"
        @input="fetchContent($event)"
        class="mt-1"
      ></v-pagination>
    </div>
  </div>
</template>

<script>
import { VSkeletonLoader } from "vuetify/lib";
import { getRecentArticles } from "@/services/Content";
import { getHash, checkIfValidPage } from "@/services/Utilities";
//import Loader from "@/components/Loader";
export default {
  data() {
    return {
      page: 1,
      perPage: 2,
      loading: true,
      articles: null,
      maxArticles: 97,
      error: ""
    };
  },
  components: {
    // eslint-disable-next-line vue/no-unused-components
    VSkeletonLoader,
    // Create a new component that
    // extends v-skeleton-loader
    VBoilerplate: {
      functional: true,

      render(h, { data, props, children }) {
        return h(
          "VSkeletonLoader",
          {
            ...data,
            props: {
              boilerplate: true,
              elevation: 2,
              ...props
            }
          },
          children
        );
      }
    }
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
    }
  },

  methods: {
    next() {
      this.page = this.page + 1;
      return;
    },
    previous() {
      this.page = this.page - 1;
      return;
    },
    routeTo(article) {
      const url =
        "https://icjia.illinois.gov/researchhub/articles/" + article.slug;
      window.open(url);
    },
    async fetchContent(e) {
      //console.log("Start: ", this.start);
      this.loading = true;
      const contentMap = new Map();
      contentMap.set(`getRecentArticles_${this.start}`, {
        hash: getHash(`getRecentArticles_${this.start}`),
        query: getRecentArticles,
        params: { limit: this.perPage, start: this.start }
      });
      await this.$store.dispatch("cacheContent", contentMap);
      this.articles = this.$store.getters.getContentFromCache(
        contentMap,
        `getRecentArticles_${this.start}`
      );
      if (!checkIfValidPage(this.articles)) {
        this.error = "Network error";
        console.log("error");
      }
      this.loading = false;
    }
  }
};
</script>

<style>
.card-banner {
  background: rgba(79, 80, 79, 0.3);
}
.card:hover {
  box-shadow: 0px 0px 15px #000000;
  z-index: 2;
  -webkit-transition: all 100ms ease-in;
  -webkit-transform: scale(1.01);
  -ms-transition: all 100ms ease-in;
  -ms-transform: scale(1.01);
  -moz-transition: all 100ms ease-in;
  -moz-transform: scale(1.01);
  transition: all 100ms ease-in;
  transform: scale(1.01);
  cursor: pointer;
}
</style>
