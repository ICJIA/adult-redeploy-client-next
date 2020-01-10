<template>
  <div>
    <div v-if="!$browserDetect.isIE">
      <home-carousel></home-carousel>
      <home-boxes></home-boxes>
    </div>

    <base-content :loading="loading">
      <template v-slot:content>
        <v-container fluid style="margin: 0; padding: 0">
          <v-row>
            <v-col
              cols="12"
              sm="12"
              :md="upcomingMeetings ? 8 : 12"
              style="padding-left: 30px; padding-right: 30px"
              class="mb-10"
            >
              <span
                style="display: block; font-size: 32px; color: #444; font-weight: 900; border-bottom: 1px solid #bbb; padding-bottom: 8px; margin-bottom: 50px"
                class="news-title hover"
                @click="$router.push('/about/overview')"
              >ABOUT ADULT REDEPLOY ILLINOIS</span>

              <home-about :content="about" v-if="about" data-aos="fade"></home-about>
            </v-col>

            <v-col
              cols="12"
              sm="12"
              md="4"
              style="padding-left: 30px; padding-right: 30px"
              class="mb-10"
              v-if="upcomingMeetings"
            >
              <home-meetings :content="upcoming" v-if="upcoming" data-aos="fade"></home-meetings>
            </v-col>

            <v-col cols="12" sm="12" md="6" class="mb-10">
              <span
                style="display: block; font-size: 32px; color: #444; font-weight: 900; border-bottom: 1px solid #bbb; padding-bottom: 8px; margin-bottom: 50px"
                class="news-title hover"
                @click="$router.push('/news')"
              >ARI NEWS</span>
              <home-news :content="news" v-if="news" data-aos="fade"></home-news>
            </v-col>
            <v-col cols="12" sm="12" md="6" class="mb-10">
              <span
                style="display: block; width: 100%; font-size: 32px; color: #444; font-weight: 900; border-bottom: 1px solid #bbb; padding-bottom: 8px; margin-bottom: 50px"
                class="news-title hover"
                @click="$router.push('/news')"
              >ICJIA PUBLICATIONS</span>
              <HomeArticles style="margin: 0; padding: 0; width: 100%"></HomeArticles>
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
import HomeArticles from "@/components/HomeArticles";
import HomeMeetings from "@/components/HomeMeetings";
import BaseContent from "@/components/BaseContent";
import {
  getPage,
  getFrontPageNews,
  getRecentArticles,
  getUpcomingMeetings
} from "@/services/Content";
import { getHash } from "@/services/Utilities";
import moment from "moment";

// import Illinois from "@/components/Illinois";
export default {
  components: {
    HomeCarousel,
    HomeBoxes,
    HomeNews,
    HomeAbout,
    HomeArticles,
    HomeMeetings,
    BaseContent
  },
  computed: {
    upcomingMeetings() {
      return this.upcoming.length ? true : false;
    }
  },
  data() {
    return {
      loading: true,
      about: null,
      news: null,
      upcoming: null
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

    const targetDate = moment()
      .subtract(1, "d")
      .format();
    //console.log(targetDate);
    contentMap.set("getUpcomingMeetings", {
      hash: getHash("getUpcomingMeetings-home"),
      query: getUpcomingMeetings,
      params: {
        targetDate,
        limit: this.$store.getters.config.frontPageItems.meetings
      }
    });

    await this.$store.dispatch("cacheContent", contentMap);

    this.about = this.$store.getters.getContentFromCache(contentMap, "getPage");

    this.news = this.$store.getters.getContentFromCache(
      contentMap,
      "getFrontPageNews"
    );

    this.upcoming = this.$store.getters.getContentFromCache(
      contentMap,
      "getUpcomingMeetings"
    );

    console.log(this.upcoming);

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
