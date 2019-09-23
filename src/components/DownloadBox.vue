<template>
  <div>
    <div
      style="background: #eee"
      class="px-8 py-8"
      v-if="content.materials && content.materials.length"
    >
      <h3 style="color: #222;" class="mb-5">{{ header }}</h3>
      <ul
        style="color: #222;"
        class=""
        v-if="content.materials && content.materials.length"
      >
        <div v-for="(file, index) in content.materials" :key="index">
          <li class="mb-4">
            <span class="hover medium"
              ><a
                :href="`${$store.getters.config.baseURL}${file.url}`"
                target="_blank"
                >{{ file.name }}</a
              ></span
            >

            <!-- <span
              style="font-size: 12px; "
              class="hover onClickLink"
              @click="downloadFile(file)"
              >[ Primary {{ linkHeader }}</span
            >
            |
            <span style="font-size: 12px"
              ><a
                :href="`${$store.getters.config.baseURL}${file.url}`"
                target="_blank"
                class="hover "
                >Alternate {{ linkHeader }} ]</a
              ></span
            > -->
          </li>
        </div>
      </ul>
    </div>

    <div style="background: #eee" class="px-6 py-2" v-else>
      <h3 style="color: #222;" class="mb-5">{{ header }}</h3>
      <ul
        style="color: #222;"
        class=""
        v-if="content.externalURL && content.externalURL.length"
      >
        <li>
          <span class=" medium">
            <span v-if="content.externalURLName">
              {{ content.externalURLName }}
            </span>
            <span v-else>
              {{ content.externalURL }}
            </span></span
          >
          <br />
          <span
            style="font-size: 12px; "
            class="hover onClickLink"
            @click="getExternalFile(content.externalURL)"
            >[ External link ]</span
          >
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { getFile, getExternalFile } from "@/services/Download";
export default {
  data() {
    return {
      getExternalFile
    };
  },
  methods: {
    downloadFile(item) {
      // if (item.file) {
      //   return getFile(item.file);
      // }
      console.log(item);
      return getFile(item);
    }
  },

  props: {
    content: {
      type: Object,
      default: () => {}
    },
    header: {
      type: String,
      default: "Meeting Materials"
    },
    linkHeader: {
      type: String,
      default: ""
    }
  }
};
</script>

<style lang="scss" scoped></style>
