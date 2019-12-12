import Vue from "vue";

// const slug = require("slug");
// slug.defaults.mode = "rfc3986";
import moment from "moment";

Vue.filter("format", function(d) {
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
});

Vue.filter("titleCase", function(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map(function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
});

Vue.filter("upperCase", function(str) {
  return str.toUpperCase();
});

Vue.filter("lowerCase", function(str) {
  return str.toLowerCase();
});

// Vue.filter("deSlugify", function(str) {
//   return str.replace(/-/g, " ");
// });

// Vue.filter("slugify", function(str) {
//   return slug(str);
// });

Vue.filter("truncate", function(string, maxWords) {
  var strippedString = string.trim();
  var array = strippedString.split(" ");
  var wordCount = array.length;
  string = array.splice(0, maxWords).join(" ");

  if (wordCount > maxWords) {
    string += "...";
  }

  return string;
});

Vue.filter("timeDateFormat", function(timestamp) {
  return moment(timestamp).format("h:mm:ss a, MMMM Do YYYY ");
});

Vue.filter("dateTimeFormat", function(timestamp) {
  return moment(timestamp).format("MM/DD/YY, h:mm:ss a ");
});

Vue.filter("dateFormat", function(timestamp) {
  return moment(timestamp).format("MMMM DD, YYYY");
});

Vue.filter("dateFormatShort", function(timestamp) {
  return moment(timestamp).format("MMMM DD, YYYY");
});

Vue.filter("timeAgoFormat", function(timestamp) {
  return moment(timestamp).fromNow();
});

Vue.filter("yearFormat", function(timestamp) {
  return moment(timestamp).format("YYYY");
});
