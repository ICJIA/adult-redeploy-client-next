module.exports = {
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
