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
        :items="meetings"
        :items-per-page="15"
        :search="search"
        class="elevation-1"
        show-expand
        item-key="title"
        :single-expand="true"
      >
        <template v-slot:item.scheduledDate="{ item }">
          {{ item.scheduledDate | format }}
        </template>
        <template v-slot:item.slug="{ item }">
          <v-btn small depressed :to="getRoute(item)"
            >Read More<v-icon right>open_in_new</v-icon></v-btn
          >
        </template>
        <template v-slot:expanded-item="{ item }">
          <td :colspan="headers.length + 1">
            <div class="py-10">
              <MeetingCard :content="item"></MeetingCard>
            </div>
          </td>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import MeetingCard from "@/components/MeetingCard";
export default {
  components: {
    MeetingCard
  },

  data() {
    return {
      search: "",
      headers: [
        {
          text: "scheduledDate",
          align: "left",
          sortable: false,
          value: "scheduledDate"
        },
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
    getRoute(meeting) {
      let parentPath = this.$store.getters.config.categoryEnums.meetings.filter(
        cat => {
          return cat.enum === meeting.category;
        }
      );

      if (parentPath) {
        return `/about/meetings/${parentPath[0].slug}/${meeting.slug}`;
      } else {
        console.error("Category not found in config");
        return null;
      }
    }
  },

  props: {
    meetings: {
      type: Array,
      default: () => []
    }
  }
};
</script>

<style lang="scss" scoped></style>
