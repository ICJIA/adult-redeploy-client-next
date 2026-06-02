// src/lib/live/render/home-about.ts
// The homepage "About" island is just the generic CMS page-body surface. This
// shim preserves the original public API (applyHomeAbout / ABOUT_SIG) so existing
// imports keep working; the implementation now lives in page-body.ts (shared with
// /programs and any future single-CMS-page island).

export { applyPageBody as applyHomeAbout, PAGE_BODY_SIG as ABOUT_SIG } from './page-body';
