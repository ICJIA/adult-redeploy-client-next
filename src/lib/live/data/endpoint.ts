// src/lib/live/data/endpoint.ts
// Minimal browser GraphQL fetch. POST + cache:'no-store' so every refresh is
// fresh (POST is uncached by browsers/CDNs anyway). Caller passes an
// AbortSignal; we also enforce a timeout. Throws on any non-2xx, network error,
// timeout, or GraphQL `errors` payload — callers swallow it and keep the static
// DOM (never blank the page).
//
// Concurrent identical requests (same endpoint + query + variables) are
// de-duplicated: e.g. the /meetings page mounts a splash + 5 category tables
// that all read the same meetings query, so they share ONE network request
// instead of hammering Strapi. The first caller's signal/timeout drives it.

export interface GqlOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

const inflight = new Map<string, Promise<any>>();

async function doFetch<T>(
  endpoint: string,
  query: string,
  variables: Record<string, unknown>,
  opts: GqlOptions,
): Promise<T> {
  const { signal, timeoutMs = 6000 } = opts;
  const ctrl = new AbortController();
  const onAbort = () => ctrl.abort();
  if (signal) {
    if (signal.aborted) ctrl.abort();
    else signal.addEventListener('abort', onAbort, { once: true });
  }
  const timer = window.setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.errors) throw new Error('GraphQL errors');
    return json.data as T;
  } finally {
    window.clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', onAbort);
  }
}

export function gqlFetch<T = any>(
  endpoint: string,
  query: string,
  variables: Record<string, unknown> = {},
  opts: GqlOptions = {},
): Promise<T> {
  const key = `${endpoint}|${query}|${JSON.stringify(variables)}`;
  const hit = inflight.get(key);
  if (hit) return hit as Promise<T>;
  const p = doFetch<T>(endpoint, query, variables, opts);
  inflight.set(key, p);
  // Clear the entry once settled so the next refresh fetches fresh data.
  p.then(() => inflight.delete(key), () => inflight.delete(key));
  return p;
}
