<template>
  <div>
    <v-card
      class="mx-auto white mb-8 pb-8 elevation-1"
      outlined
      style="min-height: 150px"
    >
      <v-list-item three-line>
        <v-list-item-avatar
          tile
          size="85"
          color="grey"
          v-if="person.headshot"
          class="hidden-sm-and-down"
        >
          <v-img
            :src="getHeadshotLink(person.headshot)"
            lazy-src="/placeholder-member.png"
          ></v-img>
        </v-list-item-avatar>
        <v-list-item-content>
          <div
            class="overline mb-4"
            style="font-size: 12px !important;"
            v-html="person.membership"
          ></div>

          <v-list-item-title class="headline mb-1"
            ><router-link
              :to="`/about/biographies/${person.slug}`"
              class="no-underline"
              >{{ person.prefix }} {{ person.firstName }}
              {{ person.middleName }} {{ person.lastName }}{{ person.suffix }}
            </router-link></v-list-item-title
          >

          <v-list-item-subtitle v-html="person.title"></v-list-item-subtitle>

          <div
            @click="handleClicks"
            class="dynamic-content mt-5"
            style="line-height: 20px !important"
            v-if="person.content"
            v-html="renderToHtml(person.content)"
          ></div>
          <TagList :tags="person.tags"></TagList>
          <div
            class="mt-5 text-right heavy"
            style="font-size: 12px"
            v-if="displayCategory"
          >
            <div v-if="person.category === 'board'">
              <v-btn small depressed to="/about/oversight"
                >OVERSIGHT BOARD <v-icon right>open_in_new</v-icon></v-btn
              >
            </div>
            <div v-else>
              <v-btn small depressed to="/about/staff"
                >STAFF <v-icon right>open_in_new</v-icon></v-btn
              >
            </div>
          </div>
        </v-list-item-content>
      </v-list-item>
    </v-card>
  </div>
</template>

<script>
import { renderToHtml } from "@/services/Markdown";
import { getHeadshotLink } from "@/services/Image";
import { handleClicks } from "@/mixins/handleClicks";
import TagList from "@/components/TagList";
export default {
  mixins: [handleClicks],
  components: {
    TagList
  },
  data() {
    return {
      renderToHtml,
      getHeadshotLink
    };
  },
  props: {
    person: {
      type: Object,
      default: () => {}
    },
    displayCategory: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style lang="scss" scoped></style>
