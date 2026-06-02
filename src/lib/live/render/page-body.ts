// src/lib/live/render/page-body.ts
// Generic live update for a single CMS "page body" surface — any page whose body
// is one Markdown field keyed by updatedAt (homepage About, /programs, and future
// CMS pages). Markdown is imported lazily and only runs on a real change (gated by
// liveEntry's signature check), so unchanged views download zero markdown JS.
// This is the reusable building block; per-page wiring lives in config.ts.

import { liveEl } from './shared';
import { fadeSwap } from '../behavior/transition';
import type { LiveContext } from '../types';

export const PAGE_BODY_SIG = (v: any): string => String(v?.updatedAt ?? '');

export async function applyPageBody(root: HTMLElement, view: any, _ctx: LiveContext): Promise<void> {
  const body = liveEl(root, 'body');
  if (body) {
    const { renderMarkdown } = await import('../../markdown/core');
    fadeSwap(body, () => { body.innerHTML = renderMarkdown(view.content ?? ''); });
  }
}
