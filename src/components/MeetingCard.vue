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
      <v-container>
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
import { renderToHtml } from "@/services/Markdown";
export default {
  data() {
    return {
      renderToHtml
    };
  },
  props: {
    content: {
      type: Object,
      default: () => {}
    }
  }
};
</script>
