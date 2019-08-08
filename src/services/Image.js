/* eslint-disable no-unused-vars */
const config = require("@/api/config.json");
import { EventBus } from "@/event-bus.js";
import axios from "axios";

const ThumborUrlBuilder = require("thumbor-url-builder");
const thumborURL = new ThumborUrlBuilder(
  process.env.VUE_APP_THUMBOR_KEY,
  `${config.imageServerURL}`
);

const getHeadshotLink = function(headshot) {
  const imagePath = headshot.url;
  const link = thumborURL
    .setImagePath(`${config.baseURL}${imagePath}`)
    .resize(85, 85)
    .smartCrop(true)
    .filter("grayscale()")
    .buildUrl();

  return link;
};

export { getHeadshotLink };
