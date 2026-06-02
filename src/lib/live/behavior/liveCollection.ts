// src/lib/live/behavior/liveCollection.ts
// Alpine factory for innerHTML list surfaces (HomeNews, HomeMeetings). The
// static server markup is the baseline; on mount (deferred to idle) and on tab
// focus we fetch live, compare a signature, and only on a real change re-render
// the region and announce it. The progress bar runs on every fetch regardless.
// Index tables use a separate listingTable mixin (they're already x-for driven).

import { gqlFetch } from '../data/endpoint';
import { stableSignature } from './signature';
import { announce } from './announce';
import { progress } from './progress';
import { fadeSwap } from './transition';
import { onVisible } from './focus-refetch';
import type { LiveConfig } from '../types';

interface CollectionState {
  _sig: string;
  _ctrl: AbortController | null;
  _stop: (() => void) | null;
  $refs: Record<string, HTMLElement>;
  refresh(): Promise<void>;
}

interface IdleWindow {
  requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => void;
}

export function makeLiveCollection(config: LiveConfig) {
  return (opts: { surface: string; sig: string }) => ({
    _sig: opts.sig,
    _ctrl: null as AbortController | null,
    _stop: null as (() => void) | null,

    init(this: CollectionState) {
      if (!config.collections[opts.surface]) return;
      const kick = () => { void this.refresh(); };
      const w = window as unknown as IdleWindow;
      if (typeof w.requestIdleCallback === 'function') {
        w.requestIdleCallback(kick, { timeout: 2000 });
      } else {
        window.setTimeout(kick, 200);
      }
      this._stop = onVisible(kick);
    },

    destroy(this: CollectionState) {
      this._ctrl?.abort();
      this._stop?.();
    },

    async refresh(this: CollectionState) {
      const surface = config.collections[opts.surface];
      if (!surface) return;
      this._ctrl?.abort();
      const ctrl = new AbortController();
      this._ctrl = ctrl;
      progress.start();
      try {
        const data = await gqlFetch(
          config.ctx.endpoint, surface.query, surface.variables ?? {}, { signal: ctrl.signal },
        );
        const rows = surface.select(data, config.ctx);
        const sig = stableSignature(rows, surface.signatureKeys);
        if (sig === this._sig) return;          // unchanged → silent (bar still ran)
        this._sig = sig;
        const region = this.$refs.region;
        if (surface.render && region) {
          // XSS-safe by contract: list render fns HTML-escape every interpolated
          // field (see render/*.ts); detail surfaces run content through the
          // xss-sanitizing renderMarkdown — same sanitizer the static build uses.
          const html = surface.render(rows, config.ctx);
          fadeSwap(region, () => { region.innerHTML = html; });
          announce(`${surface.announceLabel} updated`);
        }
      } catch {
        /* keep static / last-good DOM — never blank on failure */
      } finally {
        progress.done();
        if (this._ctrl === ctrl) this._ctrl = null;
      }
    },
  });
}
