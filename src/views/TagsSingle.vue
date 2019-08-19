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
              <h1 class="page-title">{{ content[0].name }}</h1>
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
            <v-col
              cols="12"
              sm="12"
              :md="dynamicFlex()"
              order-md="1"
              order="2"
              order-sm="2"
              style="margin-top: -50px"
            >
              <div
                v-for="(item, index) in $store.getters.config.taggableContent"
                :key="index"
              >
                <div v-if="content[0][item.plural]">
                  <div v-if="content[0][item.plural].length">
                    <h2 :id="item.slug">
                      <span v-if="item.alias">{{ item.alias | titleCase }}</span
                      ><span v-else>{{ item.plural | titleCase }}</span>
                    </h2>
                    <!-- {{ content[0][item.plural] }} -->

                    <component
                      :is="item.listComponent"
                      :items="content[0][item.plural]"
                      :rows-per-page="-1"
                      :displayContentType="true"
                      :contentType="item.type"
                      :singletonPath="item.singletonPath"
                      :appendCategory="item.appendCategory"
                      class="mb-5"
                    />
                  </div>
                </div>
              </div>
            </v-col>
            <v-col
              cols="12"
              sm="12"
              md="2"
              order-md="2"
              order="1"
              order-sm="1"
              v-if="showToc"
              ><TOC
                selector="#scrollArea"
                top="#baseContentTop"
                tocHeading="Tagged Categories"
              ></TOC
            ></v-col>
          </v-row>
        </v-container>
      </template>
    </base-content>
  </div>
</template>

<script>
import BaseContent from "@/components/BaseContent";
import ListTable from "@/components/ListTable";
import ListTableBiography from "@/components/ListTableBiography";

import TOC from "@/components/TOC";

import { getContentByTag } from "@/services/Content";
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
      showToc: true,
      sectionContent: null
    };
  },
  components: {
    BaseContent,
    TOC,
    ListTable,
    ListTableBiography
  },
  created() {
    this.fetchContent();
  },
  computed: {},

  methods: {
    dynamicFlex() {
      if (this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm) {
        return "12";
      } else {
        return this.showToc ? "10" : "12";
      }
    },
    async fetchContent() {
      this.loading = true;

      const contentMap = new Map();

      const slug = this.$route.params.slug.toLowerCase();

      const name = `getContentByTag-${slug}`;
      contentMap.set(name, {
        hash: getHash(name),
        query: getContentByTag,
        params: { slug }
      });

      await this.$store.dispatch("cacheContent", contentMap);

      this.content = this.$store.getters.getContentFromCache(contentMap, name);

      if (checkIfValidPage(this.content)) {
        this.showToc = true;
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
    }
  }
};
</script>

<style></style>
