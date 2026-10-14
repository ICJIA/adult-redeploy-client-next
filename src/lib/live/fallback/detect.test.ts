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
  it('matches a meeting detail path (slug = last segment), proxied + raw host', () => {
    expect(detectSurface('/about/meetings/regular-oversight/test-meeting-june-5', BASE))
      .toEqual({ surface: 'meetingDetail', slug: 'test-meeting-june-5' });
    expect(detectSurface('/adultredeploy/about/meetings/regular-oversight/test-meeting-june-5', BASE))
      .toEqual({ surface: 'meetingDetail', slug: 'test-meeting-june-5' });
  });
  it('returns null for the meetings index + a bare category page (not a detail)', () => {
    expect(detectSurface('/about/meetings', BASE)).toBeNull();
    expect(detectSurface('/about/meetings/regular-oversight', BASE)).toBeNull();
    expect(detectSurface('/about/meetings/a/b/c', BASE)).toBeNull();
  });
});

describe('detectSurface — biographies', () => {
  it('matches a biography slug, proxied + raw host', () => {
    expect(detectSurface('/about/biographies/jane-doe', BASE)).toEqual({ surface: 'bioDetail', slug: 'jane-doe' });
    expect(detectSurface('/adultredeploy/about/biographies/jane-doe/', BASE)).toEqual({ surface: 'bioDetail', slug: 'jane-doe' });
  });
  it('returns null for the bare prefix and for nested paths', () => {
    expect(detectSurface('/about/biographies', BASE)).toBeNull();
    expect(detectSurface('/about/biographies/', BASE)).toBeNull();
    expect(detectSurface('/about/biographies/a/b', BASE)).toBeNull();
  });
});

describe('detectSurface — resources', () => {
  it('matches a resource detail path (category + slug), proxied + raw host', () => {
    expect(detectSurface('/resources/annual-report/ari-2026', BASE)).toEqual({ surface: 'resourceDetail', slug: 'ari-2026' });
    expect(detectSurface('/adultredeploy/resources/summits/s-2026/', BASE)).toEqual({ surface: 'resourceDetail', slug: 's-2026' });
  });
  it('returns null for the resources index, a bare category, and deeper paths', () => {
    expect(detectSurface('/resources', BASE)).toBeNull();
    expect(detectSurface('/resources/annual-report', BASE)).toBeNull();
    expect(detectSurface('/resources/a/b/c', BASE)).toBeNull();
  });
});
