<template>
  <div>
    <base-content :loading="loading" id="baseContentTop">
      <template v-slot:title>
        <v-container
          v-if="content"
          :fluid="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
          data-aos="fade-right"
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
          id="scrollArea"
          :fluid="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
          data-aos="fade-right"
        >
          <v-row>
            <v-col
              cols="12"
              sm="12"
              :md="dynamicFlex()"
              order-md="1"
              order="2"
              order-sm="2"
            >
              <div
                @click="handleClicks"
                class="dynamic-content"
                v-html="renderToHtml(content[0].content)"
                v-if="content[0].content"
              ></div>
              <TagList :tags="content[0].tags" class="mt-5"></TagList>
            </v-col>
            <v-col
              cols="12"
              sm="12"
              md="2"
              order-md="2"
              order="1"
              order-sm="1"
              v-if="showToc"
              ><TOC selector="#scrollArea" top="#baseContentTop"></TOC
            ></v-col>
          </v-row>
        </v-container>
      </template>
    </base-content>
  </div>
</template>

<script>
import BaseContent from "@/components/BaseContent";
import TagList from "@/components/TagList";
import TOC from "@/components/TOC";

import { getPageBySection } from "@/services/Content";
import { getHash, checkIfValidPage } from "@/services/Utilities";
import { renderToHtml } from "@/services/Markdown";
import { handleClicks } from "@/mixins/handleClicks";
export default {
  watch: {
    $route: "fetchContent"
  },
  mixins: [handleClicks],
  metaInfo() {
    return {
      title: this.computedTitle
    };
  },
  data() {
    return {
      loading: true,
      content: null,
      checkIfValidPage,
      renderToHtml,
      showToc: false,
      sectionContent: null,
      title: ""
    };
  },
  components: {
    BaseContent,
    TOC,
    TagList
  },
  created() {
    this.fetchContent();
  },
  computed: {
    computedTitle() {
      return this.title;
    }
  },
  mounted() {},

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
          this.title = this.content[0].title;
          this.$ga.page({
            page: this.$route.path,
            title: this.title,
            location: window.location.href
          });
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
    },
    dynamicFlex() {
      if (this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm) {
        return "12";
      } else {
        return this.showToc ? "10" : "12";
      }
    }
  }
};
</script>

<style>
.dynamic-content ul {
  margin-bottom: 20px;
}
</style>
