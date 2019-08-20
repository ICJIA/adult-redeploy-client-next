<template>
  <v-card class="mx-auto" color="white" style="width: 100%">
    <v-card-title class="site-desription-title px-3">{{
      content[0].title
    }}</v-card-title>
    <v-card-text>
      <div
        v-html="renderToHtml(content[0].content)"
        v-if="content[0].content"
        @click="handleClicks"
        class="dynamic-content site-description"
      ></div>
      <TagList :tags="content[0].tags" class="mt-5"></TagList>
      <div class="text-right mt-10" v-if="showUpdated && content[0].updatedAt">
        Last updated: {{ content[0].updatedAt | timeAgoFormat }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { handleClicks } from "@/mixins/handleClicks";
import { renderToHtml } from "@/services/Markdown";

import TagList from "@/components/TagList";
export default {
  mixins: [handleClicks],
  components: {
    TagList
  },
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

<style></style>
