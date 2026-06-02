// src/lib/live/behavior/liveEntry.ts
// Alpine factory for single-record surfaces (news detail, meeting detail,
// homepage About). On mount (idle) and tab focus it fetches the record by slug,
// compares a cheap signature (updatedAt) to the build baseline, and only on a
// real change applies targeted DOM swaps via the surface's applyTo. Crucially,
// the heavy markdown renderer is imported INSIDE applyTo — so it downloads only
// when content actually changed, never on an unchanged view.

import { gqlFetch } from '../data/endpoint';
import { announce } from './announce';
import { progress } from './progress';
import { onVisible } from './focus-refetch';
import type { LiveConfig } from '../types';

interface EntryState {
  _sig: string;
  _ctrl: AbortController | null;
  _stop: (() => void) | null;
  $root: HTMLElement;
  refresh(): Promise<void>;
}
interface IdleWindow {
  requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => void;
}

export function makeLiveEntry(config: LiveConfig) {
  return (opts: { surface: string; slug: string; sig: string }) => ({
    _sig: opts.sig,
    _ctrl: null as AbortController | null,
    _stop: null as (() => void) | null,

    init(this: EntryState) {
      if (!config.entries[opts.surface]) return;
      const kick = () => { void this.refresh(); };
      const w = window as unknown as IdleWindow;
      if (typeof w.requestIdleCallback === 'function') {
        w.requestIdleCallback(kick, { timeout: 2000 });
      } else {
        window.setTimeout(kick, 200);
      }
      this._stop = onVisible(kick);
    },

    destroy(this: EntryState) {
      this._ctrl?.abort();
      this._stop?.();
    },

    async refresh(this: EntryState) {
      const surface = config.entries[opts.surface];
      if (!surface) return;
      this._ctrl?.abort();
      const c = new AbortController();
      this._ctrl = c;
      progress.start();
      try {
        const vars = surface.variables ? surface.variables(opts.slug) : {};
        const data = await gqlFetch(config.ctx.endpoint, surface.query, vars, { signal: c.signal });
        const view = surface.select(data, config.ctx);
        if (!view) return;                       // not found / shape mismatch → keep static
        const sig = surface.signature(view);
        if (sig === this._sig) return;           // unchanged → no markdown import, no swap
        this._sig = sig;
        await surface.applyTo(this.$root, view, config.ctx);
        announce(`${surface.announceLabel} updated`);
      } catch {
        /* keep the static / last-good DOM */
      } finally {
        progress.done();
        if (this._ctrl === c) this._ctrl = null;
      }
    },
  });
}
