/* eslint-disable no-console */
require("dotenv").config();
const { request } = require("graphql-request");
const jsonfile = require("jsonfile");

const fs = require("fs");

const api = `https://${process.env.VUE_APP_BASE_API_URL}/graphql`;
const apiDir = "./src";
const fileName = "config.json";

const query = `
{
  configs (where: {name: "default"}) {
    name
    config
  }
}`;

if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir);
  console.log(`Created: ${apiDir}/`);
}

request(api, query).then(res => {
  jsonfile.writeFile(
    `${apiDir}/${fileName}`,
    res["configs"][0]["config"],
    function(err) {
      if (err) console.error(err);
      console.log(`Created: ${apiDir}/${fileName}`);
    }
  );
  //console.log(res);
});
