<template>
  <div>
    <v-card
      class="mx-auto white mb-8 elevation-1"
      outlined
      style="min-height: 130px"
    >
      <v-list-item three-line>
        <v-list-item-avatar tile size="80" color="grey"></v-list-item-avatar>
        <v-list-item-content>
          <div
            class="overline mb-4"
            style="font-size: 12px !important;"
            v-html="person.membership"
          ></div>
          <v-list-item-title class="headline mb-1"
            >{{ person.firstName }} {{ person.lastName }}</v-list-item-title
          >
          <v-list-item-subtitle>{{ person.title }}</v-list-item-subtitle>

          <div
            class="mt-5"
            v-if="person.content"
            v-html="renderToHtml(person.content)"
          ></div>
        </v-list-item-content>
      </v-list-item>
    </v-card>
  </div>
</template>

<script>
import { renderToHtml } from "@/services/Markdown";
export default {
  data() {
    return {
      renderToHtml
    };
  },
  props: {
    person: {
      type: Object,
      default: () => {}
    }
  }
};
</script>

<style lang="scss" scoped></style>
