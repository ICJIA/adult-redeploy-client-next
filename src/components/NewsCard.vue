<template>
  <div>
    <v-card
      class="mx-auto py-0 mb-8"
      style="border-bottom: 1px solid #ddd"
      :class="{
        'elevation-3': elevation,
        'elevation-0': !elevation
      }"
    >
      <v-row>
        <v-col cols="12" v-if="displayNewsLink">
          <div class="text-right spac-purple mr-10">
            <div
              class="heavy category hover"
              style="color: #fff !important; text-decoration: none !important; font-weight: 900 !important"
              @click="
                $router.push('/news').catch(err => {
                  $vuetify.goTo(0);
                })
              "
            >
              Adult Redeploy Illinois News
            </div>
          </div>
        </v-col>
      </v-row>
      <v-list-item three-line>
        <v-list-item-content>
          <PostedDate
            :createdAt="content.publicationDate"
            :updatedAt="content.updatedAt"
            class=""
            style="margin-left: -15px;"
          ></PostedDate>
          <v-list-item-title
            class="headline mb-1"
            style="font-weight: 700; font-size: 28px !important; margin: 0; padding: 0;"
            ><router-link :to="`/news/${content.slug}`" class="news-link">{{
              content.title
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
          :eventLabel="content.title"
          v-if="readMore"
        ></readmore>
        <div
          v-else
          @click="handleClicks"
          class="dynamic-content"
          v-html="renderToHtml(content.content)"
        ></div>
        <TagList :tags="content.tags" class="mt-10" v-if="!readMore"></TagList>
        <v-container class="mt-4">
          <v-row>
            <v-col cols="12" sm="12" md="12">
              <div
                class="text-right"
                v-if="
                  content.updatedAt &&
                    displayUpdated(content.publicationDate, content.updatedAt)
                "
              >
                Last updated: {{ content.updatedAt | timeAgoFormat }}
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import Readmore from "@/components/Readmore";
import PostedDate from "@/components/PostedDate";
import { renderToHtml } from "@/services/Markdown";
import { handleClicks } from "@/mixins/handleClicks";
import TagList from "@/components/TagList";
import moment from "moment";
export default {
  components: {
    PostedDate,
    Readmore,
    TagList
  },
  data() {
    return {
      renderToHtml
    };
  },
  mixins: [handleClicks],
  methods: {
    displayUpdated(publicationDate, updatedAt) {
      var posted = moment(publicationDate);
      var updated = moment(updatedAt);
      var duration = moment.duration(updated.diff(posted)).days();
      if (duration > 1) {
        return true;
      } else {
        return false;
      }
    }
  },
  props: {
    readMore: {
      type: Boolean,
      default: true
    },
    height: {
      type: Number,
      default: 150
    },
    content: {
      type: Object,
      default: () => {}
    },
    elevation: {
      type: Boolean,
      default: false
    },
    fullHeight: {
      type: Boolean,
      default: false
    },
    displayNewsLink: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style>
.cardBackground {
  background: #fff !important;
}
</style>
