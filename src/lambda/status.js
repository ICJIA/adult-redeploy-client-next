/* eslint-disable no-unused-vars */
var https = require("https");
// const axios = require("axios");
require("dotenv").config();
let request;

const servers = [
  {
    url: "https://image.icjia.cloud/healthcheck",
    name: "image server",
    provider: "Thumbor",
    providerURL: "https://thumbor.readthedocs.io/en/latest/index.html",
    users: ["ARI", "ICJIA"]
  },
  {
    url:
      "https://ari.icjia-api.cloud/file?path=/uploads/8171e679ad8544f4b81f55f0efe56b0f.pdf&name=healthcheck.pdf",
    name: "fileserver",
    provider: "ARI",
    providerURL:
      "https://gist.github.com/cschweda/8315c54d04ddb14519214b0af941030e",
    users: ["ARI"]
  },
  // {
  //   url: "https://ari.icjia-api.cloud",
  //   name: "api",
  //   provider: "Strapi",
  //   providerURL: "https://strapi.io/",
  //   users: ["ARI"]
  // },
  {
    url: "https://ari.netlify.com/.netlify/functions/healthcheck",
    name: "web",
    provider: "Netlify",
    providerURL: "https://www.netlify.com/",
    users: ["ARI"]
  }
];

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept",
  "Content-Type": "application/json",
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Max-Age": "2592000",
  "Access-Control-Allow-Credentials": "true"
};

function queryServer(server) {
  return new Promise(function(resolve, reject) {
    request = https.get(server.url, response => {
      server.status = response.statusCode;
      resolve(server);
    });
    request.on("error", error => {
      server.status = error;
      resolve(server);
    });
  });
}
exports.handler = async (event, context) => {
  let arr = [];
  servers.forEach((server, index) => {
    let s = queryServer(servers[index]);
    arr.push(s);
  });
  let response = await Promise.all(arr);
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(response)
  };
};
