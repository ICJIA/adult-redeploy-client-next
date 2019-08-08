<template>
  <div v-if="content">
    <p v-html="renderToHtml(content[0].content)"></p>
    <div class="text-center mt-6">
      <v-btn class="ma-2" to="/programs/local-programs" outlined color="primary"
        >Find a local program<v-icon right>chevron_right</v-icon></v-btn
      >
    </div>
  </div>
</template>

<script>
import { renderToHtml } from "@/services/Markdown";
export default {
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
