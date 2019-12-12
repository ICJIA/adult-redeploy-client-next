<template>
  <div>
    <v-card color="white">
      <v-card-title>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="search"
          label="Search"
          single-line
          hide-details
          class="mb-10"
        ></v-text-field>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="items"
        :items-per-page="-1"
        :search="search"
        class="elevation-1 meetingTable hover"
        show-expand
        item-key="slug"
        :single-expand="singleExpand"
        :expanded.sync="expanded"
        @click:row="clicked"
      >
        <template v-slot:item.createdAt="{ item }">
          <span v-html="displayNewLabel(item.createdAt)"></span>
        </template>

        <template v-slot:item.publicationDate="{ item }">
          &nbsp;&nbsp;{{ item.publicationDate | dateFormatShort }}&nbsp;&nbsp;
        </template>

        <template v-slot:item.title="{ item }">
          <span class="bold">{{ item.title }}</span>
        </template>

        <template v-slot:item.category="{ item }">
          {{ getCategoryTitle(item.category) }}
        </template>

        <template v-slot:item.slug="{ item }">
          <v-btn
            small
            outlined
            @click.stop.prevent="download(item)"
            v-if="item.mediaMaterial && item.mediaMaterial.file"
            >Read&nbsp;&nbsp;&nbsp;<v-icon class="ml-1"
              >cloud_download</v-icon
            ></v-btn
          >

          <v-btn
            small
            outlined
            @click="gotoExternal(item)"
            v-if="item.externalMediaMaterial && item.externalMediaMaterial.url"
            >GO TO <v-icon class="ml-1">open_in_new</v-icon></v-btn
          >
        </template>

        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length + 2">
            <div class="py-1">
              <ResourceDisplay
                :item="item"
                mode="max"
                class="post default-font mb-3"
                :key="forceRender()"
              />
            </div>
          </td>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import ResourceDisplay from "@/components/ResourceDisplay";
// import { EventBus } from "@/event-bus";
import {
  strapiEnumToObject,
  addAttributeToElement
} from "@/services/Utilities";
import moment from "moment";
export default {
  components: {
    ResourceDisplay
  },
  mounted() {
    addAttributeToElement(
      "v-icon--link",
      "aria-label",
      "Read More / Read Less"
    )();
  },

  data() {
    return {
      search: "",
      expanded: [],
      key: 0,
      singleExpand: true,
      headers: [
        { text: "Published", value: "publicationDate" },
        { text: "Category", value: "category" },

        { text: "Title", value: "title" },
        {
          text: "",
          value: "slug",
          align: "center",
          sortable: false
        }
      ]
    };
  },
  methods: {
    forceRender() {
      return this.key + 1;
    },
    clicked(value) {
      if (value === this.expanded[0]) {
        this.expanded = [];
      } else {
        if (this.expanded.length) {
          this.expanded.shift();
          this.expanded.push(value);
          //console.log("send preview event here: ", this.expanded[0].title);
          if (this.expanded[0].title) {
            this.$ga.event({
              eventCategory: "Resource",
              eventAction: "Preview",
              eventLabel: "Preview: " + this.expanded[0].title
            });
          }
        } else {
          this.expanded.push(value);
          //console.log("send preview event here: ", this.expanded[0].title);
          if (this.expanded[0].title) {
            this.$ga.event({
              eventCategory: "Resource",
              eventAction: "Preview",
              eventLabel: "Preview: " + this.expanded[0].title
            });
          }
        }
      }
    },
    download(item) {
      let ext = item.mediaMaterial.file.name.split(".").pop();
      //console.log("Download: ", item.mediaMaterial.file.hash + "." + ext);
      this.$ga.event({
        eventCategory: "File",
        eventAction: "Download",
        eventLabel: item.mediaMaterial.file.hash + "." + ext
      });
      let path = item.mediaMaterial.file.url;
      window.open(this.$store.getters.config.baseURL + path);
    },
    gotoExternal(item) {
      //console.log(item.externalMediaMaterial.url);
      if (item.externalMediaMaterial.url) {
        this.$ga.event({
          eventCategory: "Video",
          eventAction: "Play",
          eventLabel: item.externalMediaMaterial.url
        });
        window.open(item.externalMediaMaterial.url);
      }
    },
    // eslint-disable-next-line no-unused-vars
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
    },
    // eslint-disable-next-line no-unused-vars
    displayNewLabel(createdAt) {
      let now = moment(new Date()); //todays date
      let end = moment(createdAt); // another date
      let duration = moment.duration(now.diff(end));
      let days = duration.asDays();
      if (days <= this.$store.state.config.daysToDisplayNewLabel) {
        return `<div style="font-weight: 900; font-size: 12px; color: #fff; background: green;" class="text-center">&nbsp;&nbsp;NEW!&nbsp;&nbsp;</div>`;
      }
    }
  },

  props: {
    items: {
      type: Array,
      default: () => []
    },
    hideCategory: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style>
td {
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}
tr:nth-of-type(even) {
  background-color: rgba(0, 0, 0, 0.04);
}

.bold {
  font-weight: bold;
}
</style>
