<template>
  <div>
    <base-content
      :loading="loading"
      id="baseContentTop"
      v-if="resourceCategory"
    >
      <template v-slot:title>
        <v-container :fluid="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm">
          <v-row>
            <v-col cols="12">
              <h1 class="page-title">{{ categoryTitle }}</h1>
            </v-col>
          </v-row>
        </v-container>
      </template>
      <template v-slot:content>
        <v-container v-if="resourceCategory" id="scrollArea">
          <v-row>
            <v-col>
              <div>
                <ListTableResource
                  :items="resourceCategory"
                  :hideCategory="false"
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
                ></ListTableResource>
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
import ListTableResource from "@/components/ListTableResource";
// eslint-disable-next-line no-unused-vars
import { EventBus } from "@/event-bus";

import { getResourcesByCategory } from "@/services/Content";
import {
  getHash,
  checkIfValidPage,
  strapiSlugToObject
} from "@/services/Utilities";
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
      resources: null,
      categoryTitle: "",
      categoryDescription: "",
      resourceCategory: null
    };
  },
  components: {
    BaseContent,

    ListTableResource
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
      const strapiEnum = strapiSlugToObject(
        "resources",
        this.$route.params.category
      );

      if (strapiEnum.length) {
        const category = strapiEnum[0].enum;
        this.categoryTitle = strapiEnum[0].title;
        this.categoryDescription = category[0].description;
        const resourcesName = "getResourceByCategory" + "_" + category;
        contentMap.set(resourcesName, {
          hash: getHash(resourcesName),
          query: getResourcesByCategory,
          params: { category }
        });

        await this.$store.dispatch("cacheContent", contentMap);

        this.resourceCategory = this.$store.getters.getContentFromCache(
          contentMap,
          resourcesName
        );
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
