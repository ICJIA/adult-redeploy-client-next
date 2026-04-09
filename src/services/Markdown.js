/* eslint-disable no-unused-vars */
const config = require("@/config.json");
import { EventBus } from "@/event-bus.js";
const xss = require("xss");

const namedHeaders = require("markdown-it-named-headers");
const attrs = require("markdown-it-attrs/markdown-it-attrs.browser.js");
let md = require("markdown-it")(config.markdownIt);
md.use(namedHeaders);
md.use(attrs);

const xssOptions = {
  whiteList: {
    ...xss.whiteList,
    span: ["style", "class"],
    div: ["style", "class", "id"],
    p: ["style", "class"],
    a: ["href", "title", "target", "rel", "class", "aria-label"],
    img: ["src", "alt", "title", "width", "height", "class"],
    h1: ["id", "class"],
    h2: ["id", "class"],
    h3: ["id", "class"],
    h4: ["id", "class"],
    h5: ["id", "class"],
    h6: ["id", "class"],
    table: ["class"],
    thead: [],
    tbody: [],
    tr: [],
    th: ["class"],
    td: ["class", "colspan", "rowspan"],
    ul: ["class"],
    ol: ["class", "start"],
    li: ["class"],
    blockquote: ["class"],
    pre: ["class"],
    code: ["class"],
    em: [],
    strong: [],
    br: [],
    hr: [],
    details: [],
    summary: [],
    sup: [],
    sub: [],
  },
  stripIgnoreTag: true,
};

const genericLinkPattern = /^(here|click here|more|link|go)$/i;

const renderToHtml = function (markdown) {
  if (!markdown) return "";
  const raw = md.render(markdown);
  let html = xss(raw, xssOptions);

  // Replace generic link text ("here", "click here") with descriptive text
  html = html.replace(
    /<a\s([^>]*)>([^<]*)<\/a>/gi,
    function (match, attrs, text) {
      if (genericLinkPattern.test(text.trim())) {
        var hrefMatch = attrs.match(/href="([^"]*)"/);
        if (hrefMatch) {
          var slug = hrefMatch[1].split("/").pop().replace(/-/g, " ");
          return "<a " + attrs + ">" + slug + "</a>";
        }
      }
      return match;
    }
  );

  return html;
};

export { renderToHtml };
