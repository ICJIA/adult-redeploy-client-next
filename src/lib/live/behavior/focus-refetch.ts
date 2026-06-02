// src/lib/live/behavior/focus-refetch.ts
// Re-run a callback when the tab becomes visible / regains focus, throttled so
// rapid tab-switching doesn't hammer Strapi or the live region. Returns a
// cleanup function for the Alpine component's destroy().

export function onVisible(cb: () => void, throttleMs = 30000): () => void {
  let last = 0;
  const handler = () => {
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
    const now = Date.now();
    if (now - last < throttleMs) return;
    last = now;
    cb();
  };
  document.addEventListener('visibilitychange', handler);
  window.addEventListener('focus', handler);
  return () => {
    document.removeEventListener('visibilitychange', handler);
    window.removeEventListener('focus', handler);
  };
}
