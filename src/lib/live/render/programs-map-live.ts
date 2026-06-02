// src/lib/live/render/programs-map-live.ts
// Alpine factory for the /programs county map. The set of clickable counties is
// fixed at build (it comes from the static legacy config in scripts/usiljs-config.js
// — NOT the CMS), so only the side-panel DATA is live: the site title/summary/link
// shown when a county is clicked is re-fetched so CMS edits appear without a
// rebuild. Same lifecycle as liveEntry (idle mount + tab-focus refetch, signature
// gating, progress bar, polite announce, build-time data kept on any failure).

import { gqlFetch } from '../data/endpoint';
import { SITES_BRIEF } from '../data/queries';
import { announce } from '../behavior/announce';
import { progress } from '../behavior/progress';
import { onVisible } from '../behavior/focus-refetch';
import {
  buildByCounty, mapSignature, type ByCounty, type CountyInfo, type SitePanel,
} from './programs-map';
import type { LiveConfig } from '../types';

interface MapState {
  base: string;
  byCounty: ByCounty;
  selected: CountyInfo | null;
  _sig: string;
  _ctrl: AbortController | null;
  _stop: (() => void) | null;
  $el: HTMLElement;
  select(county: string): void;
  refresh(): Promise<void>;
}
interface IdleWindow {
  requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => void;
}

export function makeLiveMap(config: LiveConfig) {
  return (opts: { byCounty: ByCounty; base: string; sig: string }) => ({
    base: opts.base,
    byCounty: opts.byCounty,
    selected: null as CountyInfo | null,
    _sig: opts.sig,
    _ctrl: null as AbortController | null,
    _stop: null as (() => void) | null,

    init(this: MapState) {
      // Wire click / keyboard selection on the build-time clickable counties.
      this.$el.querySelectorAll('svg [data-county]').forEach((node) => {
        const el = node as HTMLElement;
        const county = el.dataset.county;
        if (!county) return;
        el.addEventListener('click', () => this.select(county));
        el.addEventListener('keydown', (e) => {
          const ke = e as KeyboardEvent;
          if (ke.key === 'Enter' || ke.key === ' ') { ke.preventDefault(); this.select(county); }
        });
      });
      // Refresh panel data after paint + on tab focus (mirrors liveEntry).
      const kick = () => { void this.refresh(); };
      const w = window as unknown as IdleWindow;
      if (typeof w.requestIdleCallback === 'function') w.requestIdleCallback(kick, { timeout: 2000 });
      else window.setTimeout(kick, 200);
      this._stop = onVisible(kick);
    },

    destroy(this: MapState) {
      this._ctrl?.abort();
      this._stop?.();
    },

    select(this: MapState, county: string) {
      this.selected = this.byCounty[county] ?? null;
    },

    async refresh(this: MapState) {
      this._ctrl?.abort();
      const c = new AbortController();
      this._ctrl = c;
      progress.start();
      try {
        const data = await gqlFetch(config.ctx.endpoint, SITES_BRIEF, { limit: 300 }, { signal: c.signal });
        const rows = (data?.sites ?? []) as SitePanel[];
        if (!rows.length) return;                  // no data → keep build-time panel
        const sig = mapSignature(rows);
        if (sig === this._sig) return;             // unchanged → no update
        this._sig = sig;
        this.byCounty = buildByCounty(rows);
        // Keep an open panel in sync (or clear it if its site went away).
        if (this.selected) this.selected = this.byCounty[this.selected.slug] ?? null;
        announce('Programs map updated');
      } catch {
        /* keep the build-time panel data */
      } finally {
        progress.done();
        if (this._ctrl === c) this._ctrl = null;
      }
    },
  });
}
