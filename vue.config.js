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
  transpileDependencies: ["vuetify", "markdown-it-attrs"],
  pluginOptions: {
    moment: {
      locales: ["en"]
    }
  }
};
