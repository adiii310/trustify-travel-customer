"use client";

/**
 * Package reads.
 *
 * Packages are stored against a company **short code** and a destination slug,
 * both validated on write, so every package the API returns resolves to a real
 * company and a real destination. The server sorts cheapest first — so "what
 * does this cost" is answered by the first row of a filtered list, never by a
 * client-side calculation.
 *
 * Every filter is applied server-side and they combine, which is what keeps a
 * destination page from pulling all 200 packages to show five.
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { readEndpoints, type PackageFilters } from "@/lib/api/endpoints";
import { toPackage, toPackages } from "@/lib/api/mappers";
import { queryKeys } from "@/lib/query/keys";
import type { Package } from "@/lib/types";

export type UsePackagesOptions = PackageFilters & {
  /** Hold the request back until a code or slug resolves. */
  enabled?: boolean;
};

/** Published packages, cheapest first. */
export function usePackages({
  enabled = true,
  ...filters
}: UsePackagesOptions = {}): UseQueryResult<Package[], Error> {
  return useQuery({
    queryKey: queryKeys.packages.list({
      c: filters.companyCode,
      d: filters.destinationSlug,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      nights: filters.nights,
      avail: filters.availability,
    }),
    queryFn: () => readEndpoints.packages(filters),
    select: toPackages,
    enabled,
  });
}

/**
 * One package by id — what a shared `/packages/<id>` or `/book/<id>` link
 * resolves.
 *
 * A 404 here means the package was unpublished or deleted after the link was
 * shared, which both pages report rather than silently showing an empty form.
 */
export function usePackage(
  id: string | undefined
): UseQueryResult<Package, Error> {
  return useQuery({
    // Non-null assertion is safe: `enabled` holds the query until `id` exists.
    queryKey: queryKeys.packages.detail(id ?? ""),
    queryFn: () => readEndpoints.package(id!),
    select: toPackage,
    enabled: Boolean(id),
  });
}

/**
 * The cheapest package in a list, or `undefined` when there are none.
 *
 * The server already sorts ascending, so this is the first row — kept as a
 * named helper because "cheapest" appears on four surfaces and reading it as
 * `list[0]` at each one hides the dependency on that sort.
 */
export const cheapest = (packages: Package[] | undefined): Package | undefined =>
  packages?.[0];
