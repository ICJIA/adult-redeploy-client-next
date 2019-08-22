<template>
  <div style="margin-top: 110px; background: #eee;" v-if="displayBanner">
    <!-- <h1 style="color: #555; font-size: 20px">
      You're using an <strong>outdated</strong> version of Internet Explorer.<br /><br />We
      recommend updating to a more secure, modern browser.<br /><br />Please
      download the latest version of
      <a href="https://www.google.com/chrome" target="_blank" rel="noreferrer"
        >Chrome</a
      >,
      <a
        href="https://www.mozilla.org/en-US/firefox/new/"
        target="_blank"
        rel="noreferrer"
        >Firefox</a
      >, or
      <a
        href="https://www.microsoft.com/en-us/windows/microsoft-edge"
        rel="noreferrer"
        target="_blank"
        >Microsoft Edge</a
      >.
    </h1> -->
    <v-banner two-line style="background: #eee">
      <v-avatar slot="icon" color="red accent-4" size="40">
        <v-icon color="white">
          warning
        </v-icon>
      </v-avatar>

      You're using an <strong>outdated</strong> version of Internet Explorer. We
      recommend updating to a more secure, modern browser. Please download the
      latest version of
      <a href="https://www.google.com/chrome" target="_blank" rel="noreferrer"
        >Chrome</a
      >,
      <a
        href="https://www.mozilla.org/en-US/firefox/new/"
        target="_blank"
        rel="noreferrer"
        >Firefox</a
      >, or
      <a
        href="https://www.microsoft.com/en-us/windows/microsoft-edge"
        rel="noreferrer"
        target="_blank"
        >Microsoft Edge</a
      >.

      <template v-slot:actions>
        <v-btn text @click="dismiss">Dismiss</v-btn>
      </template>
    </v-banner>
  </div>
</template>

<script>
export default {
  data() {
    return {
      displayBanner: true
    };
  },
  methods: {
    dismiss() {
      this.displayBanner = false;
    }
  },
  mounted() {
    //console.log("Browser info: ", this.$browserDetect.meta);
  }
};
</script>

<style scoped>
a {
  color: #aaa !important;
}
</style>
