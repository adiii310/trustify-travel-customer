"use client";

/**
 * Review reads.
 *
 * Only approved reviews are ever returned, newest first, capped at 500 with no
 * paging and no `total`. The single server-side filter is `?c=<short code>`;
 * rating filters and sorting are the client's job.
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useMemo } from "react";

import { LIST_CAP, POLL_INTERVAL_MS } from "@/lib/api/config";
import { readEndpoints } from "@/lib/api/endpoints";
import { createCompanyCodeResolver, toReviews } from "@/lib/api/mappers";
import { queryKeys } from "@/lib/query/keys";
import type { Review } from "@/lib/types";

import { useCompanies } from "./useCompanies";

type UseReviewsOptions = {
  /**
   * Company short code (`k`). Case-insensitive. Omit for reviews across every
   * company.
   */
  companyCode?: string;
  /**
   * Re-fetch every 30s. Off by default — reads are unlimited but this content
   * changes at moderation speed, so polling is only worth it on a page the
   * visitor sits on.
   */
  poll?: boolean;
  /** Set false to hold the request back, e.g. until a company code resolves. */
  enabled?: boolean;
};

/**
 * Approved reviews, mapped to the domain model.
 *
 * Reviews carry a company *code*, not a slug, and the API performs no join —
 * so the company list is read from cache to resolve each one to a profile URL.
 * A code with no matching company is expected (a company can be hidden while
 * its reviews stay live) and falls back to the raw code rather than vanishing.
 */
export function useReviews({
  companyCode,
  poll = false,
  enabled = true,
}: UseReviewsOptions = {}): UseQueryResult<Review[], Error> {
  const { data: companies } = useCompanies();

  // Rebuilt only when the company list actually changes, so the mapping below
  // is not redone on every render.
  const resolve = useMemo(
    () => createCompanyCodeResolver(companies ?? []),
    [companies]
  );

  return useQuery({
    queryKey: queryKeys.reviews.list(companyCode),
    queryFn: () => readEndpoints.reviews(companyCode),
    // Mapping lives in `select` rather than `queryFn` so that changing the
    // company list re-resolves cached reviews without re-fetching them.
    select: (dtos) => toReviews(dtos, resolve),
    enabled,
    refetchInterval: poll ? POLL_INTERVAL_MS : false,
  });
}

/** Convenience wrapper for a company profile page. Disabled until `code` is known. */
export function useCompanyReviews(code: string | undefined) {
  return useReviews({ companyCode: code, enabled: Boolean(code) });
}

/**
 * Whether a list has hit the server's hard cap, meaning older records exist but
 * are unreachable — there is no paging to fetch them with.
 */
export const isListCapped = (list: readonly unknown[] | undefined): boolean =>
  (list?.length ?? 0) >= LIST_CAP;
