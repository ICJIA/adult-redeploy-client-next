// src/lib/markdown.ts
import MarkdownIt from 'markdown-it';
import xss from 'xss';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: false,
  langPrefix: 'language-',
});

export function renderMarkdown(src: string | null | undefined): string {
  if (!src) return '';
  const html = md.render(src);
  return xss(html);
}
