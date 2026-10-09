"use client";

/**
 * Destination reads.
 *
 * As with companies there is no by-id endpoint: match on `slug` / `id` against
 * the full list, which the server returns sorted by verified-company count.
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { readEndpoints } from "@/lib/api/endpoints";
import { toDestinations } from "@/lib/api/mappers";
import { destinations as staticDestinations } from "@/lib/data/destinations";
import { queryKeys } from "@/lib/query/keys";
import type { Destination } from "@/lib/types";

/** All published destinations, most-covered first. */
export function useDestinations(): UseQueryResult<Destination[], Error> {
  return useQuery({
    queryKey: queryKeys.destinations.list(),
    queryFn: async () => toDestinations(await readEndpoints.destinations()),
    placeholderData: staticDestinations,
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
