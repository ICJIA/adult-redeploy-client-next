import { describe, it, expect } from 'vitest';
import { newsIndexRows, meetingsIndexRows, RECENT_PER_CATEGORY } from './listing-rows';

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
