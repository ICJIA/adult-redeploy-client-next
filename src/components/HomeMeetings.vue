<template>
  <div>
    <span
      style="display: block; font-size: 32px; font-weight: 900; padding-bottom: 7px !important; border-bottom: 1px solid #aaa !important;"
      class="hover meetingTitle"
      @click="$router.push('/about/meetings')"
      >UPCOMING MEETINGS</span
    >
    <div v-if="content && content.length">
      <div class="mt-8">
        <div v-for="(meeting, index) in content" :key="index">
          <v-card
            class="mx-auto mb-10 hover card"
            outlined
            @click="routeTo(meeting)"
          >
            <v-list-item three-line>
              <v-list-item-content>
                <div
                  class="overline mb-4"
                  style="font-size: 12px !important; font-weight: bold !important; color: #05797A"
                >
                  <strong
                    >Scheduled: {{ meeting.scheduledDate | format }}</strong
                  >
                </div>
                <v-list-item-title class="headline mb-1">{{
                  meeting.title
                }}</v-list-item-title>
                <v-list-item-subtitle
                  style="line-height: 1.5em"
                  class="mt-3"
                  v-if="meeting.summary && meeting.summary.length > 0"
                  >{{ meeting.summary | truncate(30) }}</v-list-item-subtitle
                >
              </v-list-item-content>
            </v-list-item>
            <div class="text-right">
              <v-card-actions>
                <v-btn text @click="routeTo(meeting)"
                  >Read more<v-icon right>chevron_right</v-icon></v-btn
                >
              </v-card-actions>
            </div>
          </v-card>
        </div>
      </div>
    </div>
    <div v-else class="text-center mt-12 mb-12">
      <h3>No meetings scheduled.</h3>
    </div>
  </div>
</template>

<script>
import { strapiEnumToObject } from "@/services/Utilities";
export default {
  props: {
    content: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    routeTo(meeting) {
      let category = strapiEnumToObject("meetings", meeting.category);
      let url = `/about/meetings/${category[0].slug}/${meeting.slug}`;
      this.$router.push(url).catch(err => {
        this.$vuetify.goTo(0);
      });
    }
  }
};
</script>

<style>
.meetingTitle:hover {
  color: #aaa;
}
</style>
