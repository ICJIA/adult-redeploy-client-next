<template>
  <div>
    <base-content :loading="loading" id="baseContentTop">
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
        <v-container v-if="content" id="scrollArea">
          <v-layout wrap>
            <v-flex :[dynamicFlex]="true">
              <div v-html="renderToHtml(content[0].content)"></div>
            </v-flex>
            <v-flex xs2 v-if="showToc" class="hidden-sm-and-down"
              ><TOC selector="#scrollArea" top="#baseContentTop"></TOC
            ></v-flex>
          </v-layout>
        </v-container>
      </template>
    </base-content>
  </div>
</template>

<script>
import BaseContent from "@/components/BaseContent";
import TOC from "@/components/TOC";
import { getPageBySection } from "@/services/Content";
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
      sectionContent: null
    };
  },
  components: {
    BaseContent,
    TOC
  },
  created() {
    this.fetchContent();
  },
  computed: {
    dynamicFlex() {
      if (this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm) {
        return "xs12";
      } else {
        return this.showToc ? "xs10" : "xs12";
      }
    }
  },

  methods: {
    async fetchContent() {
      this.loading = true;

      const contentMap = new Map();
      const section = this.$route.params.section.toLowerCase();
      const slug = this.$route.params.slug.toLowerCase();

      const name = `getPageBySection-${section}${slug}`;
      contentMap.set(name, {
        hash: getHash(name),
        query: getPageBySection,
        params: { section, slug }
      });

      await this.$store.dispatch("cacheContent", contentMap);

      this.sectionContent = this.$store.getters.getContentFromCache(
        contentMap,
        name
      );

      if (checkIfValidPage(this.sectionContent)) {
        this.content = this.sectionContent[0].pages;

        if (checkIfValidPage(this.content)) {
          this.showToc = this.content[0].showToc;
        } else {
          this.routeToError();
        }
      } else {
        this.routeToError();
      }

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

<style></style>
