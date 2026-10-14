// src/lib/live/render/bio-list.ts
// Shared select + render for the /about/staff and /about/oversight member lists.
// Imported by BOTH the .astro pages (static set:html) and the live islands, so the
// markup can't drift. The renderers take their heavy dependencies (manifest-aware
// image lookup + markdown) as `deps`: the build passes them directly; the island
// lazy-imports them via loadBioDeps() only when the list actually changed.

import { escapeHtml, cleanSlug, liveEl } from './shared';
import { fadeSwap } from '../behavior/transition';
import type { LiveContext } from '../types';
import type { CmsImage } from '../../cms-image';

export interface BioRow {
  slug: string;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  prefix?: string | null;
  suffix?: string | null;
  title?: string | null;
  membership?: string | null;
  category?: string | null;
  alphabetizeBy?: string | null;
  order?: number | null;
  content?: string | null;
  updatedAt?: string | null;
  headshot?: { url: string; name?: string | null } | null;
}

export interface BioRenderDeps {
  /** Manifest lookup (build-time WebP variants); null → unknown image. */
  image: (url: string | null | undefined) => CmsImage | null;
  /** The xss-sanitizing markdown renderer. */
  markdown: (src: string | null | undefined) => string;
}

/** Any CMS save bumps updatedAt; publish/unpublish adds/removes the slug. */
export const BIO_LIST_SIG_KEYS = ['slug', 'updatedAt'];

const STRAPI_BASE = 'https://ari.icjia-api.cloud';
const STAFF_SIZES = '(min-width: 768px) 160px, 50vw';
const BOARD_SIZES = '80px';

export const STAFF_CLASSES = {
  li: 'border border-brand-muted/40 rounded p-4 md:p-6 bg-surface',
  row: 'flex flex-col md:flex-row gap-4 md:gap-6',
  imgWrap: 'md:w-40 md:shrink-0',
  img: 'w-32 md:w-40 h-auto rounded shadow-elev1',
  text: 'flex-1 min-w-0',
  h2: 'font-heading font-bold text-xl',
  link: 'tap-target text-brand-primary hover:underline '
    + 'focus-visible:outline focus-visible:outline-2 '
    + 'focus-visible:outline-brand-primary focus-visible:outline-offset-2',
  title: 'text-sm font-bold mt-1',
  membership: 'text-sm mt-1',
  body: 'prose max-w-none mt-3 text-sm',
} as const;

export const BOARD_CLASSES = {
  link: 'flex gap-4 p-4 border border-brand-muted/40 rounded hover:shadow-elev1 '
    + 'focus-visible:outline focus-visible:outline-2 '
    + 'focus-visible:outline-brand-primary focus-visible:outline-offset-2',
  img: 'w-20 h-20 rounded object-cover shrink-0',
  name: 'font-bold text-brand-primary',
  meta: 'text-sm',
} as const;

// CMS titles sometimes arrive wrapped in <span class="heavy">…</span> from the
// legacy Nuxt CSS; we don't carry that class forward, so unwrap to plain text.
export const stripTags = (s: string | null | undefined): string =>
  (s ?? '').replace(/<[^>]+>/g, '').trim();

export function fullName(b: BioRow): string {
  return [b.prefix, b.firstName, b.middleName, b.lastName, b.suffix]
    .filter(Boolean)
    .map((s) => String(s).trim())
    .filter(Boolean)
    .join(' ');
}

/** Staff: CMS `order` ascending (unset → 999), then last name. */
export function selectStaff(rows: BioRow[]): BioRow[] {
  return rows
    .filter((b) => b.category === 'staff')
    .sort((a, b) =>
      ((a.order ?? 999) - (b.order ?? 999))
      || (a.lastName ?? '').localeCompare(b.lastName ?? ''));
}

/** Oversight Board: alphabetical by `alphabetizeBy`, falling back to last name. */
export function selectBoard(rows: BioRow[]): BioRow[] {
  return rows
    .filter((b) => b.category === 'board')
    .sort((a, b) =>
      (a.alphabetizeBy ?? a.lastName ?? '').localeCompare(
        b.alphabetizeBy ?? b.lastName ?? ''));
}

export interface Headshot { src: string; srcset?: string; width?: number; height?: number }

// Manifest hit → optimized WebP variants (byte-identical to the build). Miss
// (an image uploaded after the last build) → the raw Strapi URL, which CSP
// img-src already allows; it gets optimized on the next rebuild.
export function resolveHeadshot(
  url: string | null | undefined,
  image: BioRenderDeps['image'],
): Headshot | null {
  if (!url) return null;
  const cms = image(url);
  if (cms) return cms;
  return { src: url.startsWith('http') ? url : `${STRAPI_BASE}${url}` };
}

export function headshotImgAttrs(h: Headshot, sizes: string, cls: string): string {
  const responsive = h.srcset
    ? ` srcset="${escapeHtml(h.srcset)}" sizes="${sizes}" width="${h.width}" height="${h.height}"`
    : '';
  return `src="${escapeHtml(h.src)}"${responsive} alt="" loading="lazy" decoding="async" class="${cls}"`;
}

function bioHref(b: BioRow, ctx: LiveContext): string {
  return `${ctx.basePath}/about/biographies/${escapeHtml(cleanSlug(b.slug))}`;
}

/** The <li> items for the staff <ul> (full per-person blocks incl. bio body). */
export function renderStaffList(rows: BioRow[], ctx: LiveContext, deps: BioRenderDeps): string {
  return rows.map((b) => {
    const h = resolveHeadshot(b.headshot?.url, deps.image);
    const title = stripTags(b.title);
    const membership = stripTags(b.membership);
    const body = b.content ? deps.markdown(b.content) : '';
    return `
      <li class="${STAFF_CLASSES.li}">
        <div class="${STAFF_CLASSES.row}">
          ${h ? `<div class="${STAFF_CLASSES.imgWrap}"><img ${headshotImgAttrs(h, STAFF_SIZES, STAFF_CLASSES.img)}></div>` : ''}
          <div class="${STAFF_CLASSES.text}">
            <h2 class="${STAFF_CLASSES.h2}">
              <a href="${bioHref(b, ctx)}" class="${STAFF_CLASSES.link}">${escapeHtml(fullName(b))}</a>
            </h2>
            ${title ? `<p class="${STAFF_CLASSES.title}">${escapeHtml(title)}</p>` : ''}
            ${membership ? `<p class="${STAFF_CLASSES.membership}">${escapeHtml(membership)}</p>` : ''}
            ${body ? `<div class="${STAFF_CLASSES.body}">${body}</div>` : ''}
          </div>
        </div>
      </li>`;
  }).join('');
}

/** The <li> items for the Oversight Board grid (compact linked cards). */
export function renderBoardList(rows: BioRow[], ctx: LiveContext, deps: BioRenderDeps): string {
  return rows.map((b) => {
    const h = resolveHeadshot(b.headshot?.url, deps.image);
    const title = stripTags(b.title);
    const membership = stripTags(b.membership);
    return `
      <li>
        <a href="${bioHref(b, ctx)}" class="${BOARD_CLASSES.link}">
          ${h ? `<img ${headshotImgAttrs(h, BOARD_SIZES, BOARD_CLASSES.img)}>` : ''}
          <div>
            <div class="${BOARD_CLASSES.name}">${escapeHtml(fullName(b))}</div>
            ${title ? `<div class="${BOARD_CLASSES.meta}">${escapeHtml(title)}</div>` : ''}
            ${membership ? `<div class="${BOARD_CLASSES.meta}">${escapeHtml(membership)}</div>` : ''}
          </div>
        </a>
      </li>`;
  }).join('');
}

// Browser-only: the manifest (~76 KB) and markdown-it/xss are imported lazily so
// an unchanged view downloads neither. Same modules the build uses → parity.
export async function loadBioDeps(): Promise<BioRenderDeps> {
  const [{ getCmsImageByPath }, { renderMarkdown }] = await Promise.all([
    import('../../cms-image'),
    import('../../markdown'),
  ]);
  return { image: getCmsImageByPath, markdown: renderMarkdown };
}

/** liveEntry applyTo for the staff / board list surfaces: re-render [data-live="list"]. */
export function applyBioList(kind: 'staff' | 'board') {
  return async (root: HTMLElement, rows: BioRow[], ctx: LiveContext): Promise<void> => {
    const list = liveEl(root, 'list');
    if (!list) return;
    const deps = await loadBioDeps();
    const html = kind === 'staff'
      ? renderStaffList(rows, ctx, deps)
      : renderBoardList(rows, ctx, deps);
    fadeSwap(list, () => { list.innerHTML = html; });
  };
}
