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
            <v-col
              cols="12"
              sm="12"
              :md="dynamicFlex()"
              order-md="1"
              order="2"
              order-sm="2"
            >
              <div
                v-html="renderToHtml(content[0].content)"
                v-if="content[0].content"
                @click="handleClicks"
                class="dynamic-content"
              ></div>

              <toggle
                toggleOn="By Category"
                toggleOff="By Date"
                name="meetings"
                class="mt-10"
              ></toggle>
              <div v-if="displayMode.message === 'By Category'">
                <div
                  v-for="category in $store.getters.config.strapiEnums.meetings"
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

                  <ListTableMeeting
                    :items="filterMeetingData(category.enum)"
                    class="mt-8 "
                    :hideCategory="true"
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
                  ></ListTableMeeting>
                </div>
              </div>
              <div v-if="displayMode.message === 'By Date'">
                <ListTableMeeting
                  :items="meetings"
                  class="mt-8 "
                  :hideCategory="false"
                ></ListTableMeeting>
              </div>
            </v-col>

            <v-col
              cols="12"
              sm="12"
              md="2"
              order-md="2"
              order="1"
              order-sm="1"
              v-if="displayMode.message === 'By Category'"
              ><TOC
                selector="#scrollArea"
                top="#baseContentTop"
                tocHeading="Categories"
              ></TOC
            ></v-col>
          </v-row>
          <v-row>
            <v-col>
              <p>
                For meeting materials prior to 2019, please see
                <a href="https://archive.icjia.cloud/files/adult-redeploy"
                  >the ARI archives</a
                >.
              </p>
            </v-col>
          </v-row>
        </v-container>
      </template>
    </base-content>
  </div>
</template>

<script>
import BaseContent from "@/components/BaseContent";
import { EventBus } from "@/event-bus";
import ListTableMeeting from "@/components/ListTableMeeting";
import TOC from "@/components/TOC";
import { getPageBySection, getAllMeetings } from "@/services/Content";
import { getHash, checkIfValidPage } from "@/services/Utilities";
import { renderToHtml } from "@/services/Markdown";
import { handleClicks } from "@/mixins/handleClicks";
import Toggle from "@/components/Toggle";
export default {
  mixins: [handleClicks],
  metaInfo() {
    return {
      title: this.computedTitle
    };
  },
  data() {
    return {
      loading: true,
      content: null,
      checkIfValidPage,
      renderToHtml,
      showToc: true,
      sectionContent: null,
      meetings: null,
      displayMode: {},
      title: ""
    };
  },
  components: {
    BaseContent,
    TOC,
    ListTableMeeting,
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
    computedTitle() {
      return this.title;
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
          this.showToc = true;
          this.title = this.content[0].title;
          this.$ga.page({
            page: this.$route.path,
            title: this.title,
            location: window.location.href
          });
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
      //console.log(this.meetings);
      this.loading = false;
    },
    filterMeetingData(categoryEnum) {
      return this.meetings.filter(meeting => {
        return meeting.category === categoryEnum;
      });
    },
    dynamicFlex() {
      if (this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm) {
        return "12";
      } else {
        if (this.displayMode.message === "By Category") {
          return "10";
        } else {
          return "12";
        }
      }
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
