"use client";

/**
 * Destination reads.
 *
 * As with companies there is no by-id endpoint: match on `slug` / `id` against
 * the full list, which the server returns sorted by verified-company count.
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { readEndpoints } from "@/lib/api/endpoints";
import { toDestinationDetail, toDestinations } from "@/lib/api/mappers";
import { queryKeys } from "@/lib/query/keys";
import type { Company, Destination } from "@/lib/types";

/**
 * All published destinations, most-covered first.
 *
 * No `placeholderData` — see `useCompanies` for why. Callers show a skeleton
 * while `isPending`.
 */
export function useDestinations(): UseQueryResult<Destination[], Error> {
  return useQuery({
    queryKey: queryKeys.destinations.list(),
    queryFn: async () => toDestinations(await readEndpoints.destinations()),
  });
}

/** One destination by slug, or `undefined` while loading / when unknown. */
export function useDestination(slug: string | undefined) {
  const query = useDestinations();
  return {
    ...query,
    data: slug ? query.data?.find((d) => d.id === slug) : undefined,
  };
}

export type DestinationDetail = {
  destination: Destination;
  /** Published companies covering it, highest trust score first. May be empty. */
  companies: Company[];
};

/**
 * One destination **and the companies that travel there**, from
 * `GET /destinations/:slug`.
 *
 * Unlike every other read in this app, this one genuinely fetches a single
 * record — the join it performs (company `places` → destination slug) is not
 * something the client can do from the list endpoints alone without pulling
 * every company down first.
 *
 * An unknown or hidden slug rejects with a 404 `ApiError`; the page renders
 * that as "not found" rather than as an empty destination. An empty
 * `companies` array is a different thing entirely and is a normal result.
 */
export function useDestinationDetail(
  slug: string | undefined
): UseQueryResult<DestinationDetail, Error> {
  return useQuery({
    // Non-null assertion is safe: `enabled` holds the query until `slug` exists.
    queryKey: queryKeys.destinations.detail(slug ?? ""),
    queryFn: () => readEndpoints.destination(slug!),
    // Mapped in `select`, not `queryFn`, matching useReviews — the cached wire
    // payload stays raw so a mapper change re-resolves without a re-fetch.
    select: toDestinationDetail,
    enabled: Boolean(slug),
  });
}
