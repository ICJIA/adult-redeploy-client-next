/* eslint-disable no-unreachable */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

import { EventBus } from "@/event-bus";
// const config = require("@/config.json");
// const slug = require("slug");
// slug.defaults.mode = "rfc3986";

const searchIndexPromise = process.BROWSER_BUILD
  ? import("@/api/search.json")
  : Promise.resolve(require("@/api/search.json"));

const getSearchIndex = async () => {
  try {
    let searchIndex = await searchIndexPromise;

    let pages = searchIndex["pages"].map(item => {
      item.parentPath = "/";
      return item;
    });

    let news = searchIndex["news"].map(item => {
      item.parentPath = "/news";
      return item;
    });

    let meetings = searchIndex["meetings"].map(item => {
      item.parentPath = "/meetings/" + item.category.slug;
      return item;
    });

    let publications = searchIndex["publications"].map(item => {
      item.parentPath = "/publications/" + item.category.slug;
      //item.slug = slug(item.title);
      return item;
    });

    return [...news, ...pages, ...meetings, ...publications];
  } catch (e) {
    EventBus.$emit("Search service error: ", e.toString());
    console.log(e.toString());
    return [];
  }
};

export { getSearchIndex };
