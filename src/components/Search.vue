<template>
  <div class="">
    <v-container fluid
      ><v-col cols="12">
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
                  class="card pt-3 "
                >
                  <template slot="contentType">
                    <div
                      class="pl-3 pr-3 pt-3 heavy"
                      style="color: #065f60; font-size: 12px;"
                    >
                      {{ $store.getters.config.clientURL
                      }}{{ $store.getters.config.publicPath
                      }}{{ getCategory(item) | lowerCase }}
                    </div>
                  </template>
                </search-card>
              </template>
            </base-list>
          </div>
        </v-form>
      </v-col></v-container
    >
  </div>
</template>

<script>
import Fuse from "fuse.js";
import BaseList from "@/components/BaseList";
import SearchCard from "@/components/SearchCard";
import { stripHTML } from "@/services/Utilities";

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
      content: "",
      stripHTML
    };
  },
  watch: {
    // eslint-disable-next-line no-unused-vars
    query(newValue, oldValue) {}
  },
  async created() {
    this.fuse = new Fuse(this.searchContent, this.$store.getters.config.search);
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
      if (!item.slug) return;

      if (item.parentPath === "/") {
        return `/${item.slug}`;
      } else {
        return `${item.parentPath}/${item.slug}`;
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
