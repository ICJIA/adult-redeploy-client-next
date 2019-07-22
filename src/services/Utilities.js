const { MD5 } = require("crypto-js");

const createHashID = str => {
  return MD5(str).toString();
};

const isCached = (cache, hash) => {
  if (cache.has(hash)) {
    return true;
  } else {
    return false;
  }
};

const buildCachePayload = (query, slug, hash) => {
  return {
    query,
    slug,
    hash
  };
};

const titleCase = str => {
  return str
    .toLowerCase()
    .split(" ")
    .map(function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

export { createHashID, isCached, buildCachePayload, titleCase };
