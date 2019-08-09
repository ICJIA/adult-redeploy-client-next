<template>
  <v-card class="mx-auto elevation-8" color="white" style="width: 100%">
    <v-card-title class="site-desription-title px-3">{{
      content.title
    }}</v-card-title>
    <v-card-text>
      <div class="heavy mb-4">
        Scheduled: {{ content.scheduledDate | format }}
      </div>
      <div
        v-html="renderToHtml(content.content)"
        v-if="content.content"
        class="site-description"
      ></div>

      <div style="background: #eee" class="px-6 py-2">
        <h3 style="color: #222;" class="mt-10">Meeting Materials</h3>
        <ul style="color: #222;" class="mt-4 mb-12">
          <div v-for="(file, index) in content.materials" :key="index">
            <li>
              <span @click="downloadFile(file)" class="hover medium">
                {{ file.name }}</span
              >
              &nbsp;
              <span
                style="font-size: 12px; "
                class="hover onClickLink"
                @click="downloadFile(file)"
                >[ Primary download</span
              >
              |
              <span style="font-size: 12px"
                ><a
                  :href="`${$store.getters.config.baseURL}/${file.url}`"
                  target="_blank"
                  class="hover "
                  >Alternate download ]</a
                ></span
              >
            </li>
          </div>
        </ul>
      </div>
      <v-container class="mt-4">
        <v-layout>
          <v-flex xs12 sm12 md6>
            <div class="text-left" v-if="content.createdAt">
              Posted: {{ content.createdAt | timeAgoFormat }}
            </div>
          </v-flex>
          <v-flex xs12 sm12 md6>
            <div class="text-right" v-if="content.updatedAt">
              Last updated: {{ content.updatedAt | timeAgoFormat }}
            </div>
          </v-flex>
        </v-layout>
      </v-container>

      <!-- <div class="text-right" v-if="showUpdated && content.updatedAt">
        Last updated: {{ content.updatedAt | timeAgoFormat }}
      </div> -->
    </v-card-text>
  </v-card>
</template>

<script>
import { getFile } from "@/services/Download";
import { renderToHtml } from "@/services/Markdown";
export default {
  data() {
    return {
      renderToHtml
    };
  },
  methods: {
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
