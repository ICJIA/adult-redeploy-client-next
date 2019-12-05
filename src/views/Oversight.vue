<template>
  <div>
    <base-content :loading="loading" id="baseContentTop">
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
          id="scrollArea"
        >
          <v-row>
            <v-col cols="12">
              <div
                v-html="renderToHtml(content[0].content)"
                v-if="content[0].content"
                @click="handleClicks"
                class="dynamic-content mb-12"
              ></div>

              <div v-for="(person, index) in board" :key="`board-${index}`">
                <BiographyCard :person="person"></BiographyCard>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </template>
    </base-content>
  </div>
</template>

<script>
import _ from "lodash/core";
import BaseContent from "@/components/BaseContent";
import BiographyCard from "@/components/BiographyCard";
import { getPageBySection, getAllBiographies } from "@/services/Content";
import { getHash, checkIfValidPage } from "@/services/Utilities";
import { renderToHtml } from "@/services/Markdown";
import { handleClicks } from "@/mixins/handleClicks";
export default {
  data() {
    return {
      loading: true,
      content: null,
      checkIfValidPage,
      renderToHtml,
      showToc: false,
      sectionContent: null,
      staff: null,
      board: null,
      person: {},
      title: ""
    };
  },
  metaInfo() {
    return {
      title: this.computedTitle
    };
  },
  components: {
    BaseContent,
    BiographyCard
  },
  mixins: [handleClicks],
  created() {
    this.fetchContent();
  },
  computed: {
    computedTitle() {
      return this.title;
    },
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
      const section = "about";
      const slug = "oversight";

      const name = `getPageBySection-${section}${slug}`;
      contentMap.set(name, {
        hash: getHash(name),
        query: getPageBySection,
        params: { section, slug }
      });

      const biographies = `getAllBiographies`;
      contentMap.set(biographies, {
        hash: getHash(biographies),
        query: getAllBiographies,
        params: {}
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

      let biographyContent = this.$store.getters.getContentFromCache(
        contentMap,
        biographies
      );

      this.board = biographyContent.filter(person => {
        return person.category === "board";
      });
      this.board = _.sortBy(this.board, "order");

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
    }
  }
};
</script>

<style></style>
