<template>
  <div>
    <v-switch
      v-model="toggle"
      :label="pageHeading"
      class="mb-8"
      :class="{ isExpired: expired, isCurrent: !expired }"
    />
  </div>
</template>

<script>
import { EventBus } from "@/event-bus";
export default {
  name: "Toggle",
  data() {
    return {
      toggle: true
    };
  },
  computed: {
    pageHeading() {
      if (this.toggle) {
        return "current";
      } else {
        return "expired";
      }
    },
    expired() {
      return this.pageHeading === "expired" ? true : false;
    }
  },
  watch: {
    toggle(newValue, oldValue) {
      EventBus.$emit("toggle", this.pageHeading);
    }
  },
  mounted() {
    EventBus.$emit("toggle", this.pageHeading);
  },
  methods: {}
};
</script>

<style scoped></style>
