/* eslint-disable no-undef */
import "@mdi/font/css/materialdesignicons.css"; // Ensure you are using css-loader
import Vue from "vue";
import Vuetify from "vuetify/lib";

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: "mdi" // default - only for display purposes
  },
  theme: {
    themes: {
      light: {
        primary: "#009688",
        secondary: "#8bc34a",
        accent: "#3f51b5",
        error: "#e91e63",
        warning: "#ffc107",
        info: "#03a9f4",
        success: "#4caf50"
      }
    }
  }
});
