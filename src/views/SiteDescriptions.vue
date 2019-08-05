<template>
  <div>
    <base-content :loading="loading">
      <template v-slot:title>
        <v-container v-if="content">
          <v-layout wrap>
            <v-flex xs12>
              <h1 class="page-title">Site Descriptions</h1>
            </v-flex>
          </v-layout>
        </v-container>
      </template>
      <template slot="site-list" v-if="content">
        <base-list :items="content">
          <template slot-scope="item">
            <v-container>
              <v-flex xs12>
                <v-hover v-slot:default="{ hover }">
                  <v-card
                    class="mx-auto"
                    color="white"
                    v-if="content"
                    :elevation="hover ? 18 : 2"
                    @click="toggleDisplay(item.slug)"
                  >
                    <v-card-title class="site-desription-title px-3">{{
                      item.title
                    }}</v-card-title>
                    <v-card-text>
                      <div
                        v-html="displayContent(item)"
                        class="markdown-body"
                      ></div>
                    </v-card-text>
                    <v-card-actions
                      @click.stop="toggleDisplay(item.slug)"
                      class="hover"
                    >
                      {{ toggleMoreLess(item.slug) }}
                    </v-card-actions>
                  </v-card>
                </v-hover>
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

import { getAllSiteDescriptions } from "@/services/Content";
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
      descriptionDisplay: []
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

      const name = `getAllSiteDescriptions`;
      contentMap.set(name, {
        hash: getHash(name),
        query: getAllSiteDescriptions,
        params: {}
      });

      await this.$store.dispatch("cacheContent", contentMap);

      this.content = this.$store.getters.getContentFromCache(contentMap, name);

      let descriptionDisplay = this.content.map(site => {
        let obj = {};
        obj.slug = site.slug;
        obj.showSummary = true;
        return obj;
      });

      this.descriptionDisplay = descriptionDisplay;

      this.loading = false;
    },
    toggleDisplay(slug) {
      this.descriptionDisplay.filter(item => {
        if (item.slug === slug) {
          return (item.showSummary = !item.showSummary);
        }
      });
    },
    toggleMoreLess(slug) {
      let display = this.descriptionDisplay.filter(item => {
        if (item.slug === slug) {
          return item;
        }
      });
      if (display[0].showSummary) {
        return "More";
      } else {
        return "Less";
      }
    },
    displayContent(site) {
      const display = this.descriptionDisplay.filter(item => {
        if (item.slug === site.slug) {
          return item;
        }
      });
      if (display[0].showSummary) {
        return site.summary;
      } else {
        return this.renderToHtml(site.content);
      }
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
