const config = require("./src/config.json");

module.exports = {
  publicPath: process.env.NODE_ENV === `production` ? config.publicPath : "/",
  chainWebpack: config => {
    config
      .entry("app")
      .clear()
      .add("./src/entry.js");
  },
  css: {
    loaderOptions: {
      sass: {
        data: `@import "~@/sass/main.scss"`
      }
    }
  },
  transpileDependencies: ["vuetify"],
  pluginOptions: {
    moment: {
      locales: ["en"]
    }
  }
};
