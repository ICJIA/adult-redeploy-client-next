// src/lib/live/render/home-news.ts
// Render function + shared class constants for the HomeNews list. Imported by
// BOTH HomeNews.astro (static) and the live swap (runtime) so the markup can't
// drift. Keep this structurally identical to HomeNews.astro's <li>.

import { formatDate } from '../../dates';
import { escapeHtml, cleanSlug } from './shared';
import type { LiveContext } from '../types';

export interface NewsRow {
  slug: string;
  title: string;
  summary?: string | null;
  publicationDate?: string | null;
}

export const NEWS_SIG_KEYS = ['slug', 'title', 'summary', 'publicationDate'];

export const NEWS_CLASSES = {
  li: 'border-b border-brand-muted/30 pb-4',
  date: 'text-xs uppercase',
  h3: 'mt-1 font-heading font-bold text-xl',
  // tap-target: the link is the h3's only content, so SIA-R111 (2.5.5 enhanced
  // target size) requires a >=44px clickable box — no inline-text exemption.
  link: 'tap-target text-brand-primary underline-offset-4 hover:underline '
    + 'focus-visible:outline focus-visible:outline-2 '
    + 'focus-visible:outline-brand-primary focus-visible:outline-offset-2',
  summary: 'mt-2 text-sm',
} as const;

export function renderHomeNews(rows: NewsRow[], ctx: LiveContext): string {
  return rows.map((item) => `
      <li class="${NEWS_CLASSES.li}">
        <div class="${NEWS_CLASSES.date}">
          Posted: ${escapeHtml(formatDate(item.publicationDate))}
        </div>
        <h3 class="${NEWS_CLASSES.h3}">
          <a href="${ctx.basePath}/news/${escapeHtml(cleanSlug(item.slug))}" class="${NEWS_CLASSES.link}">
            ${escapeHtml(item.title)}
          </a>
        </h3>
        ${item.summary ? `<p class="${NEWS_CLASSES.summary}">${escapeHtml(item.summary)}</p>` : ''}
      </li>`).join('');
}
