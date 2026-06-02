// src/lib/live/render/news-detail.ts
// Targeted live updates for a news detail page. Markdown is imported lazily and
// only runs when the entry actually changed (gated by liveEntry's signature
// check), so most views never download markdown-it.

import { formatDate } from '../../dates';
import { liveEl } from './shared';
import { fadeSwap } from '../behavior/transition';
import type { LiveContext } from '../types';

export const NEWS_DETAIL_SIG = (v: any): string => String(v?.updatedAt ?? '');

export async function applyNewsDetail(root: HTMLElement, view: any, _ctx: LiveContext): Promise<void> {
  const title = liveEl(root, 'title');
  if (title) title.textContent = view.title ?? '';

  const posted = liveEl(root, 'posted');
  if (posted) posted.textContent = `Posted: ${formatDate(view.publicationDate ?? view.createdAt)}`;

  const summary = liveEl(root, 'summary');
  if (summary) {
    summary.textContent = view.summary ?? '';
    summary.style.display = view.summary ? '' : 'none';
  }

  const body = liveEl(root, 'body');
  if (body) {
    const { renderMarkdown } = await import('../../markdown/core');
    fadeSwap(body, () => { body.innerHTML = renderMarkdown(view.content ?? ''); });
  }
}
