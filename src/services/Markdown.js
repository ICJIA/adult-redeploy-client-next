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

  // Add aria-label to links with generic text like "here"
  html = html.replace(
    /<a\s([^>]*)>([^<]*)<\/a>/gi,
    function (match, attrs, text) {
      if (
        genericLinkPattern.test(text.trim()) &&
        attrs.indexOf("aria-label") === -1
      ) {
        var hrefMatch = attrs.match(/href="([^"]*)"/);
        var label = hrefMatch
          ? "Visit " + hrefMatch[1].split("/").pop().replace(/-/g, " ")
          : text;
        return "<a " + attrs + ' aria-label="' + label + '">' + text + "</a>";
      }
      return match;
    }
  );

  return html;
};

export { renderToHtml };
