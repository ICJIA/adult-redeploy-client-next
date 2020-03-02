<template>
  <v-alert v-model="alert" text dismissible color="info" class="mb-0">
    <div style="color: #000 !important">
      <v-icon color="red">error</v-icon>

      View up to date information on how Illinois is handling the Coronavirus
      Disease 2019 (COVID-19) from the

      <a
        href="http://www.dph.illinois.gov/topics-services/diseases-and-conditions/diseases-a-z-list/coronavirus"
        style="text-decoration: underline;"
        >Illinois Department of Public Health</a
      >
    </div>
  </v-alert>
</template>

<script>
export default {
  data() {
    return {
      alert: true
    };
  },
  methods: {
    reset() {
      this.alert = true;
    }
  }
};
</script>
