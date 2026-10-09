/**
 * Bookings and self-planned itineraries.
 *
 * These are entirely local. The public API has no booking endpoint and no
 * "my trips" read — `POST /enquiries` sends a lead to a company, but nothing
 * comes back that could be listed here. Clearing site data loses them, which
 * is why the UI never presents a trip as confirmed by the company.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Booking, Trip, TripPlan } from "@/lib/types";

type TripsState = {
  /** Newest first. */
  trips: Trip[];
  addTrip: (trip: Trip) => void;
  updateTrip: (id: string, patch: Partial<Booking> | Partial<TripPlan>) => void;
  removeTrip: (id: string) => void;
};

export const useTripsStore = create<TripsState>()(
  persist(
    (set) => ({
      trips: [],

      addTrip: (trip) => set((s) => ({ trips: [trip, ...s.trips] })),

      updateTrip: (id, patch) =>
        set((s) => ({
          // The cast is safe because a patch is only ever built for the variant
          // the trip already is — a Booking patch for a Booking, and so on.
          trips: s.trips.map((t) =>
            t.id === id ? ({ ...t, ...patch } as Trip) : t
          ),
        })),

      removeTrip: (id) =>
        set((s) => ({ trips: s.trips.filter((t) => t.id !== id) })),
    }),
    { name: "tt.trips" }
  )
);

/** One trip by id, or undefined. Subscribes to that trip only. */
export const useTrip = (id: string) =>
  useTripsStore((s) => s.trips.find((t) => t.id === id));

export const useTripCount = () => useTripsStore((s) => s.trips.length);
