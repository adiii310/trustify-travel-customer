"use client";

/**
 * One hook over the device-owned state: the traveller's identity, saved
 * companies, the compare tray and local trips.
 *
 * It is a thin facade over the Zustand stores in `src/store`, and exists for
 * two reasons:
 *
 *  1. **Toasts.** `toggleSaved` and `toggleCompare` should tell the visitor
 *     what happened. A store must not reach into React context to do that, so
 *     the stores return a result and this layer turns it into a message.
 *  2. **One `ready` flag.** Persisted state cannot be rendered on the first
 *     pass without a hydration mismatch — see `useHydrated`.
 *
 * Server data (companies, destinations, reviews, questions) is deliberately
 * *not* here. Read it with the hooks in `src/hooks/api`, which cache and
 * invalidate it properly. New code can also use the stores directly; this hook
 * is the convenience path, not a required one.
 */

import { useCallback } from "react";

import {
  MAX_COMPARE,
  useAccountStore,
  useCompareStore,
  useHydrated,
  useSavedStore,
  useTripsStore,
} from "@/store";
import type { Booking, Trip, TripPlan } from "@/lib/types";
import { useToast } from "@/providers/ToastProvider";

export { MAX_COMPARE };

export function useApp() {
  const toast = useToast();

  /** False until persisted state has been restored — gate any render on it. */
  const ready = useHydrated();

  const account = useAccountStore((s) => s.account);
  const signOut = useAccountStore((s) => s.signOut);

  const saved = useSavedStore((s) => s.saved);
  const toggleSavedInStore = useSavedStore((s) => s.toggleSaved);

  const compare = useCompareStore((s) => s.compare);
  const toggleCompareInStore = useCompareStore((s) => s.toggleCompare);
  const clearCompare = useCompareStore((s) => s.clearCompare);

  const trips = useTripsStore((s) => s.trips);
  const addTrip = useTripsStore((s) => s.addTrip);
  const updateTrip = useTripsStore((s) => s.updateTrip);
  const removeTrip = useTripsStore((s) => s.removeTrip);

  const toggleSaved = useCallback(
    (companyId: string) => {
      const isSaved = toggleSavedInStore(companyId);
      toast(isSaved ? "Company saved" : "Removed from saved");
      return isSaved;
    },
    [toggleSavedInStore, toast]
  );

  /** @returns whether the company is in the tray after the toggle. */
  const toggleCompare = useCallback(
    (companyId: string) => {
      const result = toggleCompareInStore(companyId);

      if (result.added) {
        toast(`Added to compare (${result.count})`);
        return true;
      }
      toast(
        result.reason === "limit"
          ? `You can compare up to ${MAX_COMPARE} companies`
          : "Removed from compare"
      );
      return false;
    },
    [toggleCompareInStore, toast]
  );

  return {
    ready,

    account,
    signOut,

    saved,
    isSaved: (companyId: string) => saved.includes(companyId),
    toggleSaved,

    compare,
    inCompare: (companyId: string) => compare.includes(companyId),
    toggleCompare,
    clearCompare,

    trips,
    addTrip,
    updateTrip,
    removeTrip,
    getTrip: (id: string) => trips.find((t) => t.id === id),
  } satisfies AppFacade;
}

/** The shape `useApp()` returns, named so components can type a prop against it. */
export type AppFacade = {
  ready: boolean;
  account: ReturnType<typeof useAccountStore.getState>["account"];
  signOut: () => void;
  saved: string[];
  isSaved: (companyId: string) => boolean;
  toggleSaved: (companyId: string) => boolean;
  compare: string[];
  inCompare: (companyId: string) => boolean;
  toggleCompare: (companyId: string) => boolean;
  clearCompare: () => void;
  trips: Trip[];
  addTrip: (trip: Trip) => void;
  updateTrip: (id: string, patch: Partial<Booking> | Partial<TripPlan>) => void;
  removeTrip: (id: string) => void;
  getTrip: (id: string) => Trip | undefined;
};
