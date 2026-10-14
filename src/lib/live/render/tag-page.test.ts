import { describe, it, expect } from 'vitest';
import { tagPageRows, renderTagSections, TAG_SIG_KEYS, type TagRow } from './tag-page';
import { liveConfig } from '../config';
import { TAGGED_ITEMS } from '../data/queries';

const ctx = { endpoint: '', basePath: '/adultredeploy' };
const data = {
  posts: [
    { slug: 'n1', title: 'News & <One>', tags: [{ slug: 'data' }] },
    { slug: 'n2', title: 'Untagged', tags: [] },
  ],
  meetings: [
    { slug: 'm1', title: 'Board', category: 'regular', tags: [{ slug: 'data' }, { slug: 'x' }] },
  ],
  resources: [
    { slug: 'r1', title: 'Report', category: 'annualReport', tags: [{ slug: 'data' }] },
    { slug: 'r2', title: 'Other', category: 'summit', tags: null },
  ],
};

describe('tagPageRows', () => {
  it('collects tagged news, meetings and resources (in that order) with canonical hrefs', () => {
    expect(tagPageRows(data, ctx, 'data')).toEqual<TagRow[]>([
      { group: 'News', title: 'News & <One>', href: '/adultredeploy/news/n1' },
      { group: 'Meetings', title: 'Board', href: '/adultredeploy/about/meetings/regular-oversight/m1' },
      { group: 'Resources', title: 'Report', href: '/adultredeploy/resources/annual-report/r1' },
    ]);
  });
  it('returns no rows for a tag nothing carries', () => {
    expect(tagPageRows(data, ctx, 'nope')).toEqual([]);
  });
});

describe('renderTagSections', () => {
  it('renders one section per group with an escaped linked list', () => {
    const html = renderTagSections(tagPageRows(data, ctx, 'data'));
    expect(html).toContain('<h2 class="font-heading font-bold text-xl mb-3">News</h2>');
    expect(html).toContain('<h2 class="font-heading font-bold text-xl mb-3">Resources</h2>');
    expect(html).toContain('href="/adultredeploy/news/n1"');
    expect(html).toContain('News &amp; &lt;One&gt;');
    expect(html).not.toContain('<One>');
  });
  it('renders the empty-state paragraph when nothing carries the tag', () => {
    expect(renderTagSections([])).toBe('<p class="mt-6 italic">No tagged content yet.</p>');
  });
});

describe('liveConfig.collections.tagPage', () => {
  const s = liveConfig.collections.tagPage;
  it('is an innerHTML collection on TAGGED_ITEMS, selecting by the tag in params', () => {
    expect(s.mode).toBe('innerHTML');
    expect(s.query).toBe(TAGGED_ITEMS);
    expect(s.select(data, ctx, { tag: 'data' }).map((r: any) => r.title)).toEqual(['News & <One>', 'Board', 'Report']);
    expect(s.render).toBe(renderTagSections);
    expect(s.signatureKeys).toBe(TAG_SIG_KEYS);
    expect(TAG_SIG_KEYS).toEqual(['group', 'title', 'href']);
  });
});
