// src/lib/live/render/site-detail.ts
// Targeted live updates for a /sites/<slug> detail page (ArticleCard + Markdown).
// Mirrors news-detail: the markdown renderer is imported lazily and only runs on a
// real change (gated by liveEntry's signature check). Sites carry no date; the
// card badge is the siteType.

import { liveEl } from './shared';
import { fadeSwap } from '../behavior/transition';
import type { LiveContext } from '../types';

export const SITE_DETAIL_SIG = (v: any): string => String(v?.updatedAt ?? '');

export async function applySiteDetail(root: HTMLElement, view: any, _ctx: LiveContext): Promise<void> {
  const title = liveEl(root, 'title');
  if (title) title.textContent = view.title ?? '';

  const badge = liveEl(root, 'badge');
  if (badge && view.siteType) badge.textContent = view.siteType;

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
