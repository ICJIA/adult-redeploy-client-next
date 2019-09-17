var https = require("https");
require("dotenv").config();

let request;

const servers = [
  {
    name: "image server",

    options: {
      hostname: `${process.env.VUE_APP_IMAGE_SERVER_URL}`,
      path: "/healthcheck",
      method: "GET"
    },
    server: "image"
  },
  // {
  //   name: "file server",
  //   options: {
  //     hostname: `${process.env.VUE_APP_BASE_API_URL}`,
  //     path: `${process.env.VUE_APP_FILE_SERVER_HEALTHCHECK}`,
  //     method: "GET"
  //   },
  //   server: "file"
  // },
  {
    name: "api server",

    options: {
      hostname: `${process.env.VUE_APP_BASE_API_URL}`,
      path: "/",
      method: "HEAD"
    },
    server: "api"
  },
  {
    name: "web server",

    options: {
      hostname: `${process.env.VUE_APP_BASE_CLIENT_URL}`,
      path: "/.netlify/functions/healthcheck",
      method: "GET"
    },
    server: "web"
  },
  {
    name: "archive server",
    options: {
      hostname: `${process.env.VUE_APP_ARCHIVE_SERVER_URL}`,
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
