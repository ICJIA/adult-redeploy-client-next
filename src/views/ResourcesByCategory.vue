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
              <h1 class="page-title">{{ $route.params.category }}</h1>
            </v-col>
          </v-row>
        </v-container>
      </template>
      <template v-slot:content>
        <v-container v-if="resourceCategory" id="scrollArea">
          <v-row>
            <v-col>
              <div>
                {{ resourceCategory }}
                <!-- <div
                  v-for="category in $store.getters.config.categoryEnums
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
                </div> -->
              </div>
            </v-col>
          </v-row>
        </v-container>
      </template>
    </base-content>
  </div>
</template>

<script>
import BaseContent from "@/components/BaseContent";
import DetailTableResource from "@/components/DetailTableResource";
// eslint-disable-next-line no-unused-vars
import { EventBus } from "@/event-bus";

import { getResourceByCategory } from "@/services/Content";
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
    // eslint-disable-next-line vue/no-unused-components
    DetailTableResource
  },
  created() {
    this.fetchContent();
  },
  mounted() {},
  computed: {},

  methods: {
    async fetchContent() {
      this.loading = true;

      const contentMap = new Map();
      let category = "webinar";
      const resourcesName = "getResourceByCategory" + "_" + category;
      contentMap.set(resourcesName, {
        hash: getHash(resourcesName),
        query: getResourceByCategory,
        params: { category }
      });

      await this.$store.dispatch("cacheContent", contentMap);

      this.resourceCategory = this.$store.getters.getContentFromCache(
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
