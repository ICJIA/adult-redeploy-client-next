// src/lib/live/behavior/progress.ts
// Ref-counted top progress bar controller. Runs on EVERY live query — including
// the no-change case — so a refresh is always visibly indicated. Concurrent
// island fetches (homepage runs several at once) share one bar via the count.
// A minimum visible duration guarantees the bar is perceptible even when the
// response is instant. Reduced-motion is handled in CSS (LiveProgress.astro)
// plus the trickle skip below.

const MIN_VISIBLE_MS = 400;

let count = 0;
let bar: HTMLElement | null = null;
let fill: HTMLElement | null = null;
let trickle: number | null = null;
let shownAt = 0;

function reduced(): boolean {
  return typeof window !== 'undefined'
    && !!window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function els(): boolean {
  if (typeof document === 'undefined') return false;
  if (!bar) bar = document.getElementById('live-progress');
  if (bar && !fill) fill = bar.querySelector<HTMLElement>('[data-fill]');
  return !!(bar && fill);
}

function show(): void {
  if (!els() || !bar || !fill) return;
  shownAt = (typeof performance !== 'undefined' ? performance.now() : 0);
  if (trickle) { window.clearInterval(trickle); trickle = null; }
  bar.style.opacity = '1';
  if (reduced()) { fill.style.width = '80%'; return; }
  let w = 8;
  fill.style.width = w + '%';
  trickle = window.setInterval(() => {
    w = Math.min(w + (90 - w) * 0.12, 90);
    if (fill) fill.style.width = w + '%';
  }, 220);
}

function hide(): void {
  if (!els() || !bar || !fill) return;
  if (trickle) { window.clearInterval(trickle); trickle = null; }
  fill.style.width = '100%';
  const finish = () => {
    if (count !== 0) return;            // a new fetch started during the wait
    if (bar) bar.style.opacity = '0';
    window.setTimeout(() => { if (count === 0 && fill) fill.style.width = '0%'; }, 240);
  };
  const elapsed = (typeof performance !== 'undefined' ? performance.now() : 0) - shownAt;
  window.setTimeout(finish, Math.max(0, MIN_VISIBLE_MS - elapsed));
}

export const progress = {
  start(): void {
    count += 1;
    if (count === 1) show();
  },
  done(): void {
    count = Math.max(0, count - 1);
    if (count === 0) hide();
  },
};
