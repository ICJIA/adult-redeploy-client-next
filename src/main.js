if (isIE()) {
  var banner =
    "<div style='margin-top: 50px; padding-top: 20px; padding-bottom:20px; background: red; text-align: center'>";
  banner =
    banner +
    "<h1>The Adult Redeploy Illinois website does not support Internet Explorer.";
  banner =
    banner +
    "<br>Please upgrade to a modern, secure browser such as <a href='https://www.google.com/chrome/'>Chrome</a>, <a href='https://www.mozilla.org/en-US/firefox/new/'>Firefox</a>, or <a href='https://www.microsoft.com/en-us/windows/microsoft-edge'>Edge</a>.</h1>";
  banner = banner + "</div>";
  document.querySelector("#app").innerHTML = banner;
} else require("./_main");

function isIE() {
  const isIE10orLess = window.navigator.userAgent.indexOf("MSIE") > -1;

  const isIE11 = window.navigator.userAgent.indexOf("Trident/") > -1;

  return isIE10orLess || isIE11;
}
