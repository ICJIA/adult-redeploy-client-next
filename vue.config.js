const config = require("./src/config.json");

module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? config.publicPath : "/",
  transpileDependencies: ["vuetify"],
  pluginOptions: {
    moment: {
      locales: ["en"],
    },
  },
  configureWebpack: (webpackConfig) => {
    if (process.env.NODE_ENV === "production") {
      webpackConfig.optimization = webpackConfig.optimization || {};
      webpackConfig.optimization.minimizer = (
        webpackConfig.optimization.minimizer || []
      ).map((plugin) => {
        if (plugin.constructor && plugin.constructor.name === "TerserPlugin") {
          plugin.options = plugin.options || {};
          plugin.options.terserOptions = plugin.options.terserOptions || {};
          plugin.options.terserOptions.compress =
            plugin.options.terserOptions.compress || {};
          plugin.options.terserOptions.compress.drop_console = true;
        }
        return plugin;
      });
    }
  },
};
