<template>
  <div>
    <div v-if="!$browserDetect.isIE">
      <home-carousel></home-carousel>
      <home-boxes></home-boxes>
    </div>

    <base-content :loading="loading">
      <template v-slot:content>
        <v-container fluid>
          <v-row>
            <v-col
              cols="12"
              sm="12"
              md="12"
              style="padding-left: 30px; padding-right: 30px"
              class="mb-10"
            >
              <span
                style="display: block; font-size: 32px; color: #444; font-weight: 900; border-bottom: 1px solid #bbb; padding-bottom: 8px; margin-bottom: 50px"
                class="news-title hover"
                @click="$router.push('/about/overview')"
                >ABOUT ADULT REDEPLOY ILLINOIS</span
              >

              <home-about
                :content="about"
                v-if="about"
                data-aos="fade"
              ></home-about>
            </v-col>

            <v-col cols="12" sm="12" md="6" class="mb-10">
              <span
                style="display: block; font-size: 32px; color: #444; font-weight: 900; border-bottom: 1px solid #bbb; padding-bottom: 8px; margin-bottom: 50px"
                class="news-title hover"
                @click="$router.push('/news')"
                >ARI NEWS</span
              >
              <home-news
                :content="news"
                v-if="news"
                data-aos="fade"
              ></home-news>
            </v-col>
            <v-col cols="12" sm="12" md="6" class="mb-10">
              <span
                style="display: block; font-size: 32px; color: #444; font-weight: 900; border-bottom: 1px solid #bbb; padding-bottom: 8px; margin-bottom: 50px"
                class="news-title hover"
                @click="$router.push('/news')"
                >ICJIA RESEARCH</span
              >
              <h2 style="color: orange">
                TODO: Add proper images and styling here
              </h2>
              <div v-for="article in articles" :key="article.slug">
                <v-card class="px-5 py-5 mb-5">
                  <p>{{ article.createdAt | format }}</p>
                  <b>{{ article.title }}</b>
                  <p class="mt-3 mb-3">{{ article.authors }}</p>
                  <p>{{ article.abstract }}</p>
                </v-card>
                <!-- <v-img :src="article.thumbnail" max-width="100"></v-img> -->
              </div>
            </v-col>
          </v-row>
        </v-container>
      </template>
    </base-content>
  </div>
</template>

<script>
import HomeCarousel from "@/components/HomeCarousel";
import HomeBoxes from "@/components/HomeBoxes";
import HomeNews from "@/components/HomeNews";
import HomeAbout from "@/components/HomeAbout";
import BaseContent from "@/components/BaseContent";
import {
  getPage,
  getFrontPageNews,
  getRecentArticles
} from "@/services/Content";
import { getHash } from "@/services/Utilities";
// import Illinois from "@/components/Illinois";
export default {
  components: {
    HomeCarousel,
    HomeBoxes,
    HomeNews,
    HomeAbout,

    BaseContent
  },
  data() {
    return {
      loading: true,
      about: null,
      news: null,
      articles: null
    };
  },
  async created() {
    this.loading = true;

    const contentMap = new Map();

    contentMap.set("getPage", {
      hash: getHash("getPage-home"),
      query: getPage,
      params: { slug: "home" }
    });

    contentMap.set("getFrontPageNews", {
      hash: getHash("getFrontPageNews-home"),
      query: getFrontPageNews,
      params: { limit: this.$store.getters.config.frontPageItems.news }
    });

    contentMap.set("getRecentArticles", {
      hash: getHash("getRecentArticles-home"),
      query: getRecentArticles,
      params: {}
    });

    getRecentArticles;

    await this.$store.dispatch("cacheContent", contentMap);

    this.about = this.$store.getters.getContentFromCache(contentMap, "getPage");

    this.news = this.$store.getters.getContentFromCache(
      contentMap,
      "getFrontPageNews"
    );

    this.articles = this.$store.getters.getContentFromCache(
      contentMap,
      "getRecentArticles"
    );

    this.$ga.page({
      page: this.$route.path,
      title: "Home",
      location: window.location.href
    });

    this.loading = false;
  }
};
</script>

<style>
.news-title:hover {
  color: #065f60 !important;
}
</style>
