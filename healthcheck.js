const https = require("https");

const options = {
  hostname: "ari.icjia-api.cloud",
  port: 443,
  path: "/_health",
  method: "HEAD"
};

const req = https.request(options, res => {
  console.log("statusCode:", res.statusCode);
  console.log("headers:", res.headers);

  res.on("data", d => {
    process.stdout.write(d);
  });
});

req.on("error", e => {
  console.error(e);
});
req.end();
