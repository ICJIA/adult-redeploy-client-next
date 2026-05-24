// src/lib/markdown.ts
import MarkdownIt from 'markdown-it';
import xss from 'xss';

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
function addLazyToImages(html: string): string {
  return html.replace(IMG_RX, (_match, attrs) => {
    let out = attrs;
    if (!/\bloading\s*=/i.test(attrs)) out += ' loading="lazy"';
    if (!/\bdecoding\s*=/i.test(attrs)) out += ' decoding="async"';
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

export function renderMarkdown(src: string | null | undefined): string {
  if (!src) return '';
  const html = md.render(src);
  const safe = xss(html, {
    stripIgnoreTagBody: ['script', 'style'],
    whiteList: {
      ...xss.getDefaultWhiteList(),
      img: imgAllow,
    },
  });
  return addLazyToImages(safe);
}
