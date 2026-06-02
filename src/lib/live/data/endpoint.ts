// src/lib/live/data/endpoint.ts
// Minimal browser GraphQL fetch. POST + cache:'no-store' so every refresh is
// fresh (POST is uncached by browsers/CDNs anyway). Caller passes an
// AbortSignal; we also enforce a timeout. Throws on any non-2xx, network error,
// timeout, or GraphQL `errors` payload — callers swallow it and keep the static
// DOM (never blank the page).

export interface GqlOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

export async function gqlFetch<T = any>(
  endpoint: string,
  query: string,
  variables: Record<string, unknown> = {},
  opts: GqlOptions = {},
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
