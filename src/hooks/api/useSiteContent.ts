"use client";

/**
 * Site-wide content and settings.
 *
 * Both are small, change rarely and are needed on almost every page, so they
 * get a long `staleTime` and share one cache entry each. Neither has a
 * fallback: a list the admin has not filled in comes back empty and its
 * section is hidden, which is the point of reading them from the API at all.
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { readEndpoints } from "@/lib/api/endpoints";
import { toContent, toSettings } from "@/lib/api/mappers";
import { queryKeys } from "@/lib/query/keys";
import type { ContentItem, SiteSettings } from "@/lib/types";

/** Editorial content changes at human editing speed; an hour is plenty. */
const CONTENT_STALE_MS = 60 * 60_000;

export type SiteContent = {
  /** Homepage trust strip. */
  badges: ContentItem[];
  /** The verification steps, shown on the homepage, /about and /become-verified. */
  steps: ContentItem[];
  /** The /resources FAQ — `title` is the question, `body` the answer. */
  resources: ContentItem[];
  /** The trust-parameter names listed on /about. */
  trustParameters: ContentItem[];
  /** Interest chips in the trip planner. */
  interests: ContentItem[];
};

/**
 * Every content list in one request.
 *
 * Grouped server-side, so the homepage's badges and steps arrive together
 * rather than as two round trips. Every group is always present — empty when
 * it has no published rows.
 */
export function useSiteContent(): UseQueryResult<SiteContent, Error> {
  return useQuery({
    queryKey: queryKeys.content(),
    queryFn: () => readEndpoints.content(),
    select: toContent,
    staleTime: CONTENT_STALE_MS,
  });
}

/**
 * Site name, tagline and WhatsApp details.
 *
 * The server fills in any key that has never been saved from its own defaults,
 * so the response is always complete. A key present but empty is an admin
 * clearing it deliberately — render nothing rather than substituting.
 */
export function useSiteSettings(): UseQueryResult<SiteSettings, Error> {
  return useQuery({
    queryKey: queryKeys.settings(),
    queryFn: () => readEndpoints.settings(),
    select: toSettings,
    staleTime: CONTENT_STALE_MS,
  });
}
