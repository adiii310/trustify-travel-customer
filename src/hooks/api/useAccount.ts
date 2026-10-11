"use client";

/**
 * Customer accounts and bookings — the only authenticated part of this site.
 *
 * Every hook here reads the bearer token the `accountStore` put into the API
 * client. The server derives the customer from that token, so none of these
 * calls sends a member id and none of them could be pointed at someone else's
 * data by changing a parameter.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";

import { accountEndpoints, bookingEndpoints } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/errors";
import { toAccount, toBooking, toBookings } from "@/lib/api/mappers";
import type {
  BookingPayload,
  LoginPayload,
  RegisterPayload,
} from "@/lib/api/types";
import { queryKeys } from "@/lib/query/keys";
import type { Account, BookingRequest } from "@/lib/types";
import { useAccountStore } from "@/store/accountStore";

/**
 * Sign in, or create an account.
 *
 * Both return a token and the profile, so there is no second step: the store
 * is updated here and every authenticated hook below becomes enabled.
 */
function useSessionMutation<TPayload>(
  run: (payload: TPayload) => Promise<{ token: string; member: Parameters<typeof toAccount>[0] }>
): UseMutationResult<Account, Error, TPayload> {
  const client = useQueryClient();
  const setSession = useAccountStore((s) => s.setSession);

  return useMutation({
    mutationFn: async (payload: TPayload) => {
      const { token, member } = await run(payload);
      const account = toAccount(member);
      setSession(account, token);
      return account;
    },
    // A fresh session must not see the previous person's bookings, even for the
    // moment before a refetch lands.
    onSuccess: () => client.removeQueries({ queryKey: queryKeys.account.all() }),
    // Never retried: a second sign-in attempt with the same wrong password
    // spends another of the ten the server allows per 15 minutes.
    retry: false,
  });
}

export const useRegister = () =>
  useSessionMutation<RegisterPayload>(accountEndpoints.register);

export const useLogin = () => useSessionMutation<LoginPayload>(accountEndpoints.login);

/**
 * Sign out: drop the token, then every cache entry under `account`.
 *
 * Clearing the cache is the point — on a shared device the next person must
 * not find the previous one's bookings sitting in memory.
 */
export function useSignOut(): () => void {
  const client = useQueryClient();
  const signOut = useAccountStore((s) => s.signOut);

  return () => {
    signOut();
    client.removeQueries({ queryKey: queryKeys.account.all() });
  };
}

/**
 * Revalidate the stored token against the server.
 *
 * A persisted session can outlive its token — it expires, or the account is
 * removed. A 401 here signs the traveller out rather than leaving them on a
 * page that cannot load anything.
 */
export function useSession(): UseQueryResult<Account, Error> {
  const token = useAccountStore((s) => s.token);
  const setAccount = useAccountStore((s) => s.setAccount);
  const signOut = useSignOut();

  return useQuery({
    queryKey: queryKeys.account.me(),
    queryFn: async () => {
      try {
        const { member } = await accountEndpoints.me();
        const account = toAccount(member);
        setAccount(account);
        return account;
      } catch (cause) {
        if (cause instanceof ApiError && cause.status === 401) signOut();
        throw cause;
      }
    },
    enabled: Boolean(token),
    retry: false,
    staleTime: 5 * 60_000,
  });
}

/** The signed-in traveller's own bookings, newest first. */
export function useMyBookings(
  status?: string
): UseQueryResult<BookingRequest[], Error> {
  const token = useAccountStore((s) => s.token);

  return useQuery({
    queryKey: queryKeys.account.bookings(status),
    queryFn: () => bookingEndpoints.mine(status),
    select: toBookings,
    enabled: Boolean(token),
  });
}

/** One of their own. Another traveller's booking is a 404, never a 403. */
export function useMyBooking(
  id: string | undefined
): UseQueryResult<BookingRequest, Error> {
  const token = useAccountStore((s) => s.token);

  return useQuery({
    // Non-null assertion is safe: `enabled` holds the query until both exist.
    queryKey: queryKeys.account.booking(id ?? ""),
    queryFn: () => bookingEndpoints.one(id!),
    select: toBooking,
    enabled: Boolean(token && id),
  });
}

/**
 * Submit a booking request.
 *
 * Lands as `pending`, takes no payment and confirms nothing — the team
 * reviews it and gets in touch. The server prices it from the package, so an
 * amount cannot be set from here.
 */
export function useRequestBooking(): UseMutationResult<
  BookingRequest,
  Error,
  BookingPayload
> {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BookingPayload) =>
      toBooking(await bookingEndpoints.request(payload)),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.account.all() }),
    // Each attempt spends one of the twenty submissions allowed per IP per ten
    // minutes, and a retried booking request is a duplicate booking.
    retry: false,
  });
}

/** Update the permitted profile fields. `email` is not one of them. */
export function useUpdateProfile(): UseMutationResult<
  Account,
  Error,
  Partial<Pick<Account, "name" | "phone" | "username">>
> {
  const setAccount = useAccountStore((s) => s.setAccount);

  return useMutation({
    mutationFn: async (payload) => {
      const { member } = await accountEndpoints.updateProfile(payload);
      const account = toAccount(member);
      setAccount(account);
      return account;
    },
    retry: false,
  });
}

/** Change the password, proving the current one. Reissues the token. */
export function useChangePassword(): UseMutationResult<
  void,
  Error,
  { currentPassword: string; newPassword: string }
> {
  const setSession = useAccountStore((s) => s.setSession);

  return useMutation({
    mutationFn: async (payload) => {
      const { token, member } = await accountEndpoints.changePassword(payload);
      setSession(toAccount(member), token);
    },
    retry: false,
  });
}
