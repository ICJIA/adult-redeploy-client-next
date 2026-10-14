import { describe, it, expect } from 'vitest';
import {
  bioBadge, renderBioHeadshot, applyBioDetail, BIO_DETAIL_SIG, BIO_DETAIL_CLASSES,
} from './bio-detail';
import type { BioRenderDeps } from './bio-list';
import { liveConfig } from '../config';
import { BIO_BY_SLUG } from '../data/queries';

const manifestHit = {
  src: '/adultredeploy/_cms-img/abc-960.webp',
  srcset: '/adultredeploy/_cms-img/abc-640.webp 640w, /adultredeploy/_cms-img/abc-960.webp 960w',
  width: 960, height: 1200,
};
const deps: BioRenderDeps = {
  image: (url) => (url && url.includes('known') ? manifestHit : null),
  markdown: (src) => (src ? `<p>${src}</p>` : ''),
};
const ctx = { endpoint: '', basePath: '/adultredeploy' };

describe('bioBadge', () => {
  it('labels staff vs Oversight Board', () => {
    expect(bioBadge('staff')).toBe('Staff');
    expect(bioBadge('board')).toBe('Oversight Board');
  });
});

describe('renderBioHeadshot', () => {
  it('returns the manifest variants with the detail-page sizes', () => {
    const html = renderBioHeadshot('/uploads/known.jpg', deps.image);
    expect(html).toContain(`src="${manifestHit.src}"`);
    expect(html).toContain('sizes="(min-width: 768px) 33vw, 100vw"');
    expect(html).toContain(`class="${BIO_DETAIL_CLASSES.img}"`);
  });
  it('falls back to the raw Strapi URL for a new headshot, and to nothing without one', () => {
    expect(renderBioHeadshot('/uploads/new.jpg', deps.image))
      .toContain('src="https://ari.icjia-api.cloud/uploads/new.jpg"');
    expect(renderBioHeadshot(null, deps.image)).toBe('');
  });
});

function fakeRoot(keys: string[]) {
  const els: Record<string, any> = {};
  for (const k of keys) els[k] = { textContent: '', innerHTML: '', className: '', style: {} as Record<string, string> };
  const root = {
    querySelector: (sel: string) => {
      const m = /\[data-live="([^"]+)"\]/.exec(sel);
      return (m && els[m[1]]) || null;
    },
  } as unknown as HTMLElement;
  return { root, els };
}

describe('applyBioDetail', () => {
  const view = {
    slug: 'jane', prefix: 'Dr.', firstName: 'Jane', lastName: 'Doe', category: 'staff',
    title: '<span class="heavy">Director</span>', membership: null, content: 'Bio body',
    headshot: { url: '/uploads/known.jpg' }, updatedAt: '2026-06-01T00:00:00.000Z',
  };
  it('fills name, badge, headshot, role, membership visibility, and body', async () => {
    const { root, els } = fakeRoot(['title', 'badge', 'headshot', 'text', 'role', 'membership', 'body']);
    await applyBioDetail(root, view, ctx, deps);
    expect(els.title.textContent).toBe('Dr. Jane Doe');
    expect(els.badge.textContent).toBe('Staff');
    expect(els.headshot.innerHTML).toContain(manifestHit.src);
    expect(els.headshot.style.display).toBe('');
    expect(els.text.className).toBe(BIO_DETAIL_CLASSES.textWithImg);
    expect(els.role.textContent).toBe('Director');
    expect(els.membership.style.display).toBe('none');
    expect(els.body.innerHTML).toBe('<p>Bio body</p>');
  });
  it('collapses the headshot column when the member has no photo', async () => {
    const { root, els } = fakeRoot(['headshot', 'text', 'body']);
    await applyBioDetail(root, { ...view, headshot: null }, ctx, deps);
    expect(els.headshot.innerHTML).toBe('');
    expect(els.headshot.style.display).toBe('none');
    expect(els.text.className).toBe(BIO_DETAIL_CLASSES.textFull);
  });
});

describe('liveConfig.entries.bioDetail', () => {
  const surface = liveConfig.entries.bioDetail;
  it('queries BIO_BY_SLUG with a published-only JSON where', () => {
    expect(surface.query).toBe(BIO_BY_SLUG);
    expect(surface.variables!('jane')).toEqual({ where: { isPublished: true, slug: 'jane' } });
  });
  it('selects the first row or null, signs on updatedAt, applies via applyBioDetail', () => {
    const row = { slug: 'jane', updatedAt: '2026-06-01T00:00:00.000Z' };
    expect(surface.select({ biographies: [row] }, liveConfig.ctx)).toBe(row);
    expect(surface.select({ biographies: [] }, liveConfig.ctx)).toBeNull();
    expect(surface.signature(row)).toBe('2026-06-01T00:00:00.000Z');
    expect(BIO_DETAIL_SIG(row)).toBe('2026-06-01T00:00:00.000Z');
    expect(surface.applyTo).toBe(applyBioDetail);
  });
});
