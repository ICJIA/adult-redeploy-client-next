<template>
  <div>
    <v-card class="mx-auto elevation-8" color="white" style="width: 100%">
      <v-card-title class="site-desription-title px-3">{{
        item.title
      }}</v-card-title>
      <v-card-text>
        <div
          v-html="renderToHtml(item.content)"
          v-if="item.content"
          @click="handleClicks"
          class="dynamic-content site-description"
        ></div>

        <div v-if="item.materials.length || item.externalURL">
          <DownloadBox :content="item" header="Links"></DownloadBox>
        </div>

        <v-container class="mt-4">
          <v-row>
            <v-col cols="12">
              <TagList :tags="item.tags"></TagList>
            </v-col>
          </v-row>
        </v-container>
        <v-container class="mt-4">
          <v-row>
            <v-col cols="12" sm="12" md="6">
              <div class="text-left" v-if="item.createdAt">
                Posted: {{ item.createdAt | timeAgoFormat }}
              </div>
            </v-col>
            <v-col cols="12" sm="12" md="6">
              <div
                class="text-right"
                v-if="
                  item.updatedAt &&
                    displayUpdated(item.createdAt, item.updatedAt)
                "
              >
                Last updated: {{ item.updatedAt | timeAgoFormat }}
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { getFile, getExternalFile } from "@/services/Download";
import { renderToHtml } from "@/services/Markdown";
import { handleClicks } from "@/mixins/handleClicks";
import moment from "moment";
import TagList from "@/components/TagList";
import DownloadBox from "@/components/DownloadBox";
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
    downloadFile(item) {
      // if (item.file) {
      //   return getFile(item.file);
      // }
      console.log(item);
      return getFile(item);
    }
  },
  props: {
    item: {
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

<style lang="scss" scoped></style>
