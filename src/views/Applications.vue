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
              <h1 class="page-title">{{ content.title }}</h1>
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
            <v-col cols="12">
              <div
                @click="handleClicks"
                class="dynamic-content"
                v-html="renderToHtml(content.content)"
              ></div>
            </v-col>
          </v-row>
        </v-container>
        <v-container
          :fluid="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
          v-if="content"
        >
          applications here
        </v-container>
      </template>
    </base-content>
  </div>
</template>

<script>
import BaseContent from "@/components/BaseContent";
import BaseList from "@/components/BaseList";
import { renderToHtml } from "@/services/Markdown";
import { handleClicks } from "@/mixins/handleClicks";
export default {
  mixins: [handleClicks],
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
      loading: null,
      content: [],
      renderToHtml,
      title: ""
    };
  },
  components: {
    BaseContent,
    // eslint-disable-next-line vue/no-unused-components
    BaseList
  },
  methods: {
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
    fetchContent() {
      this.loading = true;
      const section = "applications";
      if (section !== "home") {
        this.content = this.$store.getters.sections.find(
          x => x.slug === `${section}`
        );
        if (!this.content) {
          this.routeToError();
          return;
        }
        this.title = this.content.title;
        this.$ga.page({
          page: this.$route.path,
          title: this.title,
          location: window.location.href
        });
      }

      this.loading = false;
    }
  },
  created() {
    this.fetchContent();
  },
  computed: {
    computedTitle() {
      return this.title;
    }
  }
};
</script>

<style>
.pageList {
  margin-left: 15px;
  margin-top: -5px;
}
.pageLink {
  text-decoration: none;
}
li.pageTitle {
  margin-bottom: 10px;
}
</style>
