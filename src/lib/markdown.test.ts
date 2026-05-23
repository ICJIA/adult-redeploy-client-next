// src/lib/markdown.test.ts
import { describe, it, expect } from 'vitest';
import { renderMarkdown } from './markdown.ts';

describe('renderMarkdown', () => {
  it('renders headings', () => {
    expect(renderMarkdown('# hi')).toContain('<h1>hi</h1>');
  });
  it('renders links', () => {
    expect(renderMarkdown('[a](https://x)'))
      .toContain('<a href="https://x">a</a>');
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
});
