// src/lib/live/render/news-detail.ts
// Targeted live updates for a news detail page. Markdown is imported lazily and
// only runs when the entry actually changed (gated by liveEntry's signature
// check), so most views never download markdown-it.

import { formatDate } from '../../dates';
import { liveEl, escapeHtml, cleanSlug } from './shared';
import { fadeSwap } from '../behavior/transition';
import { patchContent } from '../data/content-patches.mjs';
import type { LiveContext } from '../types';

export const NEWS_DETAIL_SIG = (v: any): string => String(v?.updatedAt ?? '');

// Tag pills, shared by the static build (set:html) and applyNewsDetail's live
// swap so they can't diverge. Mirrors components/ui/Tag.astro's linked variant.
const TAG_CLASS = 'inline-flex items-center min-h-11 px-3 text-xs font-bold rounded '
  + 'bg-brand-secondary text-white hover:bg-brand-secondary/90 '
  + 'focus-visible:outline focus-visible:outline-2 '
  + 'focus-visible:outline-brand-primary focus-visible:outline-offset-2';

export function renderTags(
  tags: Array<{ name?: string; slug?: string }> | null | undefined,
  ctx: LiveContext,
): string {
  const list = (tags ?? []).filter((t) => t?.name && t?.slug);
  if (!list.length) return '';
  return list
    .map((t) =>
      `<a href="${escapeHtml(ctx.basePath)}/tags/${escapeHtml(cleanSlug(t.slug))}" class="${TAG_CLASS}">${escapeHtml(t.name)}</a>`)
    .join('');
}

export async function applyNewsDetail(root: HTMLElement, view: any, ctx: LiveContext): Promise<void> {
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
    // Same slug-keyed fixups the build applies, so live and static agree.
    const src = patchContent('news', cleanSlug(view.slug ?? ''), view.content ?? '');
    fadeSwap(body, () => { body.innerHTML = renderMarkdown(src); });
  }

  const tags = liveEl(root, 'tags');
  if (tags) {
    const html = renderTags(view.tags, ctx);
    tags.innerHTML = html;
    tags.style.display = html ? '' : 'none';
  }
}
