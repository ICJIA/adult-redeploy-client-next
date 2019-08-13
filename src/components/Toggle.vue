<template>
  <v-switch
    v-model="toggle"
    :label="displayLabel()"
    style="font-weight: bold;"
  ></v-switch>
</template>

<script>
import { EventBus } from "@/event-bus";
export default {
  data() {
    return {
      toggle: true
    };
  },

  methods: {
    displayLabel() {
      return this.toggle ? this.on : this.off;
    },
    emitToggle() {
      let payload = {};
      if (this.toggle) {
        payload.message = this.on;
      } else {
        payload.message = this.off;
      }
      payload.name = this.name;
      EventBus.$emit("toggle", payload);
    }
  },
  mounted() {
    this.emitToggle();
  },
  watch: {
    // eslint-disable-next-line no-unused-vars
    toggle(newValue, oldValue) {
      this.emitToggle();
    }
  },
  beforeDestroy() {},
  props: {
    on: {
      type: String,
      default: "on"
    },
    off: {
      type: String,
      default: "off"
    },
    name: {
      type: String,
      default: "undefined"
    }
  }
};
</script>

<style lang="scss" scoped></style>
