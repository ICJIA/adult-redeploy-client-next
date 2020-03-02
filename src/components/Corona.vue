<template>
  <div v-if="alert">
    <v-system-bar
      style=""
      height="50px"
      app
      color="blue lighten-5"
      class="breadcrumb"
    >
      <v-icon color="red">error</v-icon>
      <span style="font-weight: 900!important" v-html="html"></span>
      <v-spacer></v-spacer>
      <v-btn small @click="closeWarning">CLOSE</v-btn>
    </v-system-bar>
  </div>
</template>

<script>
import { EventBus } from "@/event-bus";
export default {
  computed: {
    alert() {
      return this.showWarning;
    }
  },
  data() {
    return {
      html:
        "View up to date information on how Illinois is handling the Coronavirus Disease 2019 (COVID-19) from the <a href='http://www.dph.illinois.gov/topics-services/diseases-and-conditions/diseases-a-z-list/coronavirus'>Illinois Department of Public Health</a>."
    };
  },
  props: {
    showWarning: {
      type: Boolean,
      default: true
    }
  },
  mounted() {},
  methods: {
    closeWarning() {
      EventBus.$emit("showWarning", false);
    }
  }
};
</script>

<style></style>
