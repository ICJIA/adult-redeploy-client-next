import { describe, it, expect } from 'vitest';
import { liveConfig } from './config';
import { SECTION_BY_SLUG } from './data/queries';
import { applyPageBody, PAGE_BODY_SIG } from './render/page-body';

describe('SECTION_BY_SLUG query', () => {
  it('selects sections by a JSON where-variable and fetches body + updatedAt', () => {
    expect(SECTION_BY_SLUG).toContain('sections(where: $where)');
    for (const field of ['slug', 'title', 'summary', 'content', 'updatedAt']) {
      expect(SECTION_BY_SLUG).toContain(field);
    }
    // updatedAt is the change signal; publishedAt is intentionally NOT fetched.
    expect(SECTION_BY_SLUG).not.toContain('publishedAt');
  });
});

describe('liveConfig.entries.sectionDetail', () => {
  const surface = liveConfig.entries.sectionDetail;

  it('is registered as an entry surface', () => {
    expect(surface).toBeDefined();
  });

  it('builds a published-only where clause from the slug', () => {
    expect(surface.variables!('grants')).toEqual({
      where: { isPublished: true, slug: 'grants' },
    });
  });

  it('selects the first section row, or null when absent', () => {
    const row = { slug: 'grants', content: 'body', updatedAt: '2026-05-20T21:09:21.039Z' };
    expect(surface.select({ sections: [row] }, liveConfig.ctx)).toBe(row);
    expect(surface.select({ sections: [] }, liveConfig.ctx)).toBeNull();
    expect(surface.select({}, liveConfig.ctx)).toBeNull();
  });

  it('reuses the generic page-body renderer + updatedAt signature', () => {
    expect(surface.applyTo).toBe(applyPageBody);
    expect(surface.signature).toBe(PAGE_BODY_SIG);
    expect(surface.signature({ updatedAt: '2026-05-20T21:09:21.039Z' }))
      .toBe('2026-05-20T21:09:21.039Z');
  });
});
