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
              <!-- <div class="text-right noprint my-10">
                <v-btn small @click="print"
                  >Print<v-icon right>print</v-icon></v-btn
                >
              </div> -->
            </v-flex>
          </v-layout>
        </v-container>
      </template>
      <template v-slot:content>
        <v-container
          v-if="content"
          :fluid="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
        >
          <v-layout wrap v-if="content[0].summary">
            <v-flex :[dynamicFlex]="true">
              <div v-html="renderToHtml(content[0].summary)"></div>
            </v-flex>
            <v-flex xs2 v-if="showToc"><TOC></TOC></v-flex>
            <v-flex xs12 v-if="sites">
              <base-list :items="sites">
                <template slot-scope="item">
                  <v-container
                    :fluid="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
                  >
                    <v-flex xs12 class="mt-12">
                      <BaseDescription :content="[...item]"></BaseDescription>
                    </v-flex>
                  </v-container>
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
import BaseDescription from "@/components/BaseDescription";

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
    BaseList,
    BaseDescription
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
