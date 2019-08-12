/* eslint-disable no-unused-vars */
const config = require("@/api/config.json");
import { EventBus } from "@/event-bus.js";

const getFile = urlObj => {
  const fileserverUrl = `${config.baseURL}/file?path=${urlObj.url}&name=${
    urlObj.name
  }`;
  //console.log(fileserverUrl);
  //location.href = fileserverUrl;
  window.open(fileserverUrl, "_blank");
};

const getExternalFile = url => {
  //location.href = url;
  window.open(url, "_blank");
};

export { getFile, getExternalFile };
