// src/lib/live/render/meeting-detail.ts
// Targeted live updates for a meeting detail page. The Meeting Materials list
// IS refreshed (authors often attach an agenda/minutes after publishing), via a
// shared renderer used by both the static build and the live swap. Markdown is
// imported lazily and only when the entry actually changed.

import { formatDate } from '../../dates';
import { liveEl, escapeHtml } from './shared';
import { renderTags } from './news-detail';
import { fadeSwap } from '../behavior/transition';
import type { LiveContext } from '../types';

const STRAPI_BASE = 'https://ari.icjia-api.cloud';
// tap-target: each material link is the sole content of its <li>, so SIA-R111
// (2.5.5 enhanced target size) requires a >=44px clickable box.
const MAT_LINK = 'tap-target text-brand-primary font-bold underline hover:no-underline '
  + 'focus-visible:outline focus-visible:outline-2 '
  + 'focus-visible:outline-brand-primary focus-visible:outline-offset-2';

export const MTG_DETAIL_SIG = (v: any): string => String(v?.updatedAt ?? '');

// Returns the full "Meeting Materials" block, or '' when there are none. Shared
// by the static page (set:html) and applyMeetingDetail so they can't diverge.
export function renderMeetingMaterials(materials: any[] | null | undefined): string {
  const list = (materials ?? []).filter((m) => m?.file?.url);
  if (!list.length) return '';
  const items = list.map((m) => `
        <li>
          <a href="${STRAPI_BASE}${escapeHtml(m.file.url)}" target="_blank" rel="noopener" class="${MAT_LINK}">${escapeHtml(m.name)}</a>
          ${m.summary ? `<p class="text-sm mt-1">${escapeHtml(m.summary)}</p>` : ''}
        </li>`).join('');
  return `<div class="mt-8 bg-surface-shaded p-6 rounded">
      <h2 class="font-bold mb-3">Meeting Materials</h2>
      <ul class="space-y-2">${items}</ul>
    </div>`;
}

export async function applyMeetingDetail(root: HTMLElement, view: any, ctx: LiveContext): Promise<void> {
  const title = liveEl(root, 'title');
  if (title) title.textContent = view.title ?? '';

  const sched = liveEl(root, 'scheduled');
  if (sched) sched.textContent = `Scheduled: ${formatDate(view.scheduledDate)}`;

  const materials = liveEl(root, 'materials');
  if (materials) materials.innerHTML = renderMeetingMaterials(view.meetingMaterial);

  const body = liveEl(root, 'body');
  if (body) {
    const { renderMarkdown } = await import('../../markdown/core');
    fadeSwap(body, () => { body.innerHTML = renderMarkdown(view.content ?? ''); });
  }

  const tags = liveEl(root, 'tags');
  if (tags) {
    const html = renderTags(view.tags, ctx);
    tags.innerHTML = html;
    tags.style.display = html ? '' : 'none';
  }
}
