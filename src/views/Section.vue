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
                v-html="renderToHtml(content.summary)"
              ></div>
            </v-col>
          </v-row>
        </v-container>
        <v-container :fluid="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm">
          <ul class="pageList">
            <base-list :items="content.pages" empty="">
              <template slot-scope="item">
                <div v-if="item.isPublished">
                  <li class="pageTitle">
                    <router-link
                      class="pageLink"
                      :to="
                        `/${$route.params.section.toLowerCase()}/${item.slug.toLowerCase()}`
                      "
                      >{{ item.title }}</router-link
                    >
                  </li>
                </div>
              </template>
            </base-list>
          </ul>
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
  data() {
    return {
      loading: null,
      content: [],
      renderToHtml
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
      const section = this.$route.params.section.toLowerCase();
      if (section !== "home") {
        this.content = this.$store.getters.sections.find(
          x => x.slug === `${section}`
        );
        if (!this.content) {
          this.routeToError();
        }
      }

      this.loading = false;
    }
  },
  created() {
    this.fetchContent();
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
