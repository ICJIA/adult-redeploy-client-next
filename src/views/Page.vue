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
          <v-layout wrap>
            <v-flex :[dynamicFlex]="true">
              <div v-html="renderToHtml(content[0].content)"></div>
            </v-flex>
            <v-flex xs2 v-if="showToc"><TOC></TOC></v-flex>
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
      return this.showToc ? "xs10" : "xs12";
    }
  },

  methods: {
    async fetchContent() {
      this.loading = true;

      const contentMap = new Map();
      const section = this.$route.params.section;
      const slug = this.$route.params.slug;

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

      console.log(this.sectionContent);

      this.content = this.sectionContent[0].pages;

      if (checkIfValidPage(this.content)) {
        this.showToc = this.content[0].showToc;
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
        params: { msg: "Page not found", statusCode: 404 }
      });
    }
  }
};
</script>

<style></style>
