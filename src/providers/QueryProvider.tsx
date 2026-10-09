"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState, type ReactNode } from "react";

import { getQueryClient } from "@/lib/query/queryClient";
import { subscribeToRateLimit } from "@/store/rateLimitStore";

/**
 * Makes the TanStack Query cache available to the whole tree, and wires the
 * API client's rate-limit broadcast into the Zustand store.
 *
 * The client is created inside `useState` rather than at module scope so that
 * a Fast Refresh or a second render never swaps the cache out mid-flight;
 * `getQueryClient()` still returns a single shared instance per browser tab.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(getQueryClient);

  useEffect(() => {
    // Returning the unsubscriber matters under React strict mode, which mounts
    // effects twice in development and would otherwise leave a stale listener.
    return subscribeToRateLimit();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Tree-shaken out of production builds by the devtools package itself. */}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
