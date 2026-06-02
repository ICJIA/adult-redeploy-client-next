// src/lib/live/render/home-about.ts
// Live update for the homepage "About" section (the CMS `home` page body).
// Markdown imported lazily, gated on a real change.

import { liveEl } from './shared';
import { fadeSwap } from '../behavior/transition';
import type { LiveContext } from '../types';

export const ABOUT_SIG = (v: any): string => String(v?.updatedAt ?? '');

export async function applyHomeAbout(root: HTMLElement, view: any, _ctx: LiveContext): Promise<void> {
  const body = liveEl(root, 'body');
  if (body) {
    const { renderMarkdown } = await import('../../markdown/core');
    fadeSwap(body, () => { body.innerHTML = renderMarkdown(view.content ?? ''); });
  }
}
