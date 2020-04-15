<template>
  <v-alert
    icon="mdi-alert"
    border="left"
    prominent
    dense
    text
    dismissible
    color="info"
    class="px-6 py-4"
  >
    <span style="color: #000 !important">
      <span v-if="loading && !errorMsg"
        ><v-progress-circular
          indeterminate
          color="primary"
          class="ml-5"
          size="25"
        ></v-progress-circular
        ><span style="font-size: 12px; font-weight: bold;" class="ml-5"
          >Loading the latest COVID-19 information</span
        ></span
      >

      <span v-if="corona && !errorMsg" v-html="corona.html"></span>
    </span>
    <span v-if="errorMsg" class="text-center">
      {{ errorMsg }}. Please reload the page to view the latest COVID-19
      information.
    </span>
  </v-alert>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      alert: true,
      loading: true,
      corona: null,
      errorMsg: null
    };
  },
  async created() {
    this.loading = true;
    try {
      let { data } = await axios.get(`https://coronavirus.icjia-api.cloud/v2`);
      this.corona = data;
    } catch (e) {
      this.errorMsg = e;
    }

    this.loading = false;
  },
  methods: {
    reset() {
      this.alert = true;
    }
  },
  props: {}
};
</script>
