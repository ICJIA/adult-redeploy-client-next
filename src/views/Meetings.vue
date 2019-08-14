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
          id="scrollArea"
          :fluid="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
        >
          <v-layout wrap>
            <v-flex :[dynamicFlex]="true">
              <div
                v-html="renderToHtml(content[0].content)"
                v-if="content[0].content"
                @click="handleClicks"
                class="dynamic-content"
              ></div>
              <toggle on="By Category" off="By Date" name="meetings"></toggle>
              <div v-if="displayMode.message === 'By Category'">
                <div
                  v-for="category in $store.getters.config.categoryEnums
                    .meetings"
                  :key="category.enum"
                  class="mb-12"
                >
                  <h2 :id="category.slug">{{ category.title }}</h2>
                  <p
                    v-html="category.description"
                    v-if="category.description"
                    @click="handleClicks"
                    class="dynamic-content"
                  ></p>

                  <DetailTableMeeting
                    :meetings="filterMeetingData(category.enum)"
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
                  ></DetailTableMeeting>
                </div>
              </div>
              <div v-if="displayMode.message === 'By Date'">
                <DetailTableMeeting
                  :meetings="meetings"
                  class="mt-8 "
                  :hideCategory="false"
                ></DetailTableMeeting>
              </div>
            </v-flex>

            <v-flex
              xs2
              v-if="showToc && displayMode.message === 'By Category'"
              class="hidden-sm-and-down"
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
import { EventBus } from "@/event-bus";
import DetailTableMeeting from "@/components/DetailTableMeeting";
import TOC from "@/components/TOC";
import { getPageBySection, getAllMeetings } from "@/services/Content";
import { getHash, checkIfValidPage } from "@/services/Utilities";
import { renderToHtml } from "@/services/Markdown";
import { handleClicks } from "@/mixins/handleClicks";
import Toggle from "@/components/Toggle";
export default {
  mixins: [handleClicks],
  data() {
    return {
      loading: true,
      content: null,
      checkIfValidPage,
      renderToHtml,
      showToc: false,
      sectionContent: null,
      meetings: null,
      displayMode: {}
    };
  },
  components: {
    BaseContent,
    TOC,
    DetailTableMeeting,
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
      } else if (this.displayMode.message === "By Date") {
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
      const slug = "meetings";

      const name = `getPageBySection-${section}${slug}`;
      contentMap.set(name, {
        hash: getHash(name),
        query: getPageBySection,
        params: { section, slug }
      });

      const meetingsName = "getAllMeetings";
      contentMap.set(meetingsName, {
        hash: getHash(meetingsName),
        query: getAllMeetings,
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

      this.meetings = this.$store.getters.getContentFromCache(
        contentMap,
        meetingsName
      );

      this.loading = false;
    },
    filterMeetingData(categoryEnum) {
      return this.meetings.filter(meeting => {
        return meeting.category === categoryEnum;
      });
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
