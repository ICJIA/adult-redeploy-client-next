<template>
  <div>
    <!-- <MeetingCard :content="content[0]"></MeetingCard> -->
    <base-content :loading="loading" id="baseContentTop">
      <template v-slot:content>
        <v-container
          v-if="content"
          id="scrollArea"
          :fluid="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
        >
          <v-row>
            <v-col cols="12">
              <MeetingCard :content="content[0]"></MeetingCard>
            </v-col>
            <!-- <v-col cols="12">
              <router-link
                v-if="$routerHistory.hasPrevious()"
                :to="{ path: $routerHistory.previous().path }"
              >
                &laquo;GO BACK
              </router-link>
            </v-col> -->
          </v-row>
        </v-container>
      </template>
    </base-content>
  </div>
</template>

<script>
import MeetingCard from "@/components/MeetingCard";
import BaseContent from "@/components/BaseContent";
import { getSingleMeeting } from "@/services/Content";
import { getHash, checkIfValidPage } from "@/services/Utilities";
import { renderToHtml } from "@/services/Markdown";
export default {
  watch: {
    $route: "fetchContent"
  },
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

      sectionContent: null,
      title: ""
    };
  },
  components: {
    MeetingCard,
    BaseContent
  },
  created() {
    this.fetchContent();
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
      const slug = this.$route.params.slug.toLowerCase();

      const name = `getSingleMeeting-${slug}`;
      contentMap.set(name, {
        hash: getHash(name),
        query: getSingleMeeting,
        params: { slug }
      });

      await this.$store.dispatch("cacheContent", contentMap);

      this.content = this.$store.getters.getContentFromCache(contentMap, name);

      if (!checkIfValidPage(this.content)) {
        this.routeToError();
      } else {
        this.title = this.content[0].title;
        this.$ga.page({
          page: this.$route.path,
          title: this.title,
          location: window.location.href
        });
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
