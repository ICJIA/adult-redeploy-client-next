// src/lib/live/render/page-detail.ts
// Generic live update for a single CMS *page* record (the `pages` content type):
// /<section>/<page> detail cards and the intro paragraph on /about/staff and
// /about/oversight. Fills whichever [data-live] hooks the island contains —
// title / summary / body — so one surface serves both a full ArticleCard and a
// body-only intro. The markdown renderer is lazy-imported by applyPageBody and
// only runs on a real change (gated by liveEntry's updatedAt signature check).

import { liveEl } from './shared';
import { applyPageBody, PAGE_BODY_SIG } from './page-body';
import type { LiveContext } from '../types';

export const PAGE_DETAIL_SIG = PAGE_BODY_SIG;

export interface PageId { section: string | null; slug: string }

/** "about/staff" → { section: "about", slug: "staff" }; "home" → slug only. */
export function parsePageId(id: string): PageId {
  const i = id.indexOf('/');
  if (i < 0) return { section: null, slug: id };
  return { section: id.slice(0, i), slug: id.slice(i + 1) };
}

// Page slugs are unique today, but constrain on the section relation anyway so
// a future same-slug page in another section can never be swapped in. Strapi 3
// honors the nested relation filter when `where` arrives as one JSON variable.
export function pageDetailWhere(id: string): Record<string, unknown> {
  const { section, slug } = parsePageId(id);
  return section
    ? { isPublished: true, slug, section: { slug: section } }
    : { isPublished: true, slug };
}

export async function applyPageDetail(root: HTMLElement, view: any, ctx: LiveContext): Promise<void> {
  const title = liveEl(root, 'title');
  if (title) title.textContent = view.title ?? '';

  const summary = liveEl(root, 'summary');
  if (summary) {
    summary.textContent = view.summary ?? '';
    summary.style.display = view.summary ? '' : 'none';
  }

  await applyPageBody(root, view, ctx);
}
