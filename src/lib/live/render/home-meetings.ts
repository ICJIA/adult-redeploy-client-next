// src/lib/live/render/home-meetings.ts
// Render function for the homepage "UPCOMING MEETINGS" list. Single source of
// the markup: HomeMeetings.astro renders the initial region with this via
// set:html, and the live island reuses it — so static and live never diverge.

import { formatDate } from '../../dates';
import { enumToSlug } from '../../meetings';
import { escapeHtml, cleanSlug } from './shared';
import type { LiveContext } from '../types';

export interface MeetingRow {
  slug: string;
  title: string;
  summary?: string | null;
  scheduledDate?: string | null;
  category: string;
}

export const HOME_MTG_SIG_KEYS = ['slug', 'title', 'summary', 'scheduledDate', 'category'];

export const HOME_MTG_CLASSES = {
  ul: 'mt-6 space-y-4',
  link: 'block border border-brand-muted/40 rounded p-4 hover:shadow-elev1 '
    + 'focus-visible:outline focus-visible:outline-2 '
    + 'focus-visible:outline-brand-primary focus-visible:outline-offset-2',
  date: 'text-xs font-bold text-brand-secondary uppercase',
  title: 'mt-1 font-bold text-lg',
  summary: 'mt-2 text-sm',
  empty: 'mt-6 text-center',
} as const;

export function renderHomeMeetings(rows: MeetingRow[], ctx: LiveContext): string {
  if (!rows.length) {
    return `<p class="${HOME_MTG_CLASSES.empty}"><em>No meetings scheduled.</em></p>`;
  }
  const items = rows.map((m) => {
    const cat = escapeHtml(enumToSlug[m.category] ?? m.category);
    return `
      <li>
        <a href="${ctx.basePath}/about/meetings/${cat}/${escapeHtml(cleanSlug(m.slug))}" class="${HOME_MTG_CLASSES.link}">
          <div class="${HOME_MTG_CLASSES.date}">Scheduled: ${escapeHtml(formatDate(m.scheduledDate))}</div>
          <div class="${HOME_MTG_CLASSES.title}">${escapeHtml(m.title)}</div>
          ${m.summary ? `<div class="${HOME_MTG_CLASSES.summary}">${escapeHtml(m.summary)}</div>` : ''}
        </a>
      </li>`;
  }).join('');
  return `<ul class="${HOME_MTG_CLASSES.ul}">${items}</ul>`;
}
