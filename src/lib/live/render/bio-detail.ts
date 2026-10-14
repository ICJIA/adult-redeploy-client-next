// src/lib/live/render/bio-detail.ts
// Targeted live updates for /about/biographies/<slug> (BioDetailShell.astro).
// Also the bootstrap renderer for the 404 host when a member was added after the
// last build. The headshot keeps the build's WebP variants when the manifest
// knows the image and falls back to the raw Strapi URL for a brand-new one; the
// markdown renderer + manifest are lazy-imported only on a real change.

import { liveEl } from './shared';
import { fadeSwap } from '../behavior/transition';
import {
  fullName, stripTags, resolveHeadshot, headshotImgAttrs, loadBioDeps,
  type BioRenderDeps,
} from './bio-list';
import type { LiveContext } from '../types';

export const BIO_DETAIL_SIG = (v: any): string => String(v?.updatedAt ?? '');

export const BIO_DETAIL_CLASSES = {
  imgCol: 'md:col-span-1',
  img: 'w-full rounded shadow-elev1',
  textWithImg: 'md:col-span-2',
  textFull: 'md:col-span-3',
} as const;
const BIO_DETAIL_SIZES = '(min-width: 768px) 33vw, 100vw';

export function bioBadge(category: string | null | undefined): string {
  return category === 'staff' ? 'Staff' : 'Oversight Board';
}

/** The headshot <img> for the detail page, or '' when the member has none. */
export function renderBioHeadshot(
  url: string | null | undefined,
  image: BioRenderDeps['image'],
): string {
  const h = resolveHeadshot(url, image);
  return h ? `<img ${headshotImgAttrs(h, BIO_DETAIL_SIZES, BIO_DETAIL_CLASSES.img)}>` : '';
}

export async function applyBioDetail(
  root: HTMLElement, view: any, _ctx: LiveContext, deps?: BioRenderDeps,
): Promise<void> {
  const d = deps ?? await loadBioDeps();

  const title = liveEl(root, 'title');
  if (title) title.textContent = fullName(view);

  const badge = liveEl(root, 'badge');
  if (badge) badge.textContent = bioBadge(view.category);

  const headshotHtml = renderBioHeadshot(view.headshot?.url, d.image);
  const headshot = liveEl(root, 'headshot');
  if (headshot) {
    headshot.innerHTML = headshotHtml;
    headshot.style.display = headshotHtml ? '' : 'none';
  }
  const text = liveEl(root, 'text');
  if (text) text.className = headshotHtml ? BIO_DETAIL_CLASSES.textWithImg : BIO_DETAIL_CLASSES.textFull;

  const role = liveEl(root, 'role');
  if (role) {
    const t = stripTags(view.title);
    role.textContent = t;
    role.style.display = t ? '' : 'none';
  }
  const membership = liveEl(root, 'membership');
  if (membership) {
    const m = stripTags(view.membership);
    membership.textContent = m;
    membership.style.display = m ? '' : 'none';
  }

  const body = liveEl(root, 'body');
  if (body) fadeSwap(body, () => { body.innerHTML = d.markdown(view.content ?? ''); });
}
