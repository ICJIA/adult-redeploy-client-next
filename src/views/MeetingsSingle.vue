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
          <v-layout wrap>
            <v-flex xs12>
              <MeetingCard :content="content[0]"></MeetingCard>
            </v-flex>
          </v-layout>
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
  data() {
    return {
      loading: true,
      content: null,
      checkIfValidPage,
      renderToHtml,

      sectionContent: null
    };
  },
  components: {
    MeetingCard,
    BaseContent
  },
  created() {
    this.fetchContent();
  },
  computed: {},

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
