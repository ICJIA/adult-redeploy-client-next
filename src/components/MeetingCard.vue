<template>
  <v-card class="mx-auto elevation-8" color="white" style="width: 100%">
    <v-card-title class="site-desription-title px-3">{{
      content.title
    }}</v-card-title>
    <v-card-text>
      <!-- <div class="heavy mb-4">
        Scheduled: {{ content.scheduledDate | format }}
      </div> -->
      <div
        v-html="renderToHtml(content.content)"
        v-if="content.content"
        @click="handleClicks"
        class="dynamic-content site-description"
      ></div>

      <div
        style="background: #eee"
        class="px-6 py-2"
        v-if="content.materials && content.materials.length"
      >
        <h3 style="color: #222;" class="mt-10">Meeting Materials</h3>
        <ul
          style="color: #222;"
          class="mt-4 mb-12"
          v-if="content.materials && content.materials.length"
        >
          <div v-for="(file, index) in content.materials" :key="index">
            <li class="mb-4">
              <span class=" medium"> {{ file.name }}</span>
              <br />
              <span
                style="font-size: 12px; "
                class="hover onClickLink"
                @click="downloadFile(file)"
                >[ Primary download</span
              >
              |
              <span style="font-size: 12px"
                ><a
                  :href="`${$store.getters.config.baseURL}${file.url}`"
                  target="_blank"
                  class="hover "
                  >Alternate download ]</a
                ></span
              >
            </li>
          </div>
        </ul>
      </div>

      <div style="background: #eee" class="px-6 py-2" v-else>
        <h3 style="color: #222;" class="mt-10">Meeting Materials</h3>
        <ul
          style="color: #222;"
          class="mt-4 mb-12"
          v-if="content.externalURL && content.externalURL.length"
        >
          <li>
            <span class=" medium">
              <span v-if="content.externalURLName">
                {{ content.externalURLName }}
              </span>
              <span v-else>
                {{ content.externalURL }}
              </span></span
            >
            <br />
            <span
              style="font-size: 12px; "
              class="hover onClickLink"
              @click="getExternalFile(content.externalURL)"
              >[ Primary download</span
            >
            |
            <span style="font-size: 12px"
              ><a
                :href="`${content.externalURL}`"
                target="_blank"
                class="hover "
                >Alternate download ]</a
              ></span
            >
          </li>
        </ul>
      </div>
      <v-container class="mt-4">
        <v-row>
          <v-col cols="12">
            <TagList :tags="content.tags"></TagList>
          </v-col>
        </v-row>
      </v-container>
      <v-container class="mt-10">
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
export default {
  components: {
    TagList
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
