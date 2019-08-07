<template>
  <div>
    <v-subheader light>{{ createdAt | format }}</v-subheader>
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
    displayUpdatedAt: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style></style>
