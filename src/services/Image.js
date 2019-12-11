/* eslint-disable no-unused-vars */
const config = require("@/config.json");
import { EventBus } from "@/event-bus.js";
import axios from "axios";

const ThumborUrlBuilder = require("thumbor-url-builder");
const thumborURL = new ThumborUrlBuilder(
  process.env.VUE_APP_THUMBOR_KEY,
  `${config.imageServerURL}`
);

const getThumbnailLink = function(mediaMaterial) {
  let imagePath;
  if (mediaMaterial && mediaMaterial.thumbnail) {
    imagePath = `${config.baseURL}${mediaMaterial.thumbnail.url}`;
  } else {
    imagePath = config.thumbnail.defaultUrl;
  }
  let ext = imagePath.substr(imagePath.lastIndexOf(".") + 1);
  if (ext === "pdf") {
    imagePath = config.thumbnail.defaultUrl;
  }
  const link = thumborURL
    .setImagePath(`${imagePath}`)
    .resize(config.thumbnail.defaultWidth, config.thumbnail.defaultHeight)
    .smartCrop(false)
    .buildUrl();
  return link;
};

const getDefaultThumbnail = function(mediaMaterial) {
  let imagePath = config.thumbnail.defaultUrl;

  const link = thumborURL
    .setImagePath(`${imagePath}`)
    .resize(config.thumbnail.defaultWidth, config.thumbnail.defaultHeight)
    .smartCrop(false)
    .buildUrl();
  return link;
};

// const getHeadshotLink = function(headshot) {
//   const imagePath = headshot.url;
//   const link = thumborURL
//     .setImagePath(`${config.baseURL}${imagePath}`)
//     .resize(85, 85)
//     .smartCrop(true)
//     .filter("grayscale()")
//     .buildUrl();

//   return link;
// };

const getHeadshotLink = function(headshot) {
  const imagePath = headshot.url;
  const link = thumborURL
    .setImagePath(`${config.baseURL}${imagePath}`)
    .resize(85, 85)
    .smartCrop(true)
    .buildUrl();

  return link;
};

export { getHeadshotLink, getThumbnailLink, getDefaultThumbnail };
