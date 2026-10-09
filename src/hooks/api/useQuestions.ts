"use client";

/**
 * Question reads.
 *
 * Returns everything not hidden — both `open` (no reply yet) and `answered`.
 * Newest first, capped at 500. Unanswered questions are public the instant they
 * are posted, and an admin hiding one makes it disappear from this endpoint
 * entirely: a question vanishing between loads is normal, not an error.
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useMemo } from "react";

import { POLL_INTERVAL_MS } from "@/lib/api/config";
import { readEndpoints } from "@/lib/api/endpoints";
import { createCompanyCodeResolver, toQuestions } from "@/lib/api/mappers";
import { queryKeys } from "@/lib/query/keys";
import type { Question } from "@/lib/types";

import { useCompanies } from "./useCompanies";

type UseQuestionsOptions = {
  /** Company short code (`k`). Case-insensitive. Omit for all companies. */
  companyCode?: string;
  poll?: boolean;
  enabled?: boolean;
};

export function useQuestions({
  companyCode,
  poll = false,
  enabled = true,
}: UseQuestionsOptions = {}): UseQueryResult<Question[], Error> {
  const { data: companies } = useCompanies();

  const resolve = useMemo(
    () => createCompanyCodeResolver(companies ?? []),
    [companies]
  );

  return useQuery({
    queryKey: queryKeys.questions.list(companyCode),
    queryFn: () => readEndpoints.questions(companyCode),
    select: (dtos) => toQuestions(dtos, resolve),
    enabled,
    refetchInterval: poll ? POLL_INTERVAL_MS : false,
  });
}

/** Convenience wrapper for a company profile page. Disabled until `code` is known. */
export function useCompanyQuestions(code: string | undefined) {
  return useQuestions({ companyCode: code, enabled: Boolean(code) });
}
