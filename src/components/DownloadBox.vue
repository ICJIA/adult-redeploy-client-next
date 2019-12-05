<template>
  <div
    v-if="
      content.mediaMaterial ||
        content.externalMediaMaterial ||
        content.meetingMaterial
    "
  >
    <div v-if="content.mediaMaterial && content.mediaMaterial.length">
      <div style="background: #eee" class="mt-8 px-8 py-8">
        <h3 style="color: #222;" class="mb-5">{{ header[0] }}</h3>

        <ul style="color: #222;" class="" v-if="content.mediaMaterial.length">
          <div v-for="(item, index) in content.mediaMaterial" :key="index">
            <li class="mb-4" v-if="item.file">
              <span class="hover medium">
                <a
                  :href="`${$store.getters.config.baseURL}${item.file.url}`"
                  target="_blank"
                  @click="fireDownloadEvent(item)"
                  >{{ item.name }}</a
                >
                <div class="mt-1" v-if="item.summary">{{ item.summary }}</div>
              </span>
              <br />
            </li>
          </div>
        </ul>
      </div>
    </div>
    <div
      v-if="
        content.externalMediaMaterial && content.externalMediaMaterial.length
      "
    >
      <div style="background: #eee" class="mt-8 px-8 py-8">
        <h3 style="color: #222;" class="mt-5 mb-5">{{ header[1] }}</h3>

        <ul
          style="color: #222;"
          class=""
          v-if="content.externalMediaMaterial.length"
        >
          <div
            v-for="(item, index) in content.externalMediaMaterial"
            :key="index"
          >
            <li class="mb-4" v-if="item.url">
              <a :href="`${item.url}`" target="_blank">{{ item.name }}</a>
              <div class="mt-1" v-if="item.summary">{{ item.summary }}</div>

              <br />
            </li>
          </div>
        </ul>
      </div>
    </div>

    <div v-if="content.meetingMaterial && content.meetingMaterial.length">
      <div style="background: #eee" class="mt-8 px-8 py-8">
        <h3 style="color: #222;" class="mb-5">{{ header[2] }}</h3>

        <ul style="color: #222;" class="" v-if="content.meetingMaterial.length">
          <div v-for="(item, index) in content.meetingMaterial" :key="index">
            <li class="mb-4">
              <a
                :href="`${$store.getters.config.baseURL}${item.file.url}`"
                target="_blank"
                @click="fireDownloadEvent(item)"
                >{{ item.name }}</a
              >
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
  methods: {
    fireDownloadEvent(item) {
      if (item.file[0]) {
        let ext = item.file[0].name.split(".").pop();
        console.log("Download event: ", item.file[0].hash + "." + ext);
        console.log(item.file);
        this.$ga.event({
          eventCategory: "File",
          eventAction: "Download",
          eventLabel: item.file[0].hash + "." + ext
        });
      }
    }
  },

  props: {
    content: {
      type: Object,
      default: () => {}
    },
    header: {
      type: Array,
      default: () => ["Downloads", "External Links", "Meeting Materials"]
    },
    linkHeader: {
      type: String,
      default: ""
    }
  }
};
</script>

<style lang="scss" scoped></style>
