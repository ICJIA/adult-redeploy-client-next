const { MD5 } = require("crypto-js");
const config = require("@/config.json");

const getHash = salt => {
  let hash = MD5(salt).toString();
  return hash;
};

const checkIfValidPage = arr => {
  if (arr) {
    return !!arr.length;
  } else {
    return 0;
  }
};

const stripHTML = str => {
  let regex = /(<([^>]+)>)/gi;
  return str.replace(regex, "");
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

const getOffset = function(el) {
  var _x = 0;
  var _y = 0;
  while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
    _x += el.offsetLeft - el.scrollLeft;
    _y += el.offsetTop - el.scrollTop;
    el = el.offsetParent;
  }
  return { top: _y, left: _x };
};

const truncate = function(string, maxWords = 10) {
  let strippedString = string.trim();
  let array = strippedString.split(" ");
  let wordCount = array.length;
  string = array.splice(0, maxWords).join(" ");

  if (wordCount > maxWords) {
    string += "...";
  }

  return string;
};

const strapiEnumToObject = function(contentType, strapiEnum) {
  let content = config.strapiEnums[contentType] || [
    {
      slug: null,
      title: null,
      enum: null
    }
  ];

  return content.filter(e => {
    return e.enum === strapiEnum;
  });
};

const strapiSlugToObject = function(contentType, strapiSlug) {
  let content = config.strapiEnums[contentType] || [
    {
      slug: null,
      title: null,
      enum: null
    }
  ];

  console.log(strapiSlug);

  let type = content.filter(e => {
    if (e.slug === strapiSlug) {
      return e;
    }
    //console.log(e.slug, strapiSlug);
  });

  return type;
};

export {
  getHash,
  titleCase,
  checkIfValidPage,
  stripHTML,
  truncate,
  getOffset,
  strapiEnumToObject,
  strapiSlugToObject
};
