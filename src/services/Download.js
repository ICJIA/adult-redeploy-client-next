/* eslint-disable no-unused-vars */
const config = require("@/config.json");
import { EventBus } from "@/event-bus.js";

const getFile = urlObj => {
  const fileserverUrl = `${config.baseURL}/file?path=${
    urlObj.url
  }&name=${encodeURIComponent(urlObj.name)}`;
  //console.log(fileserverUrl);
  //location.href = fileserverUrl;
  window.open(fileserverUrl, "_blank,noreferrer,noopener");
};

const getExternalFile = url => {
  //location.href = url;
  window.open(url, "_blank,noreferrer,noopener");
};

export { getFile, getExternalFile };
