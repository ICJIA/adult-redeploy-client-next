/* eslint-disable no-unused-vars */
const config = require("@/config.json");
import { EventBus } from "@/event-bus.js";

const namedHeaders = require("markdown-it-named-headers");
const attrs = require("markdown-it-attrs/markdown-it-attrs.browser.js");
let md = require("markdown-it")(config.markdownIt);
md.use(namedHeaders);
md.use(attrs);

const renderToHtml = function(markdown) {
  return md.render(markdown);
};

export { renderToHtml };
