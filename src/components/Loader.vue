<template>
  <div class="text-center my-12" style="height: 300px">
    <v-progress-circular
      indeterminate
      color="primary"
      size="50"
    ></v-progress-circular>
  </div>
</template>

<script>
export default {
  mounted() {
    console.log("Loader route", this.$route);
  }
};
</script>

<style lang="scss" scoped></style>
