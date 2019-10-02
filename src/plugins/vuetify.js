/* eslint-disable no-undef */
import "@mdi/font/css/materialdesignicons.css"; // Ensure you are using css-loader
import Vue from "vue";
import Vuetify from "vuetify/lib";
import "vuetify/dist/vuetify.min.css";

Vue.use(Vuetify);

var opts = {
  icons: {
    iconfont: "mdi" // default - only for display purposes
  },
  theme: {
    themes: {
      light: {
        primary: "#065f60",
        secondary: "#067879",
        accent: "#3f51b5",
        error: "#e91e63",
        warning: "#ffc107",
        info: "#03a9f4",
        success: "#4caf50"
      }
    }
  }
};
export default new Vuetify(opts);
