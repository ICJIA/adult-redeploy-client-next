<template>
  <v-card class="mx-auto" color="white">
    <v-card-title class="site-desription-title px-3">{{
      content[0].title
    }}</v-card-title>
    <v-card-text
      ><div
        v-html="renderToHtml(content[0].content)"
        v-if="content[0].content"
        class="site-description"
      ></div>
      <div class="text-right" v-if="showUpdated">
        Last updated: {{ content[0].updatedAt | timeAgoFormat }}
      </div>
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
      type: Array,
      default: () => []
    },
    showUpdated: {
      type: Boolean,
      default: true
    }
  }
};
</script>
