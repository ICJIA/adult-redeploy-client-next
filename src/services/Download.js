/* eslint-disable no-unused-vars */
const config = require("@/api/config.json");
import { EventBus } from "@/event-bus.js";

const getFile = urlObj => {
  const fileserverUrl = `${config.baseURL}/file?path=${urlObj.url}&name=${
    urlObj.name
  }`;
  console.log(fileserverUrl);
  location.href = fileserverUrl;
};

const getExternalFile = url => {
  location.href = url;
};

export { getFile, getExternalFile };
