const { MD5 } = require("crypto-js");

const getHash = salt => {
  let hash = MD5(salt).toString();
  return hash;
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

export { getHash, titleCase };
