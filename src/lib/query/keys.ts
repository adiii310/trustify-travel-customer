/**
 * Query-key factory.
 *
 * Every key is built here so that invalidation is never a guess. Keys are
 * hierarchical: invalidating `queryKeys.reviews.all()` clears the all-company
 * list *and* every per-company list, because TanStack matches key prefixes.
 *
 *   ['trustify', 'reviews']            ← invalidate this…
 *   ['trustify', 'reviews', 'all']     ← …and these are refetched too
 *   ['trustify', 'reviews', 'H']
 *
 * `as const` on every return keeps the tuples literal, which is what gives
 * `useQuery` its type inference.
 */

/** Namespace prefix, so a single call clears everything this API owns. */
const ROOT = ["trustify"] as const;

/** Sentinel for "no company filter" — keeps the key shape uniform. */
const ALL = "all" as const;

export const queryKeys = {
  all: ROOT,

  health: () => [...ROOT, "health"] as const,

  companies: {
    all: () => [...ROOT, "companies"] as const,
    list: () => [...ROOT, "companies", "list"] as const,
  },

  destinations: {
    all: () => [...ROOT, "destinations"] as const,
    list: () => [...ROOT, "destinations", "list"] as const,
  },

  metrics: {
    all: () => [...ROOT, "metrics"] as const,
    list: () => [...ROOT, "metrics", "list"] as const,
  },

  reviews: {
    all: () => [...ROOT, "reviews"] as const,
    /** @param companyCode Short code (`k`), or undefined for every company. */
    list: (companyCode?: string) =>
      [...ROOT, "reviews", companyCode?.toUpperCase() ?? ALL] as const,
  },

  questions: {
    all: () => [...ROOT, "questions"] as const,
    /** @param companyCode Short code (`k`), or undefined for every company. */
    list: (companyCode?: string) =>
      [...ROOT, "questions", companyCode?.toUpperCase() ?? ALL] as const,
  },
} as const;
