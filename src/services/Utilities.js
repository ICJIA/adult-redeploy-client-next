const { MD5 } = require("crypto-js");
const config = require("@/config.json");

const getHash = str => {
  let hash = MD5(str).toString();
  return hash;
};

const getSectionContent = (sections, slug) => {
  // console.log("sections: ", sections);
  // console.log("section: ", slug);
  const content = sections.filter(sec => {
    return sec.slug === slug;
  });
  //console.log(content);
  return content;
};

const checkIfValidPage = arr => {
  if (arr) {
    return !!arr.length;
  } else {
    return 0;
  }
};

const stripHTML = str => {
  if (!str) return;
  let regex = /(<([^>]+)>)/gi;
  return str.replace(regex, "");
};

const titleCase = str => {
  if (!str) return;
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
  if (!string) return;
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

  return content.filter(e => {
    return e.slug === strapiSlug;
  });
};

const addAttributeToElement = function(className, attribute, text) {
  return function() {
    let elements = document.getElementsByClassName(className);
    for (let i = 0; i < elements.length; i++) {
      elements[i].setAttribute(attribute, text);
    }
  };
};

const dateFormat = function(d) {
  var monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  function pad(n) {
    return n < 10 ? "0" + n : n;
  }
  const t = new Date(d);
  /**
   *
   * Timezone offset correction:
   * https://stackoverflow.com/questions/7556591/is-the-javascript-date-object-always-one-day-off/31732581#31732581
   *
   */
  const target = new Date(
    t.getTime() + Math.abs(t.getTimezoneOffset() * 60000)
  );
  const date = target.getDate();
  const month = target.getMonth();
  const year = target.getFullYear();
  //const monthDateYear = pad(month + 1) + '/' + pad(date) + '/' + year
  const dateWithFullMonthName =
    monthNames[month] + " " + pad(date) + ", " + year;
  return dateWithFullMonthName;
};

export {
  getHash,
  titleCase,
  getSectionContent,
  checkIfValidPage,
  stripHTML,
  truncate,
  getOffset,
  strapiEnumToObject,
  strapiSlugToObject,
  addAttributeToElement,
  dateFormat
};
