<template>
  <div>
    <base-content :loading="loading">
      <template v-slot:title>
        <v-container v-if="content">
          <v-layout wrap>
            <v-flex xs12>
              <h1 class="page-title">{{ content[0].title }}</h1>
            </v-flex>
          </v-layout>
        </v-container>
      </template>
      <template v-slot:content>
        <v-container v-if="content">
          <v-layout wrap v-if="content[0].summary">
            <v-flex :[dynamicFlex]="true">
              <div v-html="renderToHtml(content[0].summary)"></div>
            </v-flex>
            <v-flex xs2 v-if="showToc"><TOC></TOC></v-flex>
          </v-layout>
        </v-container>
      </template>
      <template slot="site-list" v-if="sites">
        <base-list :items="sites">
          <template slot-scope="item">
            <v-container>
              <v-flex xs12>
                <v-card class="mx-auto" color="white" v-if="sites">
                  <v-card-title class="site-desription-title px-3">{{
                    item.title
                  }}</v-card-title>
                  <v-card-text>
                    <div
                      v-html="renderToHtml(item.content)"
                      class="markdown-body"
                    ></div>
                  </v-card-text>
                  <v-card-actions class="hover py-3 px-3"> </v-card-actions>
                </v-card>
              </v-flex>
            </v-container>
          </template>
        </base-list>
      </template>
    </base-content>
  </div>
</template>

<script>
import BaseContent from "@/components/BaseContent";
import BaseList from "@/components/BaseList";

import { getAllSiteDescriptions, getPageBySection } from "@/services/Content";
import { getHash, checkIfValidPage } from "@/services/Utilities";
import { renderToHtml } from "@/services/Markdown";
export default {
  watch: {
    $route: "fetchContent"
  },
  data() {
    return {
      loading: true,
      content: null,
      checkIfValidPage,
      renderToHtml,
      showToc: false,
      sectionContent: null,
      descriptionDisplay: [],
      expand: false,
      sites: null
    };
  },
  components: {
    BaseContent,
    BaseList
  },
  created() {
    this.fetchContent();
  },
  computed: {
    dynamicFlex() {
      return this.showToc ? "xs10" : "xs12";
    }
  },

  methods: {
    async fetchContent() {
      this.loading = true;

      const contentMap = new Map();
      const section = "sites";
      const slug = "sites";

      const getPageName = `getPageBySection-${section}${slug}`;

      contentMap.set(getPageName, {
        hash: getHash(getPageName),
        query: getPageBySection,
        params: { section, slug }
      });

      const getSitesName = "getAllSiteDescriptions";

      contentMap.set(getSitesName, {
        hash: getHash(getSitesName),
        query: getAllSiteDescriptions,
        params: {}
      });

      await this.$store.dispatch("cacheContent", contentMap);

      this.content = this.$store.getters.getContentFromCache(
        contentMap,
        getPageName
      );
      this.sites = this.$store.getters.getContentFromCache(
        contentMap,
        getSitesName
      );

      this.loading = false;
    },

    routeToError() {
      this.content = null;
      this.loading = false;
      this.$router.push({
        name: "error",
        params: {
          msg: "Page not found",
          statusCode: 404,
          debug: this.$route.params
        }
      });
    }
  }
};
</script>

<style>
.markdown-body h2 {
  margin-bottom: 15px;
}
</style>
