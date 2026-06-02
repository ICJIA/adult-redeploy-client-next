// src/lib/live/behavior/transition.ts
// Subtle fade-in applied when live content replaces the static baseline, so a
// swap reads as "content just refreshed" instead of an instant pop. Opacity
// only → no layout shift. Honors prefers-reduced-motion (instant) and degrades
// gracefully where the Web Animations API is unavailable.

function reduced(): boolean {
  return typeof window !== 'undefined'
    && !!window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function fadeSwap(el: HTMLElement, apply: () => void): void {
  apply();
  if (reduced() || typeof el.animate !== 'function') return;
  el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease' });
}
