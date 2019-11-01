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
          id="scrollArea"
          :fluid="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
        >
          <v-row>
            <!-- eslint-disable-next-line vuetify/grid-unknown-attributes -->
            <v-col :[dynamicFlex]="true" order-md="1" order="2" order-sm="2">
              <div
                @click="handleClicks"
                class="dynamic-content"
                v-html="renderToHtml(content[0].content)"
                v-if="content[0].content"
              ></div>
              <toggle
                toggleOn="By Category"
                toggleOff="By Publication Date"
                name="resources"
              ></toggle>
              <div v-if="displayMode.message === 'By Category'">
                <div
                  v-for="category in $store.getters.config.strapiEnums
                    .resources"
                  :key="category.enum"
                >
                  <div v-if="checkCategoryLength(category)">
                    <h2 :id="category.slug">{{ category.title }}</h2>
                    <p
                      v-html="category.description"
                      v-if="category.description"
                      @click="handleClicks"
                      class="dynamic-content"
                    ></p>
                    <DetailTableResource
                      :resources="filterResourceData(category.enum)"
                      :hideCategory="true"
                      class="mt-8 "
                      :class="{
                        'pl-6':
                          $vuetify.breakpoint.md ||
                          $vuetify.breakpoint.lg ||
                          $vuetify.breakpoint.xl,
                        'pr-6':
                          $vuetify.breakpoint.md ||
                          $vuetify.breakpoint.lg ||
                          $vuetify.breakpoint.xl
                      }"
                    ></DetailTableResource>
                  </div>
                </div>
              </div>
              <div v-if="displayMode.message === 'By Publication Date'">
                <DetailTableResource
                  :resources="resources"
                  class="mt-8 "
                  :class="{
                    'pl-6':
                      $vuetify.breakpoint.md ||
                      $vuetify.breakpoint.lg ||
                      $vuetify.breakpoint.xl,
                    'pr-6':
                      $vuetify.breakpoint.md ||
                      $vuetify.breakpoint.lg ||
                      $vuetify.breakpoint.xl
                  }"
                  :hideCategory="false"
                ></DetailTableResource>
              </div>
            </v-col>
            <v-col
              cols="12"
              sm="12"
              md="2"
              order-md="2"
              order="1"
              order-sm="1"
              v-if="showToc && displayMode.message === 'By Category'"
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
import DetailTableResource from "@/components/DetailTableResource";
import { EventBus } from "@/event-bus";
import TOC from "@/components/TOC";
import Toggle from "@/components/Toggle";
import { getPageBySection, getAllResources } from "@/services/Content";
import { getHash, checkIfValidPage } from "@/services/Utilities";
import { renderToHtml } from "@/services/Markdown";
import { handleClicks } from "@/mixins/handleClicks";
export default {
  watch: {
    $route: "fetchContent"
  },
  mixins: [handleClicks],
  data() {
    return {
      loading: true,
      content: null,
      checkIfValidPage,
      renderToHtml,
      showToc: false,
      sectionContent: null,
      displayMode: {},
      resources: null
    };
  },
  components: {
    BaseContent,
    DetailTableResource,
    TOC,
    Toggle
  },
  created() {
    this.fetchContent();
  },
  mounted() {
    EventBus.$on("toggle", payload => {
      this.displayMode = payload;
    });
  },
  computed: {
    dynamicFlex() {
      if (this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm) {
        return "xs12";
      } else if (this.displayMode.message === "By Publication Date") {
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
      const section = "resources";
      const slug = "resources";

      const name = `getPageBySection-${section}${slug}`;
      contentMap.set(name, {
        hash: getHash(name),
        query: getPageBySection,
        params: { section, slug }
      });

      const resourcesName = "getAllResources";
      contentMap.set(resourcesName, {
        hash: getHash(resourcesName),
        query: getAllResources,
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

      this.resources = this.$store.getters.getContentFromCache(
        contentMap,
        resourcesName
      );

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
    filterResourceData(categoryEnum) {
      return this.resources.filter(resource => {
        return resource.category === categoryEnum;
      });
    },
    checkCategoryLength(category) {
      let test = this.resources.filter(resource => {
        return resource.category === category.enum;
      });
      if (test.length) {
        return true;
      } else {
        return false;
      }
    }
  }
};
</script>

<style></style>
