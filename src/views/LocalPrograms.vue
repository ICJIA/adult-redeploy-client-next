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
            <v-flex xs12 class="mb-10">
              {{ content[0].content }}
            </v-flex>
          </v-layout>
        </v-container>
      </template>
      <template v-slot:special>
        <v-container>
          <v-layout wrap>
            <v-flex xs12 sm6 md6>
              <div>
                <site-illinois :maxWidth="400"></site-illinois>
              </div>
            </v-flex>
            <v-flex xs12 sm6 md6>
              <SiteDescription
                :class="{ pull: $vuetify.breakpoint.xs }"
              ></SiteDescription>
            </v-flex>
          </v-layout>
        </v-container>
      </template>
    </base-content>
  </div>
</template>

<script>
import BaseContent from "@/components/BaseContent";
import { getPageBySection } from "@/services/Content";
import { getHash, checkIfValidPage } from "@/services/Utilities";
import SiteDescription from "@/components/SiteDescription";
import SiteIllinois from "@/components/SiteIllinois";
// import { renderToHtml } from "@/services/Markdown";
export default {
  components: {
    SiteIllinois,
    BaseContent,
    SiteDescription
  },
  data() {
    return {
      loading: false,
      content: null
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
      this.$router.push({
        name: "error",
        params: { msg: "Page not found", statusCode: 404 }
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
