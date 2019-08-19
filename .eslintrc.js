module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ["plugin:vue/essential", "@vue/prettier"],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? 0 : 0,
    "no-debugger": process.env.NODE_ENV === "production" ? 2 : 0
  },
  parserOptions: {
    parser: "babel-eslint"
  },
  plugins: ["vuetify"],
  rules: {
    "vuetify/no-deprecated-classes": "error",
    "vuetify/grid-unknown-attributes": "error",
    "vuetify/no-legacy-grid": "error"
  }
};
