const config = require("./src/config.json");

module.exports = {
  publicPath: process.env.NODE_ENV === `production` ? config.publicPath : "/",
  transpileDependencies: ["vuetify"],
  pluginOptions: {
    moment: {
      locales: ["en"]
    }
  }
};
