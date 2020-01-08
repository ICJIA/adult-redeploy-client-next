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
        :items-per-page="15"
        :search="search"
        class="elevation-1 meetingTable hover"
        show-expand
        item-key="slug"
        :single-expand="singleExpand"
        :expanded.sync="expanded"
        @click:row="clicked"
      >
        <template v-slot:item.scheduledDate="{ item }">
          {{ item.scheduledDate | format }}
        </template>

        <template v-slot:item.category="{ item }" v-if="!hideCategory">
          {{ getCategoryTitle(item.category) }}
        </template>

        <!-- <template v-slot:item.slug="{ item }">
          <v-btn small depressed :to="getRoute(item)" aria-label="View Meeting"
            ><v-icon>link</v-icon></v-btn
          >
        </template> -->

        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length + 2">
            <div class="py-5">
              <MeetingCard :content="item"></MeetingCard>
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
                Scheduled
              </th>
              <th class="text-left">
                Category
              </th>
              <th class="text-left">
                Meeting Title
              </th>

              <th class="text-left">
                Link
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in items"
              :key="`${item.title}_${item.scheduledDate}`"
              class="hover"
            >
              <td>{{ item.scheduledDate | format }}</td>
              <td>{{ getCategoryTitle(item.category) }}</td>
              <td style="font-weight: bold">
                {{ item.title }}
              </td>
              <td>
                <v-btn>
                  <v-icon @click.stop="getRoute(item)">
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
import MeetingCard from "@/components/MeetingCard";
import { addAttributeToElement, dateFormat } from "@/services/Utilities";

export default {
  components: {
    // eslint-disable-next-line vue/no-unused-components
    MeetingCard
  },
  mounted() {
    if (!this.hideCategory) {
      Array.prototype.insert = function(index, item) {
        this.splice(index, 0, item);
      };
      let obj = {
        text: "Category",
        align: "left",
        sortable: true,
        value: "category"
      };

      this.headers.insert(1, obj);
    }

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
          text: "Scheduled",
          align: "left",
          sortable: true,
          value: "scheduledDate"
        },
        { text: "Meeting Title", value: "title" }
        // {
        //   text: "",
        //   value: "slug",
        //   align: "center",
        //   sortable: false
        // }
      ]
    };
  },
  methods: {
    getRoute(meeting) {
      let parentPath = this.$store.getters.config.strapiEnums.meetings.filter(
        cat => {
          return cat.enum === meeting.category;
        }
      );

      if (parentPath) {
        this.$router.push(
          `/about/meetings/${parentPath[0].slug}/${meeting.slug}`
        );
      } else {
        // eslint-disable-next-line no-console
        console.error("Category not found in config");
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
            let scheduled = dateFormat(this.expanded[0].scheduledDate);
            //console.log(scheduled);
            this.$ga.event({
              eventCategory: "Meeting",
              eventAction: "Preview",
              eventLabel:
                "Preview: " + this.expanded[0].title + ": " + scheduled
            });
          }
        } else {
          this.expanded.push(value);
          if (this.expanded[0].title) {
            let scheduled = dateFormat(this.expanded[0].scheduledDate);
            //console.log(scheduled);
            this.$ga.event({
              eventCategory: "Meeting",
              eventAction: "Preview",
              eventLabel:
                "Preview: " + this.expanded[0].title + ": " + scheduled
            });
          }
        }
      }
    },
    getCategoryTitle(catEnum) {
      let categoryName = this.$store.getters.config.strapiEnums.meetings.filter(
        c => {
          return c.enum === catEnum;
        }
      );
      return categoryName[0].short;
    }
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

<style lang="scss" scoped></style>
