/**
 * The signed-in traveller and their bearer token.
 *
 * This used to hold a *label*: `POST /members` was identity capture, issued no
 * token, and nothing could be gated on it. Customer accounts changed that —
 * registration and login return a real JWT, and `/bookings` is authenticated.
 * The passwordless endpoint still exists and still behaves the same way, but
 * it is no longer what this store represents.
 *
 * The token is persisted so a reload keeps the session, and pushed into
 * `lib/api/client` on every change — the client cannot import this store
 * without dragging React into a module that server components also use.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { setAuthToken } from "@/lib/api/client";
import type { Account } from "@/lib/types";

type AccountState = {
  account: Account | null;
  /** The customer JWT. Empty when signed out. */
  token: string;
  /** The member `_id`, kept for support references. */
  memberId: string | null;

  /** Record a signed-in session. Call after register or login responds. */
  setSession: (account: Account, token: string) => void;
  /** Update the cached profile without touching the token. */
  setAccount: (account: Account) => void;
  signOut: () => void;
};

export const useAccountStore = create<AccountState>()(
  persist(
    (set) => ({
      account: null,
      token: "",
      memberId: null,

      setSession: (account, token) => {
        setAuthToken(token);
        set({ account, token, memberId: account.id ?? null });
      },

      setAccount: (account) => set({ account, memberId: account.id ?? null }),

      // Trips, saved companies and the compare tray deliberately survive a sign
      // out — they live on the device, not in an account. The token does not.
      signOut: () => {
        setAuthToken("");
        set({ account: null, token: "", memberId: null });
      },
    }),
    {
      name: "tt.account",
      /**
       * `persist` reads localStorage at module evaluation, before any component
       * mounts. Handing the restored token to the client here is what makes a
       * reload keep working: the first authenticated request may fire before
       * React has rendered anything.
       */
      onRehydrateStorage: () => (state) => {
        if (state?.token) setAuthToken(state.token);
      },
    }
  )
);

/* ---------- Selectors ----------
 * Subscribing to a slice rather than the whole store means a component only
 * re-renders when the slice it reads actually changes. */

export const useAccount = () => useAccountStore((s) => s.account);
export const useIsSignedIn = () => useAccountStore((s) => s.token !== "");
