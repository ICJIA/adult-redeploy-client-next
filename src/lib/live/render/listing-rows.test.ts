import { describe, it, expect } from 'vitest';
import {
  newsIndexRows, meetingsIndexRows, RECENT_PER_CATEGORY,
  resourcesIndexRows, resourcesCategoryRows, RES_INDEX_SIG_KEYS, RES_CAT_SIG_KEYS,
} from './listing-rows';

const ctx = { endpoint: '', basePath: '/adultredeploy' };

describe('newsIndexRows', () => {
  it('falls back to createdAt, builds href, sorts newest first', () => {
    const rows = newsIndexRows([
      { slug: 'a', title: 'A', publicationDate: '2026-01-01T00:00:00Z' },
      { slug: 'b', title: 'B', publicationDate: null, createdAt: '2026-03-01T00:00:00Z' },
    ], ctx);
    expect(rows[0].title).toBe('B');
    expect(rows[0].publicationDate).toBe('2026-03-01T00:00:00Z');
    expect(rows[1].href).toBe('/adultredeploy/news/a');
  });
});

describe('meetingsIndexRows', () => {
  const data = [
    { slug: 'm1', title: 'M1', scheduledDate: '2026-05-01T00:00:00Z', category: 'outreach' },
    { slug: 'm2', title: 'M2', scheduledDate: '2026-06-01T00:00:00Z', category: 'outreach' },
    { slug: 'x', title: 'X', scheduledDate: '2026-06-01T00:00:00Z', category: 'regular' },
  ];
  it('filters by category, sorts newest first, builds category-slug href', () => {
    const rows = meetingsIndexRows(data, ctx, { enum: 'outreach', slug: 'outreach' });
    expect(rows).toHaveLength(2);
    expect(rows[0].title).toBe('M2');
    expect(rows[0].href).toBe('/adultredeploy/about/meetings/outreach/m2');
  });
  it('respects the limit', () => {
    expect(meetingsIndexRows(data, ctx, { enum: 'outreach', slug: 'outreach' }, 1)).toHaveLength(1);
  });
  it('defaults RECENT_PER_CATEGORY to 5', () => {
    expect(RECENT_PER_CATEGORY).toBe(5);
  });
  it('returns ALL matching meetings when no limit is given (category page)', () => {
    const many = Array.from({ length: 7 }, (_, i) => ({
      slug: `m${i}`, title: `M${i}`,
      scheduledDate: `2026-0${i + 1}-01T00:00:00Z`, category: 'regular',
    }));
    expect(meetingsIndexRows(many, ctx, { enum: 'regular', slug: 'regular-oversight' })).toHaveLength(7);
  });
});

describe('resourcesIndexRows / resourcesCategoryRows', () => {
  const data = [
    { slug: 'r1', title: 'R1', publicationDate: '2024-01-01T00:00:00Z', category: 'annualReport' },
    { slug: 'r2 ', title: 'R2', publicationDate: '2026-01-01T00:00:00Z', category: 'summit' },
    { slug: 'r3', title: 'R3', publicationDate: null, category: 'mystery' },
  ];
  it('index: newest first, short category label, href by category slug, slug trimmed', () => {
    const rows = resourcesIndexRows(data, ctx);
    expect(rows.map((r) => r.title)).toEqual(['R2', 'R1', 'R3']);
    expect(rows[0]).toEqual({
      publicationDate: '2026-01-01T00:00:00Z', title: 'R2', category: 'Summits',
      href: '/adultredeploy/resources/summits/r2',
    });
    expect(rows[1].category).toBe('Annual Reports');
  });
  it('index: an unknown category enum falls back to the enum itself (mirrors the build)', () => {
    const r3 = resourcesIndexRows(data, ctx).find((r) => r.title === 'R3')!;
    expect(r3.category).toBe('mystery');
    expect(r3.href).toBe('/adultredeploy/resources/mystery/r3');
    expect(r3.publicationDate).toBe('');
  });
  it('category: filters on the enum, newest first, href under the category slug', () => {
    const rows = resourcesCategoryRows(data, ctx, { enum: 'summit', slug: 'summits' });
    expect(rows).toEqual([{ title: 'R2', publicationDate: '2026-01-01T00:00:00Z', href: '/adultredeploy/resources/summits/r2' }]);
  });
  it('exposes the signature keys the tables baseline on', () => {
    expect(RES_INDEX_SIG_KEYS).toEqual(['publicationDate', 'title', 'category', 'href']);
    expect(RES_CAT_SIG_KEYS).toEqual(['title', 'publicationDate', 'href']);
  });
});
