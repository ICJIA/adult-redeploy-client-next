<template>
  <div>
    <base-content :loading="loading">
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
          :fluid="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
          data-aos="fade-right"
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
                <site-illinois
                  :maxWidth="400"
                  data-aos="fade-right"
                ></site-illinois>
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="6">
              <SiteDescription
                :class="{ pull: $vuetify.breakpoint.xs }"
                data-aos="fade-left"
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
import {
  getHash,
  checkIfValidPage,
  getSectionContent
} from "@/services/Utilities";
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
  metaInfo() {
    return {
      title: "Local Programs"
    };
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

      this.content = getSectionContent(this.$store.state.sections, "programs");
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
