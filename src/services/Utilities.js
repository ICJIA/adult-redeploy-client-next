const { MD5 } = require("crypto-js");

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

export { getHash, titleCase, checkIfValidPage, stripHTML, truncate };
