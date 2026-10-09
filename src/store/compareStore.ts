/**
 * The side-by-side comparison tray, capped at three companies.
 *
 * `toggleCompare` returns a *result* rather than showing a toast itself: a
 * store has no business reaching into React context, and the caller is the one
 * that knows which surface the message belongs on.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** The comparison table is laid out for at most three columns. */
export const MAX_COMPARE = 3;

export type CompareToggleResult =
  /** The company is now in the tray. */
  | { added: true; count: number }
  /** It was removed. */
  | { added: false; reason: "removed"; count: number }
  /** Nothing changed — the tray is already full. */
  | { added: false; reason: "limit"; count: number };

type CompareState = {
  /** Company slugs, in the order they were added. */
  compare: string[];
  toggleCompare: (companyId: string) => CompareToggleResult;
  clearCompare: () => void;
};

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      compare: [],

      toggleCompare: (companyId) => {
        const current = get().compare;

        if (current.includes(companyId)) {
          const next = current.filter((id) => id !== companyId);
          set({ compare: next });
          return { added: false, reason: "removed", count: next.length };
        }

        if (current.length >= MAX_COMPARE) {
          return { added: false, reason: "limit", count: current.length };
        }

        const next = [...current, companyId];
        set({ compare: next });
        return { added: true, count: next.length };
      },

      clearCompare: () => set({ compare: [] }),
    }),
    { name: "tt.compare" }
  )
);

/** Whether one company is in the tray — subscribes to a boolean, not the list. */
export const useInCompare = (companyId: string) =>
  useCompareStore((s) => s.compare.includes(companyId));

export const useCompareCount = () => useCompareStore((s) => s.compare.length);
