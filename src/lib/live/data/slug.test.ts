import { describe, it, expect } from 'vitest';
import { cleanSlug, normalizeSlugs } from './slug.mjs';

describe('cleanSlug', () => {
  it('trims leading/trailing whitespace', () => {
    expect(cleanSlug('test-news-test ')).toBe('test-news-test');
    expect(cleanSlug('  a-b  ')).toBe('a-b');
    expect(cleanSlug('clean')).toBe('clean');
  });
  it('passes through non-strings unchanged', () => {
    expect(cleanSlug(null)).toBe(null);
    expect(cleanSlug(undefined)).toBe(undefined);
  });
});

describe('normalizeSlugs', () => {
  it('trims record slugs and nested tag slugs across every collection', () => {
    const data = {
      news: [{ slug: 'a ', title: 'A', tags: [{ name: 'T', slug: 'drug-court ' }] }],
      meetings: [{ slug: ' m1 ' }],
      sites: [{ slug: 'site-x' }],
      meta: { slug: 'ignored ' }, // non-array value: untouched
    };
    normalizeSlugs(data);
    expect(data.news[0].slug).toBe('a');
    expect(data.news[0].tags[0].slug).toBe('drug-court');
    expect(data.meetings[0].slug).toBe('m1');
    expect(data.sites[0].slug).toBe('site-x');
    expect(data.meta.slug).toBe('ignored ');
  });
  it('is idempotent and tolerates missing/empty fields', () => {
    const data: { news: Array<{ title?: string; slug?: string } | null> } = {
      news: [{ title: 'no slug' }, null, { slug: 'x ' }],
    };
    expect(() => normalizeSlugs(normalizeSlugs(data))).not.toThrow();
    expect(data.news[2]?.slug).toBe('x');
  });
});
