<template>
  <div>
    <v-card class="mx-auto py-5 mb-8" color="white">
      <v-list-item three-line>
        <v-list-item-content>
          <div class="overline mb-4 heavy">
            {{ content.createdAt | format }}
          </div>
          <v-list-item-title class="headline mb-1" style="font-weight: 700"
            ><router-link :to="`/news/${content.slug}`" class="news-link">{{
              content.title | titleCase
            }}</router-link></v-list-item-title
          >
        </v-list-item-content>
      </v-list-item>
      <v-card-text style="font-size: 14px">
        <readmore
          :content="renderToHtml(content.content)"
          :height="height"
          readMoreText="Read More"
          readLessText="Less"
          class="markdown-body"
        ></readmore>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { renderToHtml } from "@/services/Markdown";
export default {
  data() {
    return {
      renderToHtml
    };
  },
  methods: {},
  props: {
    height: {
      type: Number,
      default: 150
    },
    content: {
      type: Object,
      default: () => {}
    }
  }
};
</script>

<style></style>
