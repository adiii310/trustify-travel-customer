/**
 * Client state — Zustand.
 *
 * The split between this folder and `src/hooks/api` is the important one:
 *
 *   Zustand  → state this device owns. Survives a reload, never leaves the
 *              browser, has no server counterpart. Saved companies, the
 *              compare tray, local trips, the captured traveller identity.
 *
 *   TanStack → state the server owns. Fetched, cached, invalidated, and never
 *              hand-written into a store. Companies, destinations, reviews,
 *              questions.
 *
 * Server data must never be copied into a Zustand store: the moment it is,
 * there are two sources of truth and one of them is stale.
 *
 * `rateLimitStore` is the one in-memory exception — it mirrors response
 * headers rather than a resource, and a stale copy would be misleading.
 */

export { useAccount, useAccountStore, useIsSignedIn } from "./accountStore";
export {
  MAX_COMPARE,
  useCompareCount,
  useCompareStore,
  useInCompare,
  type CompareToggleResult,
} from "./compareStore";
export {
  RATE_LIMIT_WARN_AT,
  subscribeToRateLimit,
  useIsRateLimitLow,
  useRateLimitStore,
  useSubmissionsRemaining,
} from "./rateLimitStore";
export { useIsSaved, useSavedStore } from "./savedStore";
export { useTrip, useTripCount, useTripsStore } from "./tripsStore";
export { useHydrated } from "./useHydrated";
