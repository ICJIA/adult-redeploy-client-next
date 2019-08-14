<template>
  <div>
    <v-data-table
      color="white"
      :headers="headers"
      :items="items"
      :items-per-page="-1"
      class="elevation-1 tagTable"
    >
      <template v-slot:item.lastName="{ item }">
        <span style="font-weight:bold"
          >{{ item.firstName }} {{ item.middleName }} {{ item.lastName }}</span
        >
      </template>
      <template v-slot:item.title="{ item }">
        {{ stripHTML(item.title) }}
      </template>

      <template v-slot:item.slug="{ item }">
        <v-btn small depressed :to="getRoute(item)"
          >More<v-icon right>open_in_new</v-icon></v-btn
        >
      </template></v-data-table
    >
  </div>
</template>

<script>
import { truncate, stripHTML } from "@/services/Utilities";
export default {
  props: {
    items: {
      type: Array,
      default: () => []
    },
    contentType: {
      type: String,
      default: "undefined"
    },
    singletonPath: {
      type: String,
      default: ""
    }
  },
  methods: {
    getRoute(item) {
      if (this.singletonPath.length) {
        return `${this.singletonPath}/${item.slug}`;
      } else {
        return `/${item.section.slug}/${item.slug}`;
      }
    }
  },
  data() {
    return {
      truncate,
      stripHTML,
      headers: [
        {
          text: "Name",
          align: "left",
          sortable: true,
          value: "lastName"
        },
        {
          text: "Title",
          align: "left",
          sortable: true,
          value: "title"
        },

        { text: "Link", value: "slug", align: "center", sortable: false }
      ]
    };
  }
};
</script>

<style lang="scss" scoped></style>
