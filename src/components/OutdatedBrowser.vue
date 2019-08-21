<template>
  <div
    class="text-center"
    style="margin-top: 130px; background: #eee; padding-top: 35px; padding-bottom: 25px; padding-right: 25px; padding-left: 25px"
  >
    <h1 style="color: #555; font-size: 20px">
      You're using an outdated version of
      <strong>Internet Explorer</strong>.<br /><br />We recommend updating to a
      more secure, modern browser.<br /><br />Please update to the latest
      version of
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
    </h1>
  </div>
</template>

<script>
export default {
  mounted() {
    console.log("Browser info: ", this.$browserDetect.meta);
  }
};
</script>

<style scoped>
a {
  color: #aaa !important;
}
</style>
