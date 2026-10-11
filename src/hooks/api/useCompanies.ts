"use client";

/**
 * Company reads.
 *
 * There is no `GET /companies/:id` — the list is small, fully published and
 * comes back in one response, so "fetch one" is "fetch the list and find it".
 * Every hook below therefore shares a single cache entry.
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { readEndpoints } from "@/lib/api/endpoints";
import { toCompanies } from "@/lib/api/mappers";
import { queryKeys } from "@/lib/query/keys";
import { companyCode, type Company } from "@/lib/types";

/**
 * All published companies, ranked by trust score (the server already sorts).
 *
 * There is deliberately **no `placeholderData`**. Seeding this with sample
 * companies made the directory render instantly with plausible names and
 * scores that then silently changed into different ones — a visitor cannot
 * tell a placeholder from an answer. Callers read `isPending` and show a
 * skeleton instead.
 */
export function useCompanies(): UseQueryResult<Company[], Error> {
  return useQuery({
    queryKey: queryKeys.companies.list(),
    queryFn: async () => toCompanies(await readEndpoints.companies()),
  });
}

/**
 * One company by slug, or `undefined` while loading / when it does not exist.
 *
 * A company can be hidden between the list being built and this lookup running,
 * so callers must handle `undefined` rather than assuming a match.
 */
export function useCompany(slug: string | undefined) {
  const query = useCompanies();
  return {
    ...query,
    data: slug ? query.data?.find((c) => c.id === slug) : undefined,
  };
}

/**
 * The API short code (`k`) for a company slug.
 *
 * This is the value every submission and every `?c=` filter needs. Returns
 * `undefined` until the company list resolves, which callers should treat as
 * "not ready yet" — passing `undefined` to the review/question hooks correctly
 * leaves them disabled.
 */
export function useCompanyCode(slug: string | undefined): string | undefined {
  const { data } = useCompany(slug);
  return data ? companyCode(data) : undefined;
}

/**
 * Company display names keyed by short code, for labelling reviews and
 * questions — which reference a company by `c` and are never joined server-side.
 */
export function useCompanyNamesByCode(): Record<string, string> {
  const { data } = useCompanies();
  return Object.fromEntries(
    (data ?? []).map((c) => [companyCode(c).toUpperCase(), c.name])
  );
}
