// src/lib/markdown.ts
// Build/SSR entry point. Preserves the original manifest-aware behavior so
// static output stays byte-identical — it just injects the build-time CMS image
// resolver into the isomorphic renderer in ./markdown/core.
//
// Browser/live code imports ./markdown/core directly and omits the resolver
// (new Strapi images keep their original URLs, which CSP img-src already
// allows). Keeping ./markdown/core free of the manifest import means the
// lazy-loaded browser markdown chunk never ships the 76 KB image manifest.
import { renderMarkdown as renderCore } from './markdown/core';
import { getCmsImage } from './cms-image';

export function renderMarkdown(src: string | null | undefined): string {
  return renderCore(src, { imageResolver: getCmsImage });
}

export type { CmsImage, ImageResolver, RenderOptions } from './markdown/core';
