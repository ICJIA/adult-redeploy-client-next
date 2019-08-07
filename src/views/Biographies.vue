<template>
  <div>
    <base-content :loading="loading" id="baseContentTop">
      <template v-slot:title>
        <v-container
          v-if="content"
          :fluid="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
        >
          <v-layout wrap>
            <v-flex xs12>
              <h1 class="page-title">{{ content[0].title }}</h1>
            </v-flex>
          </v-layout>
        </v-container>
      </template>
      <template v-slot:content>
        <v-container
          v-if="content"
          :fluid="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
          id="scrollArea"
        >
          <v-layout wrap>
            <v-flex :[dynamicFlex]="true">
              <div
                v-html="renderToHtml(content[0].content)"
                v-if="content[0].content"
              ></div>

              <h2 class="mt-12 mb-5" id="oversight-board">Oversight Board</h2>

              <div v-for="(person, index) in board" :key="`board-${index}`">
                <BiographyCard :person="person"></BiographyCard>
              </div>
              <h2 class="mb-5" id="staff">Staff</h2>
              <div v-for="(person, index) in staff" :key="`staff-${index}`">
                <BiographyCard :person="person"></BiographyCard>
              </div>
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
import _ from "lodash/core";
import BaseContent from "@/components/BaseContent";
import BiographyCard from "@/components/BiographyCard";
import TOC from "@/components/TOC";
import { getPageBySection, getAllBiographies } from "@/services/Content";
import { getHash, checkIfValidPage } from "@/services/Utilities";
import { renderToHtml } from "@/services/Markdown";
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
      person: {}
    };
  },
  components: {
    BaseContent,
    BiographyCard,
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
      const section = "about";
      const slug = "biographies";

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

      this.staff = biographyContent.filter(person => {
        return person.category === "staff";
      });

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
