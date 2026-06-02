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
const imgAllow = ['src', 'alt', 'title', 'width', 'height',
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
  const safe = xss(html, {
    stripIgnoreTagBody: ['script', 'style'],
    whiteList: {
      ...defaultWhiteList,
      img: imgAllow,
    },
  });
  return rewriteImages(safe, opts.imageResolver);
}
