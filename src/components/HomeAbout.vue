<template>
  <div v-if="content">
    <p
      id="about"
      v-html="renderToHtml(content[0].content)"
      @click="handleClicks"
      class="dynamic-content"
    ></p>
    <!-- <div class="text-center mt-6">
      <v-btn class="ma-2" to="/programs" outlined color="primary"
        >Find a local program<v-icon right>chevron_right</v-icon></v-btn
      >
    </div> -->
    <div class="text-center">
      <router-link to="/programs"
        >Find a local program&nbsp;&raquo;</router-link
      >
    </div>
  </div>
</template>

<script>
import { handleClicks } from "@/mixins/handleClicks";
import { renderToHtml } from "@/services/Markdown";
export default {
  mixins: [handleClicks],
  props: {
    content: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      renderToHtml
    };
  },
  methods: {}
};
</script>

<style lang="scss" scoped></style>
