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
      <template slot="page-list" v-if="content.pages.length > 0">
        <base-list :items="content.pages">
          <template slot-scope="item">
            <v-container>
              <v-flex xs12>
                <div class="mb-5">{{ item }}</div>
              </v-flex>
            </v-container>
          </template>
        </base-list>
      </template>
      <template slot="site-list" v-if="content.sites.length > 0">
        <base-list :items="content.sites">
          <template slot-scope="item">
            <v-container>
              <v-flex xs12>
                <v-hover v-slot:default="{ hover }">
                  <v-card
                    class="mx-auto"
                    color="white"
                    v-if="content"
                    :elevation="hover ? 18 : 2"
                    @click="$router.push(`/sites/${item.slug}`)"
                  >
                    <v-card-title class="site-desription-title px-3">{{
                      item.title
                    }}</v-card-title>
                    <v-card-text>
                      {{ item.summary }}
                    </v-card-text>
                    <v-card-actions>
                      <v-btn :to="`/sites/${item.slug}`" text color="primary">
                        Learn More
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-hover>
              </v-flex>
            </v-container>
          </template>
        </base-list>
      </template>
    </base-content>
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
