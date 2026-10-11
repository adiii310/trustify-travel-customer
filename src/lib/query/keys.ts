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
    /**
     * One destination and its covering companies.
     *
     * A sibling of `list()` under the same prefix, so `destinations.all()`
     * still clears every detail page along with the grid.
     *
     * @param slug The destination's `slug` / `id`.
     */
    detail: (slug: string) =>
      [...ROOT, "destinations", "detail", slug.toLowerCase()] as const,
  },

  metrics: {
    all: () => [...ROOT, "metrics"] as const,
    list: () => [...ROOT, "metrics", "list"] as const,
  },

  packages: {
    all: () => [...ROOT, "packages"] as const,
    /**
     * Keyed on the whole filter set, so narrowing by price or duration is a
     * separate cache entry rather than a silent overwrite of the full list.
     */
    list: (filters: Record<string, string | number | undefined> = {}) =>
      [...ROOT, "packages", "list", JSON.stringify(filters)] as const,
    detail: (id: string) => [...ROOT, "packages", "detail", id] as const,
  },

  /**
   * The signed-in traveller's own data.
   *
   * Namespaced under `account` so signing out can drop every private cache
   * entry in one call — leaving one customer's bookings readable to the next
   * person on a shared device would be the worst kind of leak.
   */
  account: {
    all: () => [...ROOT, "account"] as const,
    me: () => [...ROOT, "account", "me"] as const,
    bookings: (status?: string) =>
      [...ROOT, "account", "bookings", status ?? ALL] as const,
    booking: (id: string) => [...ROOT, "account", "bookings", "detail", id] as const,
  },

  /** Site content lists and settings — one cache entry each, rarely invalidated. */
  content: () => [...ROOT, "content"] as const,
  settings: () => [...ROOT, "settings"] as const,

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
