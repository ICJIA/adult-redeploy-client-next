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
        primary: "#045354",
        secondary: "#068587",
        accent: "#3f51b5",
        error: "#e91e63",
        warning: "#ffc107",
        info: "#03a9f4",
        success: "#4caf50"
      }
    }
  }
});
