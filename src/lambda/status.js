var https = require("https");
require("dotenv").config();
let request;

const servers = [
  {
    name: "image server",
    // provider: "Thumbor",
    // providerURL: "https://thumbor.readthedocs.io/en/latest/index.html",
    // users: ["ARI", "ICJIA"],
    options: {
      hostname: "image.icjia.cloud",
      path: "/healthcheck",
      method: "GET"
    },
    server: "image"
  },
  {
    name: "file server",
    // provider: "ARI",
    // providerURL:
    //   "https://gist.github.com/cschweda/8315c54d04ddb14519214b0af941030e",
    // users: ["ARI"],
    options: {
      hostname: "ari.icjia-api.cloud",
      path:
        "/file?path=/uploads/8171e679ad8544f4b81f55f0efe56b0f.pdf&name=healthcheck.pdf",
      method: "GET"
    },
    server: "file"
  },
  {
    name: "api server",
    // provider: "Strapi",
    // providerURL: "https://strapi.io/",
    // users: ["ARI"],
    options: {
      hostname: "ari.icjia-api.cloud",
      path: "/",
      method: "HEAD"
    },
    server: "api"
  },
  {
    name: "web server",
    // provider: "Netlify",
    // providerURL: "https://www.netlify.com/",
    // users: ["ARI"],
    options: {
      hostname: "ari-dev.netlify.com",
      path: "/.netlify/functions/healthcheck",
      method: "GET"
    },
    server: "web"
  },
  {
    name: "archive server",
    options: {
      hostname: "ari.icjia-api.cloud",
      path: "/",
      method: "HEAD"
    },
    server: "archive"
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
  // eslint-disable-next-line no-unused-vars
  return new Promise(function(resolve, reject) {
    let start = new Date();
    request = https.get(server.options, response => {
      let end = new Date();
      let duration = end - start;
      server.status = response.statusCode;
      server.statusMessage = response.statusMessage;
      server.duration = duration + "ms";
      // server.headers = JSON.stringify(response.headers);
      resolve(server);
    });
    request.on("error", error => {
      server.status = error;
      resolve(server);
    });
  });
}
// eslint-disable-next-line no-unused-vars
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
