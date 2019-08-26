exports.handler = function(event, context, callback) {
  const axios = require("axios");
  require("dotenv").config();
  const api = axios.create({
    baseURL: `https://${process.env.VUE_APP_BASE_API_URL}`
  });

  api
    .post("/auth/local", {
      identifier: process.env.SERVERLESS_USERNAME,
      password: process.env.SERVERLESS_PASSWORD
    })
    .then(res => {
      const token = res.data.jwt;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      return api
        .post("/logs", {
          event: "deploy-failed",
          provider: "strapi",
          datetimestamp: new Date()
        })
        .then(r => {
          const res = JSON.stringify(r.data);
          console.log(res);
          callback(null, {
            statusCode: 200,
            body: res
          });
        });
    });
};
