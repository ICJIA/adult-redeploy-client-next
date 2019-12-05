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
              <h1 class="page-title">{{ content[0].title }}</h1>
            </v-col>
          </v-row>
        </v-container>
      </template>
      <template v-slot:content>
        <v-container
          v-if="content"
          :fluid="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
        >
          <v-row v-if="content[0].summary">
            <v-col cols="12">
              <div
                v-html="renderToHtml(content[0].summary)"
                @click="handleClicks"
                class="dynamic-content"
              ></div>
              <base-list :items="sites">
                <template slot-scope="item">
                  <v-container
                    :fluid="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
                  >
                    <v-col cols="12" class="mt-12">
                      <SiteDescriptionCard
                        :content="[...item]"
                      ></SiteDescriptionCard>
                    </v-col>
                  </v-container>
                </template>
              </base-list>
            </v-col>
          </v-row>
        </v-container>
      </template>
    </base-content>
  </div>
</template>

<script>
import BaseContent from "@/components/BaseContent";
import BaseList from "@/components/BaseList";
import SiteDescriptionCard from "@/components/SiteDescriptionCard";

import { getAllSiteDescriptions, getPageBySection } from "@/services/Content";
import { getHash, checkIfValidPage } from "@/services/Utilities";
import { renderToHtml } from "@/services/Markdown";
import { handleClicks } from "@/mixins/handleClicks";
export default {
  watch: {
    $route: "fetchContent"
  },
  metaInfo() {
    return {
      title: this.title
    };
  },
  mixins: [handleClicks],
  data() {
    return {
      loading: true,
      content: null,
      checkIfValidPage,
      renderToHtml,
      showToc: true,
      sectionContent: null,
      descriptionDisplay: [],
      expand: false,
      sites: null,
      title: "All Sites"
    };
  },
  components: {
    BaseContent,
    BaseList,
    SiteDescriptionCard
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

      this.$ga.page({
        page: this.$route.path,
        title: this.title,
        location: window.location.href
      });

      this.loading = false;
    },
    print() {
      window.print();
    },

    routeToError() {
      this.content = null;
      this.loading = false;
      this.$router
        .push({
          name: "error",
          params: {
            msg: "Page not found",
            statusCode: 404,
            debug: this.$route.params
          }
        })
        // eslint-disable-next-line no-unused-vars
        .catch(err => {});
    }
  }
};
</script>

<style>
.markdown-body h2 {
  margin-bottom: 15px;
}
</style>
