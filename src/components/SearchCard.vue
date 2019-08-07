<template>
  <div class="mb-4">
    <v-hover>
      <v-card
        slot-scope="{ hover }"
        :style="{ background: background }"
        :class="`elevation-${hover ? 12 : elevation}`"
        class="hover px-3 py-3"
        @click="route(item)"
      >
        <slot name="contentType" />
        <h2 class="py-2 px-3">
          <div v-if="item.firstName && item.lastName">
            {{ item.firstName }} {{ item.lastName }}
          </div>
          <div v-else>{{ item.title }}</div>
        </h2>

        <div v-if="item.firstName && item.lastName">
          <h3 class="pb-2 px-3" style="color: #aaa; font-size: 14px">
            {{ item.title }}
          </h3>
        </div>

        <v-card-text class="px-3 pb-5">
          <div v-if="item.firstName && item.lastName && item.content">
            {{ item.content | truncate(25) }}
          </div>
          <div v-else>{{ item.summary }}</div>
        </v-card-text>

        <slot name="tags" />
      </v-card>
    </v-hover>
  </div>
</template>

<script>
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
    return {};
  },
  mounted() {},
  methods: {
    route(item) {
      if (!item.slug) return;

      if (item.parentPath === "/") {
        this.$router.push(`/${item.slug}`);
      } else {
        this.$router.push(`${item.parentPath}/${item.slug}`);
      }
    }
  }
};
</script>

<style></style>
