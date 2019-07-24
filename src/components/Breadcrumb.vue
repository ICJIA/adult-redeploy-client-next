<template>
  <v-system-bar
    v-if="!this.$route.meta.hideBreadcrumb"
    style=""
    dark
    app
    color="primary"
    class="breadcrumb"
  >
  </v-system-bar>
</template>

<script>
export default {
  mounted() {}
};
</script>

<style lang="scss" scoped></style>
