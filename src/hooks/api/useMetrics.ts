"use client";

/**
 * Homepage hero figures.
 *
 * Fully admin-managed: the count is not fixed, the values are display text, and
 * an empty response is a normal state that the component covers with its own
 * default copy rather than rendering an empty strip.
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { readEndpoints } from "@/lib/api/endpoints";
import { toMetrics } from "@/lib/api/mappers";
import { queryKeys } from "@/lib/query/keys";
import type { Metric } from "@/lib/types";

export function useMetrics(): UseQueryResult<Metric[], Error> {
  return useQuery({
    queryKey: queryKeys.metrics.list(),
    queryFn: readEndpoints.metrics,
    // Mapped in `select` so the cached wire payload stays untouched.
    select: toMetrics,
  });
}
