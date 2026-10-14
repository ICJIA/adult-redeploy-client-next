import { describe, it, expect } from 'vitest';
import { parsePageId, pageDetailWhere, applyPageDetail, PAGE_DETAIL_SIG } from './page-detail';
import { PAGE_BODY_SIG } from './page-body';
import { liveConfig } from '../config';
import { PAGE_BY_SLUG } from '../data/queries';

describe('parsePageId / pageDetailWhere', () => {
  it('splits "<section>/<slug>" into its parts', () => {
    expect(parsePageId('about/staff')).toEqual({ section: 'about', slug: 'staff' });
  });
  it('treats an id without a slash as slug-only', () => {
    expect(parsePageId('home')).toEqual({ section: null, slug: 'home' });
  });
  it('constrains the where clause to the section so a same-slug page elsewhere cannot match', () => {
    expect(pageDetailWhere('about/staff'))
      .toEqual({ isPublished: true, slug: 'staff', section: { slug: 'about' } });
    expect(pageDetailWhere('home')).toEqual({ isPublished: true, slug: 'home' });
  });
});

describe('liveConfig.entries.pageDetail', () => {
  const surface = liveConfig.entries.pageDetail;
  it('is registered on the PAGE_BY_SLUG query with the JSON where variable', () => {
    expect(surface.query).toBe(PAGE_BY_SLUG);
    expect(surface.variables!('about/oversight'))
      .toEqual({ where: { isPublished: true, slug: 'oversight', section: { slug: 'about' } } });
  });
  it('selects the first page row, or null when absent', () => {
    const row = { slug: 'staff', content: 'x', updatedAt: '2026-01-01T00:00:00.000Z' };
    expect(surface.select({ pages: [row] }, liveConfig.ctx)).toBe(row);
    expect(surface.select({ pages: [] }, liveConfig.ctx)).toBeNull();
    expect(surface.select({}, liveConfig.ctx)).toBeNull();
  });
  it('signs on updatedAt via the shared page-body signature', () => {
    expect(surface.signature).toBe(PAGE_DETAIL_SIG);
    expect(PAGE_DETAIL_SIG).toBe(PAGE_BODY_SIG);
    expect(surface.applyTo).toBe(applyPageDetail);
  });
});

// Node-env DOM stand-in: just enough surface for liveEl() + the apply fn.
function fakeRoot(keys: string[]) {
  const els: Record<string, any> = {};
  for (const k of keys) els[k] = { textContent: '', innerHTML: '', style: {} as Record<string, string> };
  const root = {
    querySelector: (sel: string) => {
      const m = /\[data-live="([^"]+)"\]/.exec(sel);
      return (m && els[m[1]]) || null;
    },
  } as unknown as HTMLElement;
  return { root, els };
}

describe('applyPageDetail', () => {
  const ctx = { endpoint: '', basePath: '/adultredeploy' };
  it('fills title, summary (and shows it) and the markdown body', async () => {
    const { root, els } = fakeRoot(['title', 'summary', 'body']);
    await applyPageDetail(root, { title: 'FAQs', summary: 'Short', content: '# Hi\n\nBody' }, ctx);
    expect(els.title.textContent).toBe('FAQs');
    expect(els.summary.textContent).toBe('Short');
    expect(els.summary.style.display).toBe('');
    expect(els.body.innerHTML).toContain('<h1');
    expect(els.body.innerHTML).toContain('<p>Body</p>');
  });
  it('hides the summary when the page has none', async () => {
    const { root, els } = fakeRoot(['summary', 'body']);
    await applyPageDetail(root, { summary: null, content: 'x' }, ctx);
    expect(els.summary.style.display).toBe('none');
  });
  it('only touches hooks that exist (the staff intro island has a body only)', async () => {
    const { root, els } = fakeRoot(['body']);
    await applyPageDetail(root, { title: 'T', summary: 'S', content: 'Intro' }, ctx);
    expect(els.body.innerHTML).toBe('<p>Intro</p>\n');
  });
});
