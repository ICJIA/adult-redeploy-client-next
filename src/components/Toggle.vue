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
      return this.toggle ? this.toggleOn : this.toggleOff;
    },
    emitToggle() {
      let payload = {};
      if (this.toggle) {
        payload.message = this.toggleOn;
      } else {
        payload.message = this.toggleOff;
      }
      payload.name = this.name;
      console.log("toggle: ", payload.message);
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
    toggleOn: {
      type: String,
      default: "on"
    },
    toggleOff: {
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
