<template>
  <div>
    <base-content :loading="loading">
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
        >
          <v-row>
            <v-col cols="12" class="mb-10">
              <div
                @click="handleClicks"
                class="dynamic-content"
                v-html="renderToHtml(content[0].content)"
                v-if="content[0].content"
              ></div
            ></v-col>
          </v-row>
        </v-container>
        <v-container :fluid="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm">
          <v-row>
            <v-col cols="12" sm="6" md="6">
              <div>
                <site-illinois :maxWidth="400"></site-illinois>
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="6">
              <SiteDescription
                :class="{ pull: $vuetify.breakpoint.xs }"
              ></SiteDescription>
            </v-col>
          </v-row>
        </v-container>
      </template>
    </base-content>
  </div>
</template>

<script>
import { renderToHtml } from "@/services/Markdown";
import BaseContent from "@/components/BaseContent";
import { getPageBySection } from "@/services/Content";
import { getHash, checkIfValidPage } from "@/services/Utilities";
import SiteDescription from "@/components/SiteDescription";
import SiteIllinois from "@/components/SiteIllinois";

import { handleClicks } from "@/mixins/handleClicks";
export default {
  mixins: [handleClicks],
  components: {
    SiteIllinois,
    BaseContent,
    SiteDescription
  },
  data() {
    return {
      loading: false,
      content: null,
      renderToHtml
    };
  },
  created() {
    this.fetchContent();
    this.$store.dispatch("setSelectedCountyData", null);
  },
  methods: {
    async fetchContent() {
      this.loading = true;

      const contentMap = new Map();
      const section = "programs";
      const slug = "local-programs";

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
      //console.log(this.sectionContent);
      this.loading = false;
    },
    routeToError() {
      this.content = null;
      this.loading = false;
      this.$router
        .push({
          name: "error",
          params: { msg: "Page not found", statusCode: 404 }
        })
        // eslint-disable-next-line no-unused-vars
        .catch(err => {
          this.$vuetify.goTo(0);
        });
    }
  },
  props: {
    display: {
      type: String,
      default: "modal"
    }
  }
};
</script>

<style>
.pull {
  margin-top: -75px;
}
</style>
