import { describe, it, expect } from 'vitest';
import { renderTags } from './news-detail';

const ctx = { endpoint: '', basePath: '/adultredeploy' };

describe('renderTags', () => {
  it('returns empty string for no tags', () => {
    expect(renderTags([], ctx)).toBe('');
    expect(renderTags(null, ctx)).toBe('');
  });
  it('skips tags missing a name or slug', () => {
    expect(renderTags([{ name: 'X' }, { slug: 'y' }], ctx)).toBe('');
  });
  it('builds base-pathed tag links and escapes the name', () => {
    const html = renderTags([{ name: 'Drug Court & <Mental>', slug: 'drug-court' }], ctx);
    expect(html).toContain('href="/adultredeploy/tags/drug-court"');
    expect(html).toContain('Drug Court &amp; &lt;Mental&gt;');
    expect(html).toContain('bg-brand-secondary');
  });
});
