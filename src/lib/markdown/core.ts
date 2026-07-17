// src/lib/markdown/core.ts
// Isomorphic markdown renderer — markdown-it + xss only, with NO Node/manifest
// dependencies, so it runs identically at build time and in the browser.
//
// The build passes an `imageResolver` (the CMS image manifest lookup) so static
// output stays byte-identical. The browser/live path omits it: newly-published
// images simply keep their original Strapi URLs (CSP `img-src` already allows
// https://ari.icjia-api.cloud), and still get loading/decoding hints.
import MarkdownIt from 'markdown-it';
import xss from 'xss';

export interface CmsImage {
  src: string;
  srcset: string;
  width: number;
  height: number;
}
export type ImageResolver = (originalUrl: string | null | undefined) => CmsImage | null;
export interface RenderOptions { imageResolver?: ImageResolver; }

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: false,
  langPrefix: 'language-',
});

// WCAG 2.1 AAA (2.5.5 target size enhanced / SIA-R111): a link that is the
// SOLE content of its paragraph, heading, or (tight) list item has no
// "in a sentence or block of text" exemption, so its clickable box must be
// >=44×44 px. CMS bodies are full of these — "Download the report" lines,
// bare linkified URLs, link-only bullets — so tag them here with .tap-target
// (global.css) instead of chasing them per page. Links with any sibling text
// in the same block stay untouched; they're exempt inline links.
md.core.ruler.push('standalone_link_tap_target', (state) => {
  const toks = state.tokens;
  for (let i = 0; i < toks.length; i++) {
    if (toks[i].type !== 'inline') continue;
    const open = toks[i - 1];
    // hidden paragraph_open = tight list item (renders without <p> tags but
    // the token stream is identical), so it's covered by the same check.
    if (!open || (open.type !== 'paragraph_open' && open.type !== 'heading_open')) continue;
    const kids = toks[i].children ?? [];
    if (!kids.length || kids[0].type !== 'link_open') continue;
    const closeIdx = kids.findIndex((k) => k.type === 'link_close');
    if (closeIdx === -1) continue;
    const outside = kids.slice(closeIdx + 1);
    const onlyTrailingWs = outside.every(
      (k) => k.type === 'text' && !k.content.trim());
    if (!onlyTrailingWs) continue;
    const linkOpen = kids[0];
    const cls = linkOpen.attrGet('class');
    linkOpen.attrSet('class', cls ? `${cls} tap-target` : 'tap-target');
  }
});

// Inject loading="lazy" + decoding="async" on every <img> in the output.
// CMS content embeds large Strapi-hosted images (bio headshots, state seal,
// news article art) via both markdown ![]() syntax and raw HTML <img> tags;
// without these attributes the browser eagerly downloads them all in
// parallel, blowing up mobile FCP / LCP. Done as a post-process so it
// catches both syntaxes.
// Captures everything between `<img` and the closing `>`, then drops the
// optional self-closing slash so we don't end up with `<img ... / loading=...>`.
const IMG_RX = /<img\b((?:[^>"]|"[^"]*")*?)\s*\/?\s*>/gi;
const SRC_RX = /\bsrc\s*=\s*("|')([^"']+)\1/i;
const WIDTH_RX = /\swidth\s*=\s*("|')[^"']*\1/i;
const HEIGHT_RX = /\sheight\s*=\s*("|')[^"']*\1/i;
const SRCSET_RX = /\ssrcset\s*=\s*("|')[^"']*\1/i;
const SIZES_RX = /\ssizes\s*=\s*("|')[^"']*\1/i;

function optimizeImage(attrs: string, resolve?: ImageResolver): string {
  if (!resolve) return attrs;
  const srcMatch = attrs.match(SRC_RX);
  if (!srcMatch) return attrs;
  const original = srcMatch[2];
  const cms = resolve(original);
  if (!cms) return attrs;
  // Replace src, drop any old width/height/srcset/sizes, then re-add the
  // intrinsic ones from the manifest. Preserves all other attrs (alt, class,
  // title, data-*).
  return attrs
    .replace(SRC_RX, `src="${cms.src}"`)
    .replace(WIDTH_RX, '')
    .replace(HEIGHT_RX, '')
    .replace(SRCSET_RX, '')
    .replace(SIZES_RX, '')
    + ` srcset="${cms.srcset}" sizes="(max-width: 768px) 100vw, 768px"`
    + ` width="${cms.width}" height="${cms.height}"`;
}

function rewriteImages(html: string, resolve?: ImageResolver): string {
  return html.replace(IMG_RX, (_match, attrs) => {
    let out = optimizeImage(attrs, resolve);
    if (!/\bloading\s*=/i.test(out)) out += ' loading="lazy"';
    if (!/\bdecoding\s*=/i.test(out)) out += ' decoding="async"';
    return `<img${out}>`;
  });
}

// Strip <script> and <style> bodies entirely. By default xss only removes the
// tag and escapes the body, which leaks CMS-authored CSS / JS into the page
// as visible text. Per-tag spacing rules live in global.css under .prose.
// Also extend the img whitelist with `loading` / `decoding` so the perf
// attributes our markdown-it rule injects survive sanitization.
// `style` is allowed so CMS-authored inline layout survives — e.g. the state
// seal on the homepage uses `style="float: left; margin: …"` to wrap body text
// around it. xss still runs the style value through its built-in CSS filter
// (safe props like float/margin pass; expression()/dangerous CSS is stripped).
const imgAllow = ['src', 'alt', 'title', 'width', 'height', 'style',
                  'loading', 'decoding', 'fetchpriority', 'sizes', 'srcset'];

export function renderMarkdown(src: string | null | undefined,
                              opts: RenderOptions = {}): string {
  if (!src) return '';
  const html = md.render(src);
  // xss is a CommonJS module: its default export is the filterXSS function with
  // helpers attached. Read getDefaultWhiteList off it — a named ESM import isn't
  // synthesized by Node's CJS interop and breaks the build at runtime.
  const defaultWhiteList = (xss as unknown as {
    getDefaultWhiteList(): Record<string, string[]>;
  }).getDefaultWhiteList();
  // cssfilter (xss's inline-style sanitizer) disallows `float` by default, which
  // would strip the CMS seal's `float: left`. Re-allow just `float` on top of
  // the safe default CSS whitelist; every other CSS property stays filtered.
  const cssWhiteList = (xss as unknown as {
    getDefaultCSSWhiteList(): Record<string, unknown>;
  }).getDefaultCSSWhiteList();
  // `class` must survive on <a> so the standalone_link_tap_target rule's
  // .tap-target class (SIA-R111 fix) isn't stripped. Same trust level as the
  // already-allowed `style`: CMS authors are agency staff.
  const safe = xss(html, {
    stripIgnoreTagBody: ['script', 'style'],
    whiteList: {
      ...defaultWhiteList,
      a: [...(defaultWhiteList.a ?? []), 'class'],
      img: imgAllow,
    },
    css: { whiteList: { ...cssWhiteList, float: true } },
  });
  return rewriteImages(safe, opts.imageResolver);
}
