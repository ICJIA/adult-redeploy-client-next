<template>
  <div id="scrollArea">
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
        >
          <v-layout wrap>
            <v-flex :[dynamicFlex]="true">
              <div
                v-html="renderToHtml(content[0].content)"
                v-if="content[0].content"
              ></div>
              <h2 class="mt-12 mb-4" id="oversight-board">Oversight Board</h2>
              <div v-for="n in 20" :key="n">
                <v-card class="mx-auto white mb-8 elevation-1" outlined>
                  <v-list-item three-line>
                    <v-list-item-avatar
                      tile
                      size="80"
                      color="grey"
                    ></v-list-item-avatar>
                    <v-list-item-content>
                      <div
                        class="overline mb-4"
                        style="font-size: 12px !important;"
                      >
                        Director of Illinois Department of Corrections (IDOC),
                        Co-Chair
                      </div>
                      <v-list-item-title class="headline mb-1"
                        >John Baldwin</v-list-item-title
                      >
                      <v-list-item-subtitle
                        >Acting Director, IDOC</v-list-item-subtitle
                      >
                      <div class="mt-5">
                        Quam iter, obstitit dura ferarum terras! Ambo conplexus
                        procul. Aeneae sic procul flammamque conversae late
                        vates tenebras, sanguineae? Cessit gravidus mitissima
                        tenebat et, concipe et exi formae habentem Marte.
                        Contractosque inque vestigia egentes, Phegiaco
                        *conatoque* inquit memorantur Alcathoi et. Mora magno
                        procubuere causa. Imi excidit educat ignara protinus
                        inarata Veneris mediis; tua tibi dextra ferrumque **in**
                        dea nitidaque vulnere quotiens se deus. Omnipotens
                        exire.
                      </div>
                    </v-list-item-content>
                  </v-list-item>
                </v-card>
              </div>
              <h2 class="mt-12 mb-4" id="staff">Staff</h2>
              <div v-for="n in 10" :key="`staff-${n}`">
                <v-card class="mx-auto white mb-8" outlined>
                  <v-list-item three-line>
                    <v-list-item-avatar
                      tile
                      size="80"
                      color="grey"
                    ></v-list-item-avatar>
                    <v-list-item-content>
                      <div class="overline mb-4">OVERLINE</div>
                      <v-list-item-title class="headline mb-1"
                        >Headline 5</v-list-item-title
                      >
                      <v-list-item-subtitle
                        >Greyhound divisely hello coldly
                        fonwderfully</v-list-item-subtitle
                      >
                      <div class="mt-5">
                        Quam iter, obstitit dura ferarum terras! Ambo conplexus
                        procul. Aeneae sic procul flammamque conversae late
                        vates tenebras, sanguineae? Cessit gravidus mitissima
                        tenebat et, concipe et exi formae habentem Marte.
                        Contractosque inque vestigia egentes, Phegiaco
                        *conatoque* inquit memorantur Alcathoi et. Mora magno
                        procubuere causa. Imi excidit educat ignara protinus
                        inarata Veneris mediis; tua tibi dextra ferrumque **in**
                        dea nitidaque vulnere quotiens se deus. Omnipotens
                        exire.
                      </div>
                    </v-list-item-content>
                  </v-list-item>
                </v-card>
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
import BaseContent from "@/components/BaseContent";
import TOC from "@/components/TOC";
import { getPageBySection } from "@/services/Content";
import { getHash, checkIfValidPage } from "@/services/Utilities";
import { renderToHtml } from "@/services/Markdown";
export default {
  watch: {
    $route: "fetchContent"
  },
  data() {
    return {
      loading: true,
      content: null,
      checkIfValidPage,
      renderToHtml,
      showToc: false,
      sectionContent: null
    };
  },
  components: {
    BaseContent,
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

      this.loading = false;
    },
    routeToError() {
      this.content = null;
      this.loading = false;
      this.$router.push({
        name: "error",
        params: {
          msg: "Page not found",
          statusCode: 404,
          debug: this.$route.params
        }
      });
    }
  }
};
</script>

<style></style>
