/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
"use strict";

const { MD5 } = require("crypto-js");
const {
  getFrontPageNews,
  getAllPublications,
  getNews,
  getPage,
  getPost
} = require("./test-content-service");

let cache = new Map();

const isItCached = function(hash) {
  return cache.has(hash);
};

const getHash = salt => {
  let hash = MD5(salt).toString();
  return hash;
};

const getContentFromCache = async (map, key) => {
  if (map.get(key)) {
    let content = await cache.get(map.get(key).hash);
    return content;
  } else {
    return [];
  }
};

const checkIfValid = arr => {
  if (arr) {
    return !!arr.length;
  } else {
    return 0;
  }
};

const routeTo404 = ({ msg, statusCode }) => {
  console.log(msg, statusCode);
};

const clearCache = () => {
  console.log("cache cleared");
  return cache.clear();
};

const cacheContent = async contentMap => {
  let start = new Date();
  let queries = [],
    hashes = [];

  for (const [key, value] of contentMap.entries()) {
    let params;
    if (!value.hash) {
      throw "Hash must be specified";
    }
    if (!value.query) {
      throw "Query must be specified";
    }

    value.params ? (params = value.params) : (params = {});
    if (!isItCached(value.hash, cache)) {
      hashes.push(value.hash);
      queries.push(value.query.call(this, params));
    } else {
      console.log("already in cache");
    }
  }

  if (queries.length) {
    try {
      let res = await Promise.all(queries);
      res.forEach((query, index) => {
        cache.set(hashes[index], query);
        console.log(hashes[index], ": cached");
      });
      let end = new Date() - start;
      console.log(`cacheContent() timing: ${end}ms`);
      return res;
    } catch (e) {
      console.log("Error: ", e);
    }
  }

  return;
};

(async function init() {
  let start, end, test;

  const contentMap01 = new Map();
  const limit = 1;
  contentMap01.set("frontPageNews", {
    hash: getHash("contentMap01-getFrontPageNews"),
    query: getFrontPageNews,
    params: { limit }
  });

  contentMap01.set("news", {
    hash: getHash("contentMap01-getNews"),
    query: getNews
  });

  const contentMap02 = new Map();
  contentMap02.set("publications", {
    hash: getHash("contentMap02-getAllPublications"),
    query: getAllPublications
  });

  const contentMap03 = new Map();

  let slug = "test-post-11";
  contentMap03.set("post", {
    hash: getHash(`${slug}-post`),
    query: getPost,
    params: { slug }
  });

  await cacheContent(contentMap01);

  await cacheContent(contentMap02);

  //console.log("cache size: ", cache.size);

  let content = await getContentFromCache(contentMap01, "frontPageNews");
  console.log(content);

  checkIfValid(content)
    ? console.log("valid page")
    : routeTo404({ msg: "Page not found", statusCode: 404 });
})();
