<template>
  <div>
    <v-subheader light
      >{{ lastPostedLabel }}&nbsp;{{ createdAt | format }}</v-subheader
    >
  </div>
</template>

<script>
export default {
  props: {
    createdAt: {
      type: String,
      default: ""
    },
    updatedAt: {
      type: String,
      default: ""
    },
    lastPostedLabel: {
      type: String,
      default: ""
    },
    displayUpdatedAt: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style></style>
