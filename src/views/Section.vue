<template>
  <div>
    <base-content :loading="loading">
      <template v-slot:title>
        <v-container v-if="content">
          <v-layout wrap>
            <v-flex xs12>
              <h1 class="page-title">{{ content.title }}</h1>
            </v-flex>
          </v-layout>
        </v-container>
      </template>
      <!-- <template slot="page-list" v-if="content.pages">
        <base-list :items="content.pages">
          <template slot-scope="item">
            <v-container>
              <v-flex xs12>
                <div class="mb-5">{{ item }}</div>
              </v-flex>
            </v-container>
          </template>
        </base-list>
      </template> -->
    </base-content>
    {{ content }}
  </div>
</template>

<script>
import BaseContent from "@/components/BaseContent";
import BaseList from "@/components/BaseList";
import { renderToHtml } from "@/services/Markdown";
export default {
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
      this.$router.push({
        name: "error",
        params: {
          msg: "Page not found",
          statusCode: 404,
          debug: this.$route.params
        }
      });
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

<style lang="scss" scoped></style>
