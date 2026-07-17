// src/lib/markdown.test.ts
import { describe, it, expect } from 'vitest';
import { renderMarkdown } from './markdown.ts';

describe('renderMarkdown', () => {
  it('renders headings', () => {
    expect(renderMarkdown('# hi')).toContain('<h1>hi</h1>');
  });
  it('renders links', () => {
    expect(renderMarkdown('see [a](https://x) now'))
      .toContain('<a href="https://x">a</a>');
  });
  describe('standalone links get .tap-target (SIA-R111 / WCAG 2.5.5)', () => {
    it('tags a link that is a paragraph\'s only content', () => {
      expect(renderMarkdown('[Download the report](https://x)'))
        .toContain('<a href="https://x" class="tap-target">Download the report</a>');
    });
    it('tags a bare linkified URL on its own line', () => {
      expect(renderMarkdown('https://example.com'))
        .toContain('class="tap-target"');
    });
    it('tags a link that is a list item\'s only content', () => {
      expect(renderMarkdown('- [Agenda](https://x)'))
        .toContain('class="tap-target"');
    });
    it('tags a link that is a heading\'s only content', () => {
      expect(renderMarkdown('## [Section](https://x)'))
        .toContain('class="tap-target"');
    });
    it('leaves links inside a sentence untouched (WCAG inline exemption)', () => {
      const html = renderMarkdown('Read the [report](https://x) for details.');
      expect(html).not.toContain('tap-target');
    });
    it('leaves a paragraph with two links untouched', () => {
      const html = renderMarkdown('[a](https://x) [b](https://y)');
      expect(html).not.toContain('tap-target');
    });
  });
  it('strips dangerous tags', () => {
    expect(renderMarkdown('<script>alert(1)</script>'))
      .not.toContain('<script>');
  });
  it('handles null/empty', () => {
    expect(renderMarkdown(null)).toBe('');
    expect(renderMarkdown(undefined)).toBe('');
    expect(renderMarkdown('')).toBe('');
  });
  it('preserves safe CMS inline image styles so text wraps (e.g. the state seal)', () => {
    const html = renderMarkdown(
      '<img src="https://ari.icjia-api.cloud/uploads/x.png" alt="seal" '
      + 'style="float: left; margin: 4px 10px 0 0;">',
    );
    expect(html).toMatch(/float\s*:\s*left/);
  });
});
