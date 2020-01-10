<template>
  <div style="margin-top: -25px;">
    <p>
      Adult Redeploy Illinois is housed at the
      <a
        href="https://icjia.illinois.gov"
      >Illinois Criminal Justice Information Authority (ICJIA)</a>,
      the state’s lead agency on justice funding and research. ICJIA launched the
      <a
        href="https://icjia.illinois.gov/researchhub"
      >Research Hub</a> which provides
      a host of resources (publications, continuums, dashboards, datasets) to support data-driven decision-making
      for improved outcomes. Hub applications that ARI sites might find especially useful are available at the Apps tab.
    </p>
    <div class="text-right">
      <a
        href="https://icjia.illinois.gov/researchhub"
        target="_blank"
      >Visit ICJIA's Research Hub&nbsp;&raquo;</a>
    </div>

    <v-pagination
      small
      v-model="page"
      :length="length"
      :total-visible="visible"
      @input="fetchContent($event)"
      class="mt-8 mb-5"
    ></v-pagination>
    <div v-if="error.status" class="my-5 text-center" style="color: red">{{ error.msg }}</div>
    <div class="px-2 mb-10" v-if="!loading && articles" style="min-height: 475px">
      <div v-for="article in articles" :key="article.slug">
        <v-card class="mb-5 hover card" @click="routeTo(article)">
          <v-img
            class="white--text align-end"
            height="225px"
            :src="article.splash"
            v-if="!$browserDetect.isIE"
          >
            <div class="card-banner mb-5">
              <h2 class="px-5 article-title">{{ article.title }}</h2>
            </div>
          </v-img>

          <h3 class="px-5 pt-5" v-if="$browserDetect.isIE">{{ article.title }}</h3>

          <div class="px-4 pt-3">
            By
            <span v-for="(author, index) in article.authors" :key="index">
              <span v-if="index === article.authors.length - 1 && index > 0">&nbsp;and&nbsp;</span>
              <span v-if="index < article.authors.length - 1 && index > 0">,</span>
              <span style="font-weight: bold; color: #065F60">
                {{
                author.title
                }}
              </span>
            </span>
          </div>

          <v-card-subtitle class="pb-2">
            {{
            article.date | format
            }}
          </v-card-subtitle>

          <v-card-text class="text--primary mb-2">{{ article.abstract }}</v-card-text>
        </v-card>
      </div>
    </div>
    <div v-else>
      <div v-for="n in perPage" :key="`loader-${n}`">
        <div class="mb-8 px-2">
          <v-sheet :color="`grey lighten-4`">
            <v-boilerplate type="image, article" class="mb-6" :boilerplate="false"></v-boilerplate>
          </v-sheet>
        </div>
      </div>
    </div>

    <div class="text-center">
      <v-pagination
        v-if="!loading && !error.status"
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
      maxArticles: 8,
      error: {}
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
      return this.page * this.perPage - this.perPage;
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
      this.error.status = false;
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
        this.error.status = true;
        this.loading = false;
        this.error.msg =
          "Network error. Unable to fetch Research Hub articles. Please reload this page.";
        console.log("error");
        this.$ga.event({
          eventCategory: "Error",
          eventAction: "Network error.",
          eventLabel:
            "Unable to fetch Research Hub articles. Please reload this page."
        });
      }
      this.loading = false;
    }
  }
};
</script>

<style>
.card-banner {
  background: rgba(79, 80, 79, 0.5);
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
.article-title {
  line-height: 1.3em;
}
</style>
