"use client";

import { useEffect, useState } from "react";

/**
 * False during server rendering and on the very first client render, true from
 * the first effect onwards.
 *
 * Why this is needed: Zustand's `persist` middleware reads localStorage
 * synchronously when the store module is first evaluated in the browser. By the
 * time React hydrates, the store already holds the visitor's saved companies —
 * but the server-rendered HTML was built from the empty defaults. Rendering
 * that restored state immediately would be a hydration mismatch.
 *
 * So components render the neutral, server-matching state until this flips,
 * then re-render with the real values:
 *
 * ```tsx
 * const hydrated = useHydrated();
 * const saved = useSavedStore((s) => s.saved);
 * return <span>{hydrated ? `${saved.length} saved` : "…"}</span>;
 * ```
 *
 * Returning a single shared flag (rather than one per store) is correct here
 * because every store uses synchronous localStorage: they are all rehydrated
 * by the time the first effect runs.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
