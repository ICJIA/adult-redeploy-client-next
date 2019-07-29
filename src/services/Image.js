/* eslint-disable no-unused-vars */
const config = require("@/api/config.json");
import { EventBus } from "@/event-bus.js";
import axios from "axios";

const ThumborUrlBuilder = require("thumbor-url-builder");
const thumborURL = new ThumborUrlBuilder(
  process.env.VUE_APP_THUMBOR_KEY,
  `${config.imageServerURL}`
);

const getThumbnailLink = function(path) {
  const imagePath = path.thumbnail
    ? `${config.baseURL}${path.thumbnail.url}`
    : config.thumbnail.defaultUrl;
  const link = thumborURL
    .setImagePath(`${imagePath}`)
    .resize(config.thumbnail.defaultWidth, config.thumbnail.defaultHeight)
    .smartCrop(false)
    .buildUrl();
  return link;
};

const getFrontPageImageLink = function(path) {
  const imagePath = path
    ? `${config.baseURL}${path}`
    : config.thumbnail.defaultUrl;
  const link = thumborURL
    .setImagePath(`${imagePath}`)

    .smartCrop(false)
    .buildUrl();
  console.log(link);
  return link;
};

const getModalImageLink = function(path) {
  const imagePath = path.thumbnail
    ? `${config.baseURL}${path.thumbnail.url}`
    : config.thumbnail.defaultUrl;
  const link = thumborURL
    .setImagePath(`${imagePath}`)
    .resize(600, 750)
    .smartCrop(false)
    .buildUrl();
  return link;
};

export { getFrontPageImageLink, getModalImageLink, getThumbnailLink };
