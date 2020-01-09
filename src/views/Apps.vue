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
              <h1 class="page-title">Web Apps</h1>
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
        <v-container v-if="error.status">
          <v-row>
            <v-col cols="12">
              <div class="my-5 text-center" style="color: red">
                {{ error.msg }}
              </div>
            </v-col>
          </v-row>
        </v-container>
      </template>
    </base-content>
    <v-container class="grey lighten-5">
      <v-row class="full-height" v-if="!loadingApps">
        <v-col
          class="xs px-5"
          sm="12"
          md="4"
          v-for="(app, index) in newApps.length"
          :key="index"
        >
          <v-row>
            <v-col class="full-height">
              <v-card class="mb-5 appCard">
                <div class="">
                  <v-img
                    class="white--text align-end "
                    height="225px"
                    :src="newApps[app - 1]['image']"
                    v-if="!$browserDetect.isIE"
                  >
                    <div class="card-banner mb-5">
                      <h2 class="px-5">{{ newApps[app - 1]["title"] }}</h2>
                    </div>
                  </v-img>

                  <h3 class="px-5 pt-5" v-if="$browserDetect.isIE">
                    {{ newApps[app - 1]["title"] }}
                  </h3>

                  <div class="px-4 pt-3">
                    By
                    {{ newApps[app - 1]["contributors"][0]["title"] }}
                  </div>

                  <v-card-subtitle class="pb-2">{{
                    newApps[app - 1]["date"] | format
                  }}</v-card-subtitle>

                  <v-card-text class="text--primary mb-2">
                    {{ newApps[app - 1]["description"] }}
                  </v-card-text>
                </div>

                <v-card-actions>
                  <v-btn
                    v-if="
                      newApps[app - 1]['articles'].length ||
                        newApps[app - 1]['datasets'].length
                    "
                    small
                    text
                    style="color: #075E60"
                    @click.native="
                      newApps[app - 1]['show'] = !newApps[app - 1]['show']
                    "
                    >Related Content</v-btn
                  >

                  <v-spacer></v-spacer>

                  <v-btn
                    small
                    target="_blank"
                    :href="`${newApps[app - 1]['url']}`"
                    >Launch App<v-icon right>open_in_new</v-icon></v-btn
                  >
                </v-card-actions>

                <v-slide-y-transition>
                  <div v-show="newApps[app - 1]['show']">
                    <div
                      style="background: #eee"
                      v-if="
                        newApps[app - 1]['articles'].length ||
                          newApps[app - 1]['datasets'].length
                      "
                    >
                      <v-card-text>
                        <div
                          v-if="newApps[app - 1]['articles'].length"
                          class="pb-3 pl-1"
                        >
                          <div class="mb-2">
                            <strong>Articles:</strong>
                          </div>
                          <ul
                            v-for="article in newApps[app - 1]['articles']"
                            :key="article.title"
                            class="ml-2 related"
                          >
                            <li>
                              <a
                                :href="
                                  `https://icjia.illinois.gov/researchhub/articles/${article.slug}`
                                "
                                class="relatedLink"
                                target="_blank"
                                >{{ article.title }}</a
                              >
                            </li>
                          </ul>
                        </div>

                        <div
                          v-if="newApps[app - 1]['datasets'].length"
                          class="pb-3 pl-1"
                        >
                          <div class="mb-2">
                            <strong>Datasets:</strong>
                          </div>
                          <ul
                            v-for="dataset in newApps[app - 1]['datasets']"
                            :key="dataset.title"
                            class="ml-2 related"
                          >
                            <li>
                              <a
                                :href="
                                  `https://icjia.illinois.gov/researchhub/datasets/${dataset.slug}`
                                "
                                class="relatedLink"
                                target="_blank"
                                >{{ dataset.title }}</a
                              >
                            </li>
                          </ul>
                        </div>
                      </v-card-text>
                    </div>
                  </div>
                </v-slide-y-transition>

                <!--  -->
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row v-else>
        <v-col
          class="xs"
          sm="12"
          md="4"
          v-for="(app, index) in $store.getters.appCount"
          :key="`loading-${index}`"
        >
          <v-row>
            <v-col class="full-height">
              <v-sheet :color="`grey lighten-4`">
                <v-boilerplate
                  type="image, article"
                  class="mb-6"
                  :boilerplate="false"
                ></v-boilerplate>
              </v-sheet>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import BaseContent from "@/components/BaseContent";
import { VSkeletonLoader } from "vuetify/lib";
import { renderToHtml } from "@/services/Markdown";
import { handleClicks } from "@/mixins/handleClicks";
import { getApplications } from "@/services/Content";
import { getHash, checkIfValidPage } from "@/services/Utilities";
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
      title: "",
      apps: null,
      newApps: null,
      error: {},
      page: 1,
      perPage: 3,
      maxApps: 8,
      loadingApps: true,
      show: false
    };
  },
  watch: {},
  components: {
    BaseContent,
    // eslint-disable-next-line vue/no-unused-components
    VSkeletonLoader,
    // Create a new component that
    // extends v-skeleton-loader
    // eslint-disable-next-line vue/no-unused-components
    VBoilerplate: {
      functional: true,

      render(h, { data, props, children }) {
        return h(
          "VSkeletonLoader",
          {
            ...data,
            props: {
              boilerplate: true,
              elevation: 2,
              ...props
            }
          },
          children
        );
      }
    }
  },

  methods: {
    // next() {
    //   this.page = this.page + 1;
    //   return;
    // },
    // previous() {
    //   this.page = this.page - 1;
    //   return;
    // },
    expand(id) {
      this.$nextTick(() => {
        this.newnewApps[id]["show"] = !this.newnewApps[id]["show"];
        //console.log(id, this.newnewApps[id]["show"]);
      });
    },
    routeTo(app) {
      //const url = "https://icjia.illinois.gov/researchhub/apps/" + app.slug;
      window.open(app.url);
      //console.log(app);
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
    },
    async fetchContent() {
      this.loading = true;
      const section = "apps";
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

      this.loadingApps = true;
      this.error.status = false;
      const contentMap = new Map();
      contentMap.set(`getApplications`, {
        hash: getHash(`getApplications`),
        query: getApplications,
        params: {}
      });
      await this.$store.dispatch("cacheContent", contentMap);
      this.apps = this.$store.getters.getContentFromCache(
        contentMap,
        `getApplications`
      );
      if (!checkIfValidPage(this.apps)) {
        this.error.status = true;
        this.loadingApps = false;
        this.error.msg =
          "Network error. Unable to fetch Research Hub applications. Please reload this page.";
        console.log("error");
        this.$ga.event({
          eventCategory: "Error",
          eventAction: "Network error.",
          eventLabel:
            "Unable to fetch Research Hub applications. Please reload this page."
        });
      }

      this.newApps = this.apps.map(apps => ({
        ...apps,
        show: false
      }));

      this.loadingApps = false;
    }
  },
  created() {
    this.fetchContent();
  },
  computed: {
    computedTitle() {
      return this.title;
    }
    // start() {
    //   return this.page * this.perPage - this.perPage;
    // },
    // visible() {
    //   return 5;
    // },
    // length() {
    //   return Math.floor(this.maxApps / this.perPage) + 1;
    // }
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
.card-banner {
  background: rgba(25, 26, 25, 0.3);
}

.appCardInfo:hover {
  box-shadow: 0px 0px 15px #000000;
  z-index: 2;
  -webkit-transition: all 100ms ease-in;
  -webkit-transform: scale(1.01);
  -ms-transition: all 100ms ease-in;
  -ms-transform: scale(1.01);
  -moz-transition: all 100ms ease-in;
  -moz-transform: scale(1.01);
  transition: all 100ms ease-in;
  transform: scale(1.01);
  cursor: pointer;
}
.full-height .flex {
  display: flex;
}

.full-height .flex > .card {
  flex: 1 1 auto;
}

ul.related li {
  padding-bottom: 8px;
}

a.relatedLink {
  text-decoration: none;
}
</style>
