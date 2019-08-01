<template>
  <div class="">
    <v-container
      ><v-flex xs10 offset-xs1>
        <v-form class="pl-2">
          <v-text-field
            ref="textfield"
            v-model="query"
            label="Search"
            placeholder="Search Adult Redeploy Illinois"
            @keyup="instantSearch"
          />

          <div v-if="query.length">
            <base-list v-if="query.length" :items="queryResults" empty="">
              <template slot-scope="item">
                <search-card
                  :item="item"
                  background="#fafafa"
                  elevation="1"
                  class="card pt-3"
                  ><template slot="contentType">
                    <div
                      class="text-right pr-3 pt-3 heavy"
                      style="color: #065f60"
                    >
                      {{ getCategory(item) | upperCase }}
                    </div>
                  </template>
                </search-card>
              </template>
            </base-list>
          </div>
        </v-form>
      </v-flex></v-container
    >
  </div>
</template>

<script>
import Fuse from "fuse.js";
import BaseList from "@/components/BaseList";
import SearchCard from "@/components/SearchCard";

export default {
  components: {
    BaseList,
    SearchCard
  },
  props: {
    searchContent: {
      type: Array,
      default: () => []
    },
    searchQuery: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      query: "",
      queryResults: [],
      content: ""
    };
  },
  watch: {
    // eslint-disable-next-line no-unused-vars
    query(newValue, oldValue) {}
  },
  async created() {
    this.fuse = new Fuse(this.searchContent, {
      shouldSort: true,
      threshold: 0.7,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        "searchMeta",
        "title",
        "summary",
        "content",
        "category",
        "tags.name",
        "createdAt"
      ]
    });
    this.$nextTick(() => {
      this.$refs.textfield.focus();
    });
    if (this.searchQuery) {
      this.query = this.searchQuery;
      this.$nextTick(() => {
        this.$refs.textfield.focus();
      });
      this.instantSearch();
    }
  },
  methods: {
    instantSearch() {
      this.queryResults = this.fuse.search(this.query);
      //console.log(this.fuse.search(this.query));
    },
    getCategory(item) {
      let cat = item.parentPath.split("/");
      console.log(cat);
      // let returnCat;
      // if (cat[1].length) {
      //   switch (cat[1]) {
      //     case "publications":
      //       returnCat = "publication";
      //       break;
      //     case "meetings":
      //       returnCat = "meeting";
      //       break;
      //     case "sites":
      //       returnCat = "site";
      //       break;
      //     default:
      //       returnCat = cat[1];
      //   }
      //   return returnCat;
      // } else {
      //   return "";
      // }
      if (cat[1].length) {
        return cat[1];
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
