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
        :items="resources"
        :items-per-page="15"
        :search="search"
        class="elevation-1 detailTable"
        show-expand
        item-key="title"
        :single-expand="true"
      >
        <template v-slot:item.publicationDate="{ item }">
          {{ item.publicationDate | format }}
        </template>

        <template v-slot:item.category="{ item }" v-if="!hideCategory">
          {{ getCategoryTitle(item.category) }}
        </template>

        <template v-slot:item.slug="{ item }">
          <v-btn small depressed :to="getRoute(item)"
            ><v-icon>link</v-icon></v-btn
          >
        </template>

        <template v-slot:item.data-table-expand="{ item, isExpanded, expand }">
          <v-btn
            color="grey lighten-2"
            small
            depressed
            @click="expand(true)"
            v-if="!isExpanded"
            >More<v-icon right>arrow_drop_down</v-icon></v-btn
          >
          <v-btn small depressed @click="expand(false)" v-if="isExpanded"
            >Less<v-icon right>arrow_drop_up</v-icon></v-btn
          >
        </template>
        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length + 2">
            <div class="py-5">
              {{ item }}
            </div>
          </td>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
export default {
  components: {},
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
  },

  data() {
    return {
      search: "",
      headers: [
        {
          text: "Publication Date",
          align: "left",
          sortable: true,
          value: "publicationDate"
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
    getRoute(resource) {
      let parentPath = this.$store.getters.config.categoryEnums.resources.filter(
        cat => {
          return cat.enum === resource.category;
        }
      );

      if (parentPath) {
        return `/about/resources/${parentPath[0].slug}/${resource.slug}`;
      } else {
        console.error("Category not found in config");
        return null;
      }
    },
    getCategoryTitle(catEnum) {
      let categoryName = this.$store.getters.config.categoryEnums.resources.filter(
        c => {
          return c.enum === catEnum;
        }
      );
      return categoryName[0].short;
    }
  },

  props: {
    resources: {
      type: Array,
      default: () => []
    },
    hideCategory: {
      type: Boolean,
      default: true
    }
  }
};
</script>

<style lang="scss" scoped></style>
