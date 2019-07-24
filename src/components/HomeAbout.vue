<template>
  <div>
    <p v-html="render(content[0].content)"></p>
    <div class="text-center mt-6">
      <v-btn class="ma-2" to="/programs" outlined color="primary"
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
    return {};
  },
  methods: {
    render(content) {
      return renderToHtml(content);
    }
  }
};
</script>

<style lang="scss" scoped></style>
