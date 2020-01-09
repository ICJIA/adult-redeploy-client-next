<template>
  <div>
    <v-card class="mx-auto elevation-8" color="white" style="width: 100%">
      <h3 class="site-desription-title px-4 py-4">{{ item.title }}</h3>
      <v-card-text>
        <div class="text-right">
          <div class="category">
            {{ getCategoryTitle(item.category) | titleCase }}
          </div>
        </div>
        <div>
          <h3>{{ item.publicationDate | format }}</h3>
        </div>
        <div
          v-html="renderToHtml(item.content)"
          v-if="item.content"
          @click="handleClicks"
          class="dynamic-content site-description"
        ></div>

        <DownloadBox :content="item" class="mt-10"></DownloadBox>

        <v-container class="mt-4">
          <v-row>
            <v-col cols="12">
              <TagList :tags="item.tags"></TagList>
            </v-col>
          </v-row>
        </v-container>
        <v-container class="mt-4">
          <v-row>
            <v-col cols="12" sm="12" md="12">
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
/* eslint-disable vue/no-unused-components */
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
      renderToHtml
    };
  },
  computed: {},
  mixins: [handleClicks],
  methods: {
    displayUpdated(createdAt, updatedAt) {
      var posted = moment(createdAt);
      var updated = moment(updatedAt);
      var duration = moment.duration(updated.diff(posted)).days();

      if (duration >= 1) {
        return true;
      } else {
        return false;
      }
    },
    getCategoryTitle(catEnum) {
      let cat = strapiEnumToObject("resources", catEnum);
      //console.log(cat);
      //   let categoryName = this.$store.getters.config.strapiEnums.meetings.filter(
      //     c => {
      //       return c.enum === catEnum;
      //     }
      //   );
      //   return categoryName[0].short;
      return cat[0].title;
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

<style>
.dynamic-content h2 {
  margin-top: -5px !important;
}
.category {
  background: #075e60;
  color: #fff;
  padding: 5px 10px;
  font-size: 12px;
  display: inline;
  cursor: pointer;
  -webkit-transition: 0.3s;
  transition: 0.3s;
  font-weight: bold;
}

.category:hover {
  background: #aaa;
  color: #fff;
}
</style>
