import { describe, it, expect } from 'vitest';
import {
  renderResourceMaterials, renderExternalLinks, resourceCategoryTitle,
  applyResourceDetail, RES_DETAIL_SIG,
} from './resource-detail';
import { liveConfig } from '../config';
import { RESOURCE_BY_SLUG } from '../data/queries';

describe('renderResourceMaterials', () => {
  it('returns empty string when there are no downloadable files', () => {
    expect(renderResourceMaterials([])).toBe('');
    expect(renderResourceMaterials(null)).toBe('');
    expect(renderResourceMaterials([{ name: 'X', file: null }])).toBe('');
  });
  it('builds absolute Strapi links under a Downloads heading and escapes text', () => {
    const html = renderResourceMaterials([
      { name: 'Report & <Notes>', summary: 'PDF', file: { url: '/uploads/r.pdf' } },
    ]);
    expect(html).toContain('Downloads');
    expect(html).toContain('href="https://ari.icjia-api.cloud/uploads/r.pdf"');
    expect(html).toContain('Report &amp; &lt;Notes&gt;');
    expect(html).toContain('<p class="text-sm mt-1">PDF</p>');
  });
});

describe('renderExternalLinks', () => {
  it('returns empty string when there are none', () => {
    expect(renderExternalLinks([])).toBe('');
    expect(renderExternalLinks([{ name: 'no url' }])).toBe('');
  });
  it('links out in a new tab under an External Links heading, escaping the URL', () => {
    const html = renderExternalLinks([{ name: 'Webinar', url: 'https://youtu.be/x?a=1&b=2', summary: null }]);
    expect(html).toContain('External Links');
    expect(html).toContain('href="https://youtu.be/x?a=1&amp;b=2"');
    expect(html).toContain('target="_blank" rel="noopener"');
    expect(html).not.toContain('text-sm mt-1');
  });
});

describe('resourceCategoryTitle', () => {
  it('maps the CMS enum to the display title, falling back to the enum', () => {
    expect(resourceCategoryTitle('annualReport')).toBe('Annual Reports');
    expect(resourceCategoryTitle('mystery')).toBe('mystery');
  });
});

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

describe('applyResourceDetail', () => {
  const ctx = { endpoint: '', basePath: '/adultredeploy' };
  const view = {
    slug: 'r', title: 'Annual Report 2025', summary: 'Sum', content: 'Body text',
    category: 'annualReport', publicationDate: '2025-02-13T00:00:00.000Z',
    mediaMaterial: [{ name: 'PDF', file: { url: '/uploads/a.pdf' } }],
    externalMediaMaterial: [],
    tags: [{ name: 'Data', slug: 'data' }],
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
  it('fills title, badge, published date, summary, body, downloads, external links and tags', async () => {
    const { root, els } = fakeRoot(['title', 'badge', 'published', 'summary', 'body', 'downloads', 'external', 'tags']);
    await applyResourceDetail(root, view, ctx);
    expect(els.title.textContent).toBe('Annual Report 2025');
    expect(els.badge.textContent).toBe('Annual Reports');
    expect(els.published.textContent).toBe('Published: February 13, 2025');
    expect(els.summary.textContent).toBe('Sum');
    expect(els.summary.style.display).toBe('');
    expect(els.body.innerHTML).toBe('<p>Body text</p>\n');
    expect(els.downloads.innerHTML).toContain('/uploads/a.pdf');
    expect(els.external.innerHTML).toBe('');
    expect(els.tags.innerHTML).toContain('href="/adultredeploy/tags/data"');
    expect(els.tags.style.display).toBe('');
  });
  it('hides summary and tags when absent', async () => {
    const { root, els } = fakeRoot(['summary', 'tags', 'body']);
    await applyResourceDetail(root, { ...view, summary: null, tags: [] }, ctx);
    expect(els.summary.style.display).toBe('none');
    expect(els.tags.style.display).toBe('none');
  });
});

describe('liveConfig.entries.resourceDetail', () => {
  const s = liveConfig.entries.resourceDetail;
  it('queries RESOURCE_BY_SLUG with a published-only JSON where; signs on updatedAt', () => {
    expect(s.query).toBe(RESOURCE_BY_SLUG);
    expect(s.variables!('r')).toEqual({ where: { isPublished: true, slug: 'r' } });
    const row = { slug: 'r', updatedAt: '2026-01-01T00:00:00.000Z' };
    expect(s.select({ resources: [row] }, liveConfig.ctx)).toBe(row);
    expect(s.select({ resources: [] }, liveConfig.ctx)).toBeNull();
    expect(s.signature(row)).toBe('2026-01-01T00:00:00.000Z');
    expect(RES_DETAIL_SIG(row)).toBe('2026-01-01T00:00:00.000Z');
    expect(s.applyTo).toBe(applyResourceDetail);
  });
});

describe('applyResourceDetail — build-time content patches apply on the live path too', () => {
  const ctx = { endpoint: '', basePath: '/adultredeploy' };
  it('renders the eligibility-webinar caption as bold text, not an h5 (parity with the static page)', async () => {
    const { root, els } = fakeRoot(['body']);
    await applyResourceDetail(root, {
      slug: 'eligibility-webinar',
      content: 'Intro.\n\n##### Click to play on YouTube{.muted .mt-5}\n',
    }, ctx);
    expect(els.body.innerHTML).toContain('<strong>Click to play on YouTube</strong>');
    expect(els.body.innerHTML).not.toContain('<h5>');
  });
});
