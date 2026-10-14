// src/lib/live/render/resource-detail.ts
// Targeted live updates for /resources/<category>/<slug> (ResourceDetailShell).
// The Downloads + External Links blocks are rendered by shared functions used by
// the static build (set:html) and the live swap so they can't diverge. Markdown
// is imported lazily and only when the entry actually changed. Also the
// bootstrap renderer for the 404 host (a publication added after the last build).

import { formatDate } from '../../dates';
import { liveEl, escapeHtml, cleanSlug } from './shared';
import { patchContent } from '../data/content-patches.mjs';
import { renderTags } from './news-detail';
import { fadeSwap } from '../behavior/transition';
import { RESOURCE_CATEGORIES, type ResourceCategory } from '../../resources';
import type { LiveContext } from '../types';

const STRAPI_BASE = 'https://ari.icjia-api.cloud';
// tap-target: each link is the sole content of its <li>, so SIA-R111 (2.5.5
// enhanced target size) requires a >=44px clickable box.
const LINK = 'tap-target text-brand-primary font-bold underline hover:no-underline '
  + 'focus-visible:outline focus-visible:outline-2 '
  + 'focus-visible:outline-brand-primary focus-visible:outline-offset-2';

export const RES_DETAIL_SIG = (v: any): string => String(v?.updatedAt ?? '');

export function resourceCategory(e: string | null | undefined): ResourceCategory | undefined {
  return RESOURCE_CATEGORIES.find((c) => c.enum === e);
}
export function resourceCategoryTitle(e: string | null | undefined): string {
  return resourceCategory(e)?.title ?? (e ?? '');
}

interface LinkItem { href: string; name?: string | null; summary?: string | null }

// CMS-authored URLs are untrusted input: only http(s) and mailto may become an
// href (a `javascript:` or `data:` URL typed into Strapi must never render as a
// clickable link, on the static page or a live swap). Anything else is dropped.
const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:'];
export function safeExternalHref(url: unknown): string | null {
  if (typeof url !== 'string') return null;
  try {
    const u = new URL(url.trim());
    return SAFE_PROTOCOLS.includes(u.protocol) ? u.href : null;
  } catch {
    return null; // relative / malformed → not an external link
  }
}

function renderLinkBlock(heading: string, wrapperClass: string, items: LinkItem[]): string {
  if (!items.length) return '';
  const lis = items.map((m) => `
        <li>
          <a href="${escapeHtml(m.href)}" target="_blank" rel="noopener" class="${LINK}">${escapeHtml(m.name)}</a>
          ${m.summary ? `<p class="text-sm mt-1">${escapeHtml(m.summary)}</p>` : ''}
        </li>`).join('');
  return `<div class="${wrapperClass}">
      <h2 class="font-bold mb-3">${heading}</h2>
      <ul class="space-y-2">${lis}</ul>
    </div>`;
}

/** The "Downloads" block (Strapi-hosted files), or '' when there are none. */
export function renderResourceMaterials(materials: any[] | null | undefined): string {
  const items = (materials ?? [])
    .filter((m) => m?.file?.url)
    .map((m) => ({ href: `${STRAPI_BASE}${m.file.url}`, name: m.name, summary: m.summary }));
  return renderLinkBlock('Downloads', 'mt-8 bg-surface-shaded p-6 rounded', items);
}

/** The "External Links" block, or '' when there are none. */
export function renderExternalLinks(links: any[] | null | undefined): string {
  const items = (links ?? [])
    .map((m) => ({ href: safeExternalHref(m?.url), name: m?.name, summary: m?.summary }))
    .filter((m): m is LinkItem => !!m.href);
  return renderLinkBlock('External Links', 'mt-6 bg-surface-shaded p-6 rounded', items);
}

export async function applyResourceDetail(root: HTMLElement, view: any, ctx: LiveContext): Promise<void> {
  const title = liveEl(root, 'title');
  if (title) title.textContent = view.title ?? '';

  const badge = liveEl(root, 'badge');
  if (badge) badge.textContent = resourceCategoryTitle(view.category);

  const published = liveEl(root, 'published');
  if (published) published.textContent = `Published: ${formatDate(view.publicationDate)}`;

  const summary = liveEl(root, 'summary');
  if (summary) {
    summary.textContent = view.summary ?? '';
    summary.style.display = view.summary ? '' : 'none';
  }

  const body = liveEl(root, 'body');
  if (body) {
    const { renderMarkdown } = await import('../../markdown/core');
    // Same slug-keyed fixups the build applies, so live and static agree.
    const src = patchContent('resources', cleanSlug(view.slug ?? ''), view.content ?? '');
    fadeSwap(body, () => { body.innerHTML = renderMarkdown(src); });
  }

  const downloads = liveEl(root, 'downloads');
  if (downloads) downloads.innerHTML = renderResourceMaterials(view.mediaMaterial);

  const external = liveEl(root, 'external');
  if (external) external.innerHTML = renderExternalLinks(view.externalMediaMaterial);

  const tags = liveEl(root, 'tags');
  if (tags) {
    const html = renderTags(view.tags, ctx);
    tags.innerHTML = html;
    tags.style.display = html ? '' : 'none';
  }
}
