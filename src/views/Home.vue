<template>
  <div>
    <home-carousel></home-carousel>
    <home-boxes></home-boxes>

    <base-content :loading="loading">
      <template v-slot:content>
        <v-container>
          <v-layout wrap>
            <v-flex
              xs12
              sm12
              md6
              style="padding-left: 30px; padding-right: 30px"
              class="mb-10"
            >
              <h2 class="heavy rule uppercase">
                About Adult Redeploy Illinois
              </h2>

              <home-about :content="about"></home-about>
            </v-flex>

            <v-flex xs12 sm12 md6 class="mb-10">
              <h2 class="heavy rule uppercase">News & Events</h2>
              <home-news :content="news"></home-news>
            </v-flex>
          </v-layout>
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
import { getPage, getFrontPageNews } from "@/services/Content";
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
      about: [],
      news: []
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
      params: { limit: 3 }
    });

    let res = await this.$store.dispatch("cacheContent", contentMap);
    console.log(res);

    this.about = this.$store.getters.getContentFromCache(contentMap, "getPage");

    this.news = this.$store.getters.getContentFromCache(
      contentMap,
      "getFrontPageNews"
    );

    this.loading = false;
  }
};
</script>

<style></style>
