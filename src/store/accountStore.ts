/**
 * The signed-in traveller, if any.
 *
 * IMPORTANT: `POST /members` is identity capture, not authentication. It
 * returns no token, grants no access, and nothing in the public API is
 * personalised. This store therefore holds a *label* — a name and an email
 * used to prefill forms — and nothing in the app may gate access on it.
 *
 * `phone` is kept client-side only: the members endpoint accepts just `name`
 * and `email`, so the number never leaves the device until a form sends it.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Account } from "@/lib/types";

type AccountState = {
  account: Account | null;
  /** The `_id` returned by `POST /members`. Useful for support, nothing else. */
  memberId: string | null;

  /** Record a successful sign-in. Call this *after* the API responds 201. */
  setAccount: (account: Account, memberId?: string) => void;
  signOut: () => void;
};

export const useAccountStore = create<AccountState>()(
  persist(
    (set) => ({
      account: null,
      memberId: null,

      setAccount: (account, memberId) =>
        set({ account, memberId: memberId ?? null }),

      // Trips, saved companies and the compare tray deliberately survive a sign
      // out — they live on the device, not in an account.
      signOut: () => set({ account: null, memberId: null }),
    }),
    { name: "tt.account" }
  )
);

/* ---------- Selectors ----------
 * Subscribing to a slice rather than the whole store means a component only
 * re-renders when the slice it reads actually changes. */

export const useAccount = () => useAccountStore((s) => s.account);
export const useIsSignedIn = () => useAccountStore((s) => s.account !== null);
