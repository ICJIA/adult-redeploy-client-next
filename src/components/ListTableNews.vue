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
        class="elevation-1 newsTable hover"
        show-expand
        item-key="slug"
        :single-expand="singleExpand"
        :expanded.sync="expanded"
        @click:row="clicked"
      >
        <template v-slot:item.createdAt="{ item }">
          {{ item.createdAt | format }}
        </template>

        <template v-slot:item.updatedAt="{ item }">
          {{ displayUpdated(item) }}
        </template>

        <template v-slot:item.title="{ item }">
          <b>{{ item.title }}</b>
        </template>

        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length + 2">
            <div class="py-5">
              <NewsCard
                :content="item"
                :readMore="false"
                :elevation="true"
                :displayNewsLink="true"
              ></NewsCard>
            </div>
          </td>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import NewsCard from "@/components/NewsCard";
import { addAttributeToElement, dateFormat } from "@/services/Utilities";

export default {
  components: {
    // eslint-disable-next-line vue/no-unused-components
    NewsCard
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
      singleExpand: true,
      headers: [
        { text: "Title", value: "title" },
        {
          text: "Posted",
          align: "left",
          sortable: true,
          value: "createdAt"
        },
        {
          text: "Updated",
          align: "left",
          sortable: false,
          value: "updatedAt"
        }
      ]
    };
  },
  methods: {
    getRoute(item) {
      // let parentPath = this.$store.getters.config.strapiEnums.meetings.filter(
      //   cat => {
      //     return cat.enum === meeting.category;
      //   }
      // );

      // if (parentPath) {
      //   return `/meetings/${parentPath[0].slug}/${meeting.slug}`;
      // } else {
      //   // eslint-disable-next-line no-console
      //   console.error("Category not found in config");
      //   return null;
      // }
      console.log("Route here: ", item);
    },
    displayUpdated(item) {
      let created = dateFormat(item.createdAt);
      let updated = dateFormat(item.updatedAt);
      if (created === updated) {
        return "-";
      } else {
        return updated;
      }
    },
    clicked(value) {
      if (value === this.expanded[0]) {
        this.expanded = [];
      } else {
        if (this.expanded.length) {
          this.expanded.push(value);
          this.expanded.shift();
          if (this.expanded[0].title) {
            //console.log(scheduled);
            this.$ga.event({
              eventCategory: "News",
              eventAction: "Preview",
              eventLabel: "Preview: " + this.expanded[0].title
            });
          }
        } else {
          this.expanded.push(value);
          if (this.expanded[0].title) {
            //console.log(scheduled);
            this.$ga.event({
              eventCategory: "News",
              eventAction: "Preview",
              eventLabel: "Preview: " + this.expanded[0].title
            });
          }
        }
      }
    }
  },

  props: {
    items: {
      type: Array,
      default: () => []
    }
  }
};
</script>

<style lang="scss" scoped></style>
