<template>
  <div>
    <v-card class="mx-auto py-5 mb-8" color="white">
      <v-list-item three-line>
        <v-list-item-content>
          <PostedDate
            :createdAt="content.createdAt"
            :updatedAt="content.updatedAt"
            class=""
            style="margin-left: -15px;"
          ></PostedDate>
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
          :tags="content.tags"
          :height="height"
          readMoreText="Read More"
          :hideReadLess="true"
          class="markdown-body"
          :fullHeight="fullHeight"
        ></readmore>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import Readmore from "@/components/Readmore";
import PostedDate from "@/components/PostedDate";
import { renderToHtml } from "@/services/Markdown";
export default {
  components: {
    PostedDate,
    Readmore
  },
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
    },
    elevation: {
      type: Number,
      default: 2
    },
    fullHeight: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style></style>
