/**
 * How much of the submission budget is left.
 *
 * All six POST endpoints share one allowance — 20 per IP per 10 minutes — and
 * every submission response carries `RateLimit-*` headers describing it. The
 * API client broadcasts those headers; this store holds the latest reading so
 * forms can warn the visitor *before* they hit a 429.
 *
 * Deliberately NOT persisted: the window is short, the budget is per-IP rather
 * than per-device, and a stale reading restored from an old session would be
 * worse than no reading at all.
 */

import { create } from "zustand";

import { onRateLimit } from "@/lib/api/client";
import { SUBMISSION_RATE_LIMIT } from "@/lib/api/config";
import type { RateLimitSnapshot } from "@/lib/api/types";

/** Warn the visitor once the remaining budget drops to this. */
export const RATE_LIMIT_WARN_AT = 5;

/** A reading older than one window has expired and tells us nothing. */
const MAX_AGE_MS = SUBMISSION_RATE_LIMIT.windowSeconds * 1000;

type RateLimitState = {
  /** `null` until the first submission response comes back. */
  snapshot: RateLimitSnapshot | null;
  setSnapshot: (snapshot: RateLimitSnapshot) => void;
};

export const useRateLimitStore = create<RateLimitState>((set) => ({
  snapshot: null,
  setSnapshot: (snapshot) => set({ snapshot }),
}));

/**
 * Connect the API client's rate-limit broadcast to this store.
 *
 * Called once from `QueryProvider`. Returns the unsubscribe function so React
 * strict mode's double-mount does not leave two listeners behind.
 */
export function subscribeToRateLimit(): () => void {
  return onRateLimit((snapshot) =>
    useRateLimitStore.getState().setSnapshot(snapshot)
  );
}

/**
 * Submissions left in the current window, or `null` when unknown or expired.
 *
 * `null` means "we have no idea" and the UI should stay quiet — never render
 * it as zero.
 */
export function useSubmissionsRemaining(): number | null {
  return useRateLimitStore((s) => {
    if (!s.snapshot) return null;
    if (Date.now() - s.snapshot.readAt > MAX_AGE_MS) return null;
    return s.snapshot.remaining;
  });
}

/** True when the budget is low enough to be worth mentioning in a form. */
export function useIsRateLimitLow(): boolean {
  const remaining = useSubmissionsRemaining();
  return remaining !== null && remaining <= RATE_LIMIT_WARN_AT;
}
