<template>
  <div>
    <div
      style="background: #eee"
      class="px-8 py-8"
      v-if="content.mediaMaterial && content.mediaMaterial.length"
    >
      <h3 style="color: #222;" class="mb-5">{{ header[0] }}</h3>

      <ul
        style="color: #222;"
        class=""
        v-if="content.mediaMaterial && content.mediaMaterial.length"
      >
        <div v-for="(item, index) in content.mediaMaterial" :key="index">
          <li class="mb-4">
            <span class="hover medium">
              <a
                :href="`${$store.getters.config.baseURL}${item.file.url}`"
                target="_blank"
                >{{ item.name }}</a
              >
              <div class="mt-1" v-if="item.summary">{{ item.summary }}</div>
            </span>
            <br />
          </li>
        </div>
      </ul>
      <div
        v-if="
          content.externalMediaMaterial && content.externalMediaMaterial.length
        "
      >
        <h3 style="color: #222;" class="mb-5">{{ header[1] }}</h3>

        <ul
          style="color: #222;"
          class=""
          v-if="
            content.externalMediaMaterial &&
              content.externalMediaMaterial.length
          "
        >
          <div
            v-for="(item, index) in content.externalMediaMaterial"
            :key="index"
          >
            <li class="mb-4">
              <a :href="`${item.url}`" target="_blank">{{ item.name }}</a>
              <div class="mt-1" v-if="item.summary">{{ item.summary }}</div>

              <br />
            </li>
          </div>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { renderToHtml } from "@/services/Markdown";
import { handleClicks } from "@/mixins/handleClicks";
export default {
  data() {
    return {
      renderToHtml
    };
  },
  mixins: [handleClicks],
  methods: {},

  props: {
    content: {
      type: Object,
      default: () => {}
    },
    header: {
      type: Array,
      default: () => ["Materials", "Additional Links"]
    },
    linkHeader: {
      type: String,
      default: ""
    }
  }
};
</script>

<style lang="scss" scoped></style>
