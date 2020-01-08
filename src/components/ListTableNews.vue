<template>
  <div>
    <v-card color="white" v-if="!showSimpleTable">
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
    <div v-else>
      <v-simple-table fixed-header style="border-bottom: 1px solid #ccc;">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">
                Posted
              </th>
              <th class="text-left">
                Title
              </th>
              <th class="text-left">
                Link
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in items"
              :key="item.title"
              @click.stop="routeTo(item)"
              class="hover"
            >
              <td>{{ item.createdAt | format }}</td>
              <td style="font-weight: bold">
                {{ item.title }}
              </td>
              <td>
                <v-btn>
                  <v-icon @click.stop="routeTo(item)">
                    link
                  </v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </div>
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
        {
          text: "Posted",
          align: "left",
          sortable: true,
          value: "createdAt"
        },
        { text: "Title", value: "title" }
      ]
    };
  },
  computed: {
    showSimpleTable() {
      if (this.$vuetify.breakpoint.sm || this.$vuetify.breakpoint.xs) {
        return true;
      } else {
        return false;
      }
    }
  },
  methods: {
    routeTo(item) {
      //onsole.log("Route here: ", item);
      this.$router.push(`/news/${item.slug}`);
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

<style>
td {
  padding-top: 20px !important;
  padding-bottom: 20px !important;
}
</style>
