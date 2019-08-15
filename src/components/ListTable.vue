<template>
  <div>
    <v-data-table
      color="white"
      :headers="headers"
      :items="items"
      :items-per-page="-1"
      class="elevation-1 tagTable"
    >
      <template v-slot:item.title="{ item }">
        <span style="font-weight:bold">{{ item.title }}</span>
      </template>
      <template v-slot:item.scheduledDate="{ item }">
        {{ item.scheduledDate | format }}
      </template>
      <template v-slot:item.publicationDate="{ item }">
        {{ item.publicationDate | format }}
      </template>
      <template v-slot:item.summary="{ item }">
        {{ truncate(stripHTML(item.summary), 10) }}
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
  mounted() {
    Array.prototype.insert = function(index, item) {
      this.splice(index, 0, item);
    };
    if (this.contentType === "meeting") {
      let obj = {
        text: "Scheduled",
        align: "left",
        sortable: true,
        value: "scheduledDate"
      };

      this.headers.insert(0, obj);
    }

    if (this.contentType === "resource") {
      let obj = {
        text: "Publication Date",
        align: "left",
        sortable: true,
        value: "publicationDate"
      };

      this.headers.insert(1, obj);
    }
  },
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
    },
    appendCategory: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    getRoute(item) {
      if (this.singletonPath.length && this.appendCategory) {
        return `${this.singletonPath}/${item.category}/${item.slug}`;
      } else if (this.singletonPath.length) {
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
          text: "Title",
          align: "left",
          sortable: true,
          value: "title"
        },
        {
          text: "Summary",
          align: "left",
          sortable: true,
          value: "summary"
        },
        { text: "Link", value: "slug", align: "center", sortable: false }
      ]
    };
  }
};
</script>

<style lang="scss" scoped></style>
