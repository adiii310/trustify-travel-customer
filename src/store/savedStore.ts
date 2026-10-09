/**
 * Companies the visitor has bookmarked.
 *
 * Stored as slugs (the `id` on a domain `Company`), on the device only — the
 * public API has no "my saved companies" endpoint and no personalisation.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

type SavedState = {
  /** Company slugs, most recently saved first. */
  saved: string[];
  /** @returns whether the company is saved *after* the toggle. */
  toggleSaved: (companyId: string) => boolean;
  clearSaved: () => void;
};

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      saved: [],

      toggleSaved: (companyId) => {
        const isSaved = get().saved.includes(companyId);
        set({
          saved: isSaved
            ? get().saved.filter((id) => id !== companyId)
            : [companyId, ...get().saved],
        });
        return !isSaved;
      },

      clearSaved: () => set({ saved: [] }),
    }),
    { name: "tt.saved" }
  )
);

/**
 * Whether one company is saved.
 *
 * Takes the id as an argument so the subscription is to a boolean, not to the
 * array — adding an unrelated company will not re-render this component.
 */
export const useIsSaved = (companyId: string) =>
  useSavedStore((s) => s.saved.includes(companyId));
