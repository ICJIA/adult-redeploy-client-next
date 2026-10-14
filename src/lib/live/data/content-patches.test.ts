import { describe, it, expect } from 'vitest';
import { patchContent, CONTENT_PATCHES } from './content-patches.mjs';

describe('patchContent (shared by the build fetch and the live islands)', () => {
  it('rewrites the eligibility-webinar caption h5 to bold text (R53 level skip + R78)', () => {
    const src = 'Intro.\n\n<div>\n\n[![x](i.jpg)](y)\n##### Click to play on YouTube{.muted .mt-5}\n</div>\n';
    expect(patchContent('resources', 'eligibility-webinar', src))
      .toBe('Intro.\n\n<div>\n\n[![x](i.jpg)](y)\n**Click to play on YouTube**\n</div>\n');
  });
  it('promotes the SFY21 NOFO first heading from h3 to h2', () => {
    expect(patchContent('news', 'ari-nofo-sfy21', '### Application deadline: March 31, 2020.\n\nBody'))
      .toBe('## Application deadline: March 31, 2020.\n\nBody');
  });
  it('leaves other slugs, other buckets, and already-corrected copy untouched', () => {
    const src = '##### Click to play on YouTube{.muted .mt-5}';
    expect(patchContent('resources', 'another-webinar', src)).toBe(src);
    expect(patchContent('news', 'eligibility-webinar', src)).toBe(src);
    expect(patchContent('resources', 'eligibility-webinar', '**Click to play on YouTube**'))
      .toBe('**Click to play on YouTube**');
  });
  it('passes non-string bodies through unchanged', () => {
    expect(patchContent('news', 'ari-nofo-sfy21', null)).toBeNull();
    expect(patchContent('news', 'ari-nofo-sfy21', undefined)).toBeUndefined();
  });
  it('declares both patches the build has always applied', () => {
    expect(CONTENT_PATCHES.map((p) => `${p.bucket}/${p.slug}`))
      .toEqual(['resources/eligibility-webinar', 'news/ari-nofo-sfy21']);
  });
});
