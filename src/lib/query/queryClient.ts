/**
 * QueryClient factory and shared defaults.
 *
 * Defaults are tuned to this specific API:
 *
 *  - Reads are unauthenticated, unpaged and not rate limited, but the content
 *    changes at human moderation speed. A 60s `staleTime` means navigating
 *    around the site re-uses cached lists instead of refetching constantly.
 *  - Retrying a 4xx is pointless — a 400 will fail identically, and a 429 only
 *    gets worse. We retry network blips and 5xx only.
 *  - Mutations are never retried: every one of them writes a record, and a
 *    silent second attempt would both duplicate the row and burn two of the
 *    twenty submissions allowed per 10 minutes.
 */

import { QueryClient, isServer } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";

/** Reads stay fresh this long before a refetch is considered. */
const STALE_TIME_MS = 60_000;

/** Unused cache entries are dropped after this long. */
const GC_TIME_MS = 5 * 60_000;

/** Give up after this many retries of a retryable failure. */
const MAX_RETRIES = 2;

/**
 * Retry only what retrying can fix. Client errors (4xx) are deterministic:
 * the same request will fail the same way.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false;
  if (error instanceof ApiError) {
    if (error.kind === "network") return true;
    return error.status >= 500;
  }
  return false;
}

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        gcTime: GC_TIME_MS,
        retry: shouldRetry,
        // Refocusing the tab should not re-hammer the API for content that
        // changes a few times a day. Components that need freshness opt in
        // with an explicit `refetchInterval`.
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * On the server, every request gets its own client so one visitor's data can
 * never leak into another's. In the browser a single client is reused across
 * navigations — recreating it would throw the cache away on every render.
 */
let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
