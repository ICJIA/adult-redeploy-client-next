// src/lib/markdown.ts
import MarkdownIt from 'markdown-it';
import xss from 'xss';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: false,
  langPrefix: 'language-',
});

// Strip <script> and <style> bodies entirely. By default xss only removes the
// tag and escapes the body, which leaks CMS-authored CSS / JS into the page
// as visible text. Per-tag spacing rules live in global.css under .prose.
export function renderMarkdown(src: string | null | undefined): string {
  if (!src) return '';
  const html = md.render(src);
  return xss(html, {
    stripIgnoreTagBody: ['script', 'style'],
  });
}
