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
      default: () => [],
    },
  },
  data() {
    return {
      renderToHtml,
    };
  },
  methods: {},
  updated() {
    // Fix unsized CMS images — add height when only width is set
    const imgs = this.$el.querySelectorAll("img[width]:not([height])");
    imgs.forEach(function (img) {
      if (img.naturalWidth && img.naturalHeight) {
        var ratio = img.naturalHeight / img.naturalWidth;
        img.setAttribute("height", Math.round(parseInt(img.width) * ratio));
      } else {
        img.addEventListener("load", function () {
          var ratio = img.naturalHeight / img.naturalWidth;
          img.setAttribute("height", Math.round(parseInt(img.width) * ratio));
        });
      }
    });
  },
};
</script>

<style lang="scss" scoped></style>
