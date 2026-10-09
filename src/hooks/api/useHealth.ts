"use client";

/**
 * Liveness probe.
 *
 * Useful for a status indicator or for telling "the API is down" apart from
 * "this particular request failed". Does not touch the database, so polling it
 * is cheap — but it is still a request, so keep the interval sane.
 */

import { useQuery } from "@tanstack/react-query";

import { readEndpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/keys";

export function useHealth(options: { poll?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.health(),
    queryFn: readEndpoints.health,
    // The only ISO timestamp in the public API, so there is nothing to map.
    staleTime: 30_000,
    refetchInterval: options.poll ? 60_000 : false,
  });
}

/**
 * True when the API has answered successfully at least once.
 *
 * Deliberately not "false while loading" — that would flash an offline banner
 * on every cold start.
 */
export function useIsApiReachable(): boolean | null {
  const { data, isError, isPending } = useHealth();
  if (isPending) return null;
  if (isError) return false;
  return data?.ok ?? false;
}
