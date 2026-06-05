import { describe, it, expect } from 'vitest';
import { detectSurface } from './detect';

const BASE = '/adultredeploy';

describe('detectSurface', () => {
  it('matches a news slug on the proxied (base-stripped) path', () => {
    expect(detectSurface('/news/my-article', BASE)).toEqual({ surface: 'newsDetail', slug: 'my-article' });
  });
  it('matches a news slug on the raw host (base-prefixed) path', () => {
    expect(detectSurface('/adultredeploy/news/my-article', BASE)).toEqual({ surface: 'newsDetail', slug: 'my-article' });
  });
  it('strips a trailing slash from the slug', () => {
    expect(detectSurface('/news/my-article/', BASE)).toEqual({ surface: 'newsDetail', slug: 'my-article' });
  });
  it('returns null for the bare /news index (no slug)', () => {
    expect(detectSurface('/news', BASE)).toBeNull();
    expect(detectSurface('/news/', BASE)).toBeNull();
  });
  it('returns null for nested paths under /news', () => {
    expect(detectSurface('/news/a/b', BASE)).toBeNull();
  });
  it('returns null for unrelated paths', () => {
    expect(detectSurface('/about', BASE)).toBeNull();
    expect(detectSurface('/adultredeploy/about', BASE)).toBeNull();
  });
});
