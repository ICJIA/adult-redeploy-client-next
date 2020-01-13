const config = require("./src/config.json");
const xss = require("xss");

const axios = require("axios");
const api = axios.create({
  baseURL: config.baseURL,
  timeout: 10000
});

async function getGATAFunding() {
  let content = await api({
    url: "https://icjia.illinois.gov/gata/api/meta/funding.json",
    method: "get"
  });
  return content;
}

async function init() {
  let res = await getGATAFunding();
  console.log(res);
}

init();
