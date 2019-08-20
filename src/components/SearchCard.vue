<template>
  <div class="mb-4">
    <v-hover>
      <v-card
        slot-scope="{ hover }"
        :style="{ background: background }"
        :class="`elevation-${hover ? 12 : elevation}`"
        class="hover px-5 pt-1 pb-10"
        @click="route(item)"
      >
        <h2 class="">
          <div v-if="item.firstName && item.lastName">
            {{ item.prefix }} {{ item.firstName }} {{ item.middleName }}
            {{ item.lastName }}
            {{ item.suffix }}
          </div>
          <div v-else>{{ item.title }}</div>
        </h2>

        <div v-if="item.firstName && item.lastName">
          <h3 class="" style="color: #aaa; font-size: 14px">
            {{ stripHTML(item.title) }}
          </h3>
        </div>

        <v-card-text class="">
          <div v-if="item.firstName && item.lastName && item.content">
            {{ stripHTML(item.content) | truncate(25) }}
          </div>
          <div v-else>
            <span v-if="item.summary">{{ stripHTML(item.summary) }}</span>
          </div>
        </v-card-text>

        <slot name="tags" />
        <slot name="contentType" />
      </v-card>
    </v-hover>
  </div>
</template>

<script>
import { stripHTML } from "@/services/Utilities";
export default {
  props: {
    item: {
      type: Object,
      default: null
    },
    background: {
      type: String,
      default: "#fff"
    },
    elevation: {
      type: String,
      default: "1"
    }
  },
  data() {
    return {
      stripHTML
    };
  },
  mounted() {},
  methods: {
    route(item) {
      if (!item.slug) return;

      if (item.parentPath === "/") {
        // eslint-disable-next-line no-unused-vars
        this.$router.push(`/${item.slug}`).catch(err => {
          this.$vuetify.goTo(0);
        });
      } else {
        // eslint-disable-next-line no-unused-vars
        this.$router.push(`${item.parentPath}/${item.slug}`).catch(err => {
          this.$vuetify.goTo(0);
        });
      }
    }
  }
};
</script>

<style></style>
