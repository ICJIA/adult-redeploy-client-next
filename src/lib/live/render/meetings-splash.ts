// src/lib/live/render/meetings-splash.ts
// Feature splash for /about/meetings: the single next upcoming meeting, or
// nothing if none are scheduled. Single source of the markup — the page renders
// the initial splash with this (set:html) and the live island reuses it, so the
// splash recomputes by current date + live data and hides cleanly when empty.

import { formatDate } from '../../dates';
import { enumToSlug } from '../../meetings';
import { escapeHtml, cleanSlug } from './shared';
import type { LiveContext } from '../types';
import type { MeetingRow } from './home-meetings';

export const SPLASH_SIG_KEYS = ['slug', 'title', 'summary', 'scheduledDate', 'category'];

export const SPLASH_CLASSES = {
  section: 'mt-6 mb-10 rounded bg-brand-primary text-white p-6 md:p-8 shadow-elev1',
  label: 'text-xs font-bold uppercase tracking-wider text-white/80',
  h2: 'mt-1 font-heading font-black text-xl md:text-2xl leading-tight',
  link: 'underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 '
    + 'focus-visible:outline-white focus-visible:outline-offset-2',
  date: 'mt-3 text-sm font-bold uppercase tracking-wide text-white/90',
  summary: 'mt-2 text-sm text-white/90 max-w-2xl',
} as const;

export function renderMeetingsSplash(rows: MeetingRow[], ctx: LiveContext): string {
  const m = rows[0];
  if (!m) return '';                       // none upcoming → splash hidden
  const cat = escapeHtml(enumToSlug[m.category] ?? m.category);
  return `<section aria-labelledby="next-meeting-heading" class="${SPLASH_CLASSES.section}">
  <p class="${SPLASH_CLASSES.label}">Next upcoming meeting</p>
  <h2 id="next-meeting-heading" class="${SPLASH_CLASSES.h2}">
    <a href="${ctx.basePath}/about/meetings/${cat}/${escapeHtml(cleanSlug(m.slug))}" class="${SPLASH_CLASSES.link}">${escapeHtml(m.title)}</a>
  </h2>
  <p class="${SPLASH_CLASSES.date}">Scheduled: ${escapeHtml(formatDate(m.scheduledDate))}</p>
  ${m.summary ? `<p class="${SPLASH_CLASSES.summary}">${escapeHtml(m.summary)}</p>` : ''}
</section>`;
}
