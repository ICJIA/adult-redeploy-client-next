<template>
  <div>
    <v-card
      style="border-bottom: 1px solid #eee;"
      class="pt-3 pb-4 elevation-2"
      :class="{ cardBackground: mode !== 'minimal', minHeight: imageExists }"
    >
      <div class="px-4 lato">
        <v-row>
          <v-col cols="12">
            <div class="text-right spac-purple">
              <div class="heavy category" @click="routeToCategory(item)">
                {{ strapiEnumToObject("publications", item.category)[0].title }}
              </div>
            </div>
          </v-col>
        </v-row>
        <div
          style="font-weight: 700; font-size: 12px; color: purple"
          class="mt-5"
        >
          {{ item.year }}
        </div>
        <h2 style="margin: 0; padding: 0; width: 100%;" class="mb-3 title-link">
          <span
            v-if="item.mediaMaterial && item.mediaMaterial.file"
            @click="download(item)"
            class="hover pubTitle"
          >
            {{ item.title }}
          </span>
          <span
            v-else-if="
              item.externalMediaMaterial && item.externalMediaMaterial.url
            "
            @click="gotoExternal(item)"
            class="hover pubTitle"
          >
            {{ item.title }}
          </span>
          <span v-else>
            {{ item.title }}
          </span>
        </h2>

        <v-card-text class="pb-5">
          <div class="hover" style="float: left; margin-bottom: 30px;">
            <div
              v-if="
                item.mediaMaterial &&
                  item.mediaMaterial.thumbnail &&
                  !$browserDetect.isIE
              "
            >
              <v-hover>
                <template v-slot:default="{ hover }">
                  <v-img
                    :contain="true"
                    :src="getThumbnailLink(item.mediaMaterial)"
                    :lazy-src="require('@/assets/img/spac-purple-lazy.png')"
                    class="cover elevation-1 px-1"
                    width="200"
                    style="margin-right: 20px; border: 1px solid #bbb; "
                    @click="download(item)"
                  >
                    <template v-slot:placeholder>
                      <v-row
                        class="fill-height ma-0"
                        align="center"
                        justify="center"
                      >
                        <v-progress-circular
                          indeterminate
                          color="grey darken-5"
                        ></v-progress-circular>
                      </v-row>
                    </template>
                    <v-fade-transition>
                      <v-overlay v-if="hover" absolute color="#B158C2">
                        <v-btn><v-icon>cloud_download</v-icon></v-btn>
                      </v-overlay>
                    </v-fade-transition>
                  </v-img>
                </template>
              </v-hover>
            </div>

            <div
              v-else-if="
                item.externalMediaMaterial &&
                  item.externalMediaMaterial.thumbnail &&
                  !$browserDetect.isIE
              "
            >
              <v-hover>
                <template v-slot:default="{ hover }">
                  <v-img
                    :contain="true"
                    :src="getThumbnailLink(item.externalMediaMaterial)"
                    :lazy-src="require('@/assets/img/spac-purple-lazy.png')"
                    class="cover elevation-0 px-1"
                    width="200"
                    style="margin-right: 20px; border: 1px solid #bbb; "
                    @click="gotoExternal(item)"
                  >
                    <v-fade-transition>
                      <v-overlay v-if="hover" absolute color="#036358">
                        <v-btn><v-icon>open_in_new</v-icon></v-btn>
                      </v-overlay>
                    </v-fade-transition>
                  </v-img>
                </template>
              </v-hover>
            </div>
          </div>
          <div
            class="default-font table-font"
            :class="{ summaryMinHeight: imageExists }"
          >
            {{ item.summary }}
            <div :class="{ 'text-right': mode === 'minimal' }">
              <v-chip
                small
                class="mt-4 hover"
                color="primary"
                outlined
                pill
                :class="{ pullLeft: !item.summary }"
                @click="download(item)"
                v-if="item.mediaMaterial && item.mediaMaterial.file"
              >
                READ
                <v-icon right>cloud_download</v-icon>
              </v-chip>
              <v-chip
                small
                class="mt-4 hover"
                color="primary"
                outlined
                pill
                @click="gotoExternal(item)"
                v-if="
                  item.externalMediaMaterial && item.externalMediaMaterial.url
                "
              >
                GO TO
                <v-icon right>open_in_new</v-icon>
              </v-chip>
            </div>
          </div>
        </v-card-text>

        <v-card-text class="mt-3" v-if="mode !== 'minimal'">
          <TagList :tags="item.tags" style="margin-left: -20px"></TagList>
        </v-card-text>
        <v-card-text class="mt-3" v-else>
          <div style="height: 10px"></div>
        </v-card-text>
      </div>
    </v-card>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import { getThumbnailLink, getDefaultThumbnail } from "@/services/Image";
import { strapiEnumToObject } from "@/services/Utilities";
import TagList from "@/components/TagList";
// import { EventBus } from "@/event-bus";

export default {
  components: {
    // eslint-disable-next-line vue/no-unused-components
    TagList
  },
  data() {
    return {
      getThumbnailLink,
      getDefaultThumbnail,
      strapiEnumToObject,
      overlay: false
    };
  },
  computed: {
    imageExists() {
      if (
        this.item.externalMediaMaterial &&
        this.item.externalMediaMaterial.thumbnail
      ) {
        return true;
      }
      if (this.item.mediaMaterial && this.item.mediaMaterial.thumbnail) {
        return true;
      }

      return false;
    }
  },
  watch: {},
  mounted() {
    if (this.sendAnalyticsEvent) {
      console.log("send event here");
    }
  },
  methods: {
    routeToCategory(item) {
      let categoryObj = strapiEnumToObject("publications", item.category);
      let path = `/publications/${categoryObj[0].slug}`;
      this.$router.push(`${path}`).catch(err => {
        this.$vuetify.goTo(0);
      });
    },
    gotoExternal(item) {
      //console.log(item.externalMediaMaterial.url);
      if (item.externalMediaMaterial.url) {
        this.$ga.event({
          eventCategory: "Video",
          eventAction: "Play",
          eventLabel: item.externalMediaMaterial.url
        });
        window.open(item.externalMediaMaterial.url);
      }
    },
    download(item) {
      if (item.mediaMaterial.file) {
        let path = item.mediaMaterial.file.url;
        window.open(this.$store.getters.config.baseURL + path);
        let ext = item.mediaMaterial.file.name.split(".").pop();
        console.log(
          "Download event: ",
          item.mediaMaterial.file.hash + "." + ext
        );
        this.$ga.event({
          eventCategory: "File",
          eventAction: "Download",
          eventLabel: item.mediaMaterial.file.hash + "." + ext
        });
      }
    }
  },
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    mode: {
      type: String,
      default: "full"
    },
    sendAnalyticsEvent: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style>
.category {
  background: purple;
  color: #fff;
  padding: 5px 10px;
  font-size: 12px;
  display: inline;
  cursor: pointer;
  transition: 0.3s;
}

.category:hover {
  background: #ccc;
  color: #000;
}

.cardBackground {
  background: #f5f5f5 !important;
}

.pubTitle:hover {
  color: #666;
}

.pullLeft {
  margin-left: -18px;
}

.summaryMinHeight {
  min-height: 210px;
}

.minHeight {
  min-height: 430px;
}
</style>
