<template>
  <v-card class="mx-auto elevation-8" color="white" style="width: 100%">
    <v-card-title class="site-desription-title px-3">{{
      content.title
    }}</v-card-title>

    <v-card-text>
      <div class="text-right">
        <div class="category" @click="routeTo(content)">
          {{ getCategoryTitle(content.category) }}
        </div>
      </div>
      <div class="mb-5">
        <strong>Scheduled: {{ content.scheduledDate | format }}</strong>
      </div>
      <div
        v-html="renderToHtml(content.content)"
        v-if="content.content"
        @click="handleClicks"
        class="dynamic-content site-description"
      ></div>
      <DownloadBox :content="content"></DownloadBox>

      <v-container class="mt-4">
        <v-row>
          <v-col cols="12">
            <TagList :tags="content.tags"></TagList>
          </v-col>
        </v-row>
      </v-container>
      <v-container class="mt-4">
        <v-row>
          <v-col cols="12" sm="12" md="6">
            <div class="text-left" v-if="content.createdAt">
              Posted: {{ content.createdAt | timeAgoFormat }}
            </div>
          </v-col>
          <v-col cols="12" sm="12" md="6">
            <div
              class="text-right"
              v-if="
                content.updatedAt &&
                  displayUpdated(content.createdAt, content.updatedAt)
              "
            >
              Last updated: {{ content.updatedAt | timeAgoFormat }}
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import { getFile, getExternalFile } from "@/services/Download";
import { renderToHtml } from "@/services/Markdown";
import { handleClicks } from "@/mixins/handleClicks";
import moment from "moment";
import TagList from "@/components/TagList";
import DownloadBox from "@/components/DownloadBox";
import {
  strapiEnumToObject,
  addAttributeToElement
} from "@/services/Utilities";
export default {
  components: {
    TagList,
    DownloadBox
  },
  data() {
    return {
      renderToHtml,
      getExternalFile
    };
  },
  computed: {},
  mixins: [handleClicks],
  methods: {
    displayUpdated(createdAt, updatedAt) {
      var posted = moment(createdAt);
      var updated = moment(updatedAt);
      var duration = moment.duration(updated.diff(posted)).days();

      if (duration > 1) {
        return true;
      } else {
        return false;
      }
    },
    getCategoryTitle(catEnum) {
      let cat = strapiEnumToObject("meetings", catEnum);

      if (cat.length) {
        return cat[0].title;
      } else {
        return "Error";
      }
    },
    routeTo(item) {
      let arr = strapiEnumToObject("meetings", item.category);
      let catSlug = arr[0].slug;
      let url = `/about/meetings/${catSlug}`;

      this.$router.push(url).catch(err => {
        this.$vuetify.goTo(0);
      });
    },
    downloadFile(item) {
      // if (item.file) {
      //   return getFile(item.file);
      // }
      console.log(item);
      return getFile(item);
    }
  },
  props: {
    content: {
      type: Object,
      default: () => {}
    }
  }
};
</script>

<style>
.onClickLink {
  text-decoration: underline;
  color: #065f60;
  font-weight: bold;
}

.onClickLink:hover {
  color: #aaa;
}
</style>
