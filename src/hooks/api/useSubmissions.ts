"use client";

/**
 * The six submission endpoints, as mutations.
 *
 * Shared rules, enforced here rather than repeated in every form:
 *
 *  - **Never retried.** Each one writes a record, and all six draw on a single
 *    budget of 20 per IP per 10 minutes. A silent retry would both duplicate
 *    the row and spend two of the twenty. (Set globally in `queryClient.ts`.)
 *  - **Invalidate what the write changed**, and only that. Posting a question
 *    makes it public immediately, so the question list is refetched; a review
 *    held for moderation is not yet visible, so nothing is.
 *  - **Errors surface as `ApiError`**, carrying `.status`, `.fieldErrors` and
 *    `.rateLimited`. Forms branch on those — see `DialogProvider`.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { writeEndpoints } from "@/lib/api/endpoints";
import type { ApiError } from "@/lib/api/errors";
import type {
  ApplicationPayload,
  ApplicationResult,
  CallbackPayload,
  CallbackResult,
  EnquiryPayload,
  EnquiryResult,
  MemberPayload,
  MemberResult,
  QuestionPayload,
  QuestionResult,
  ReviewPayload,
  ReviewResult,
} from "@/lib/api/types";
import { queryKeys } from "@/lib/query/keys";
import { useAccountStore } from "@/store/accountStore";

/* ------------------------------------------------------------------ *
 * Leads — nothing public changes, so nothing is invalidated
 * ------------------------------------------------------------------ */

/** `POST /enquiries`. Pass `ck` (the company short code) to attribute the lead. */
export function useSubmitEnquiry() {
  return useMutation<EnquiryResult, ApiError, EnquiryPayload>({
    mutationFn: writeEndpoints.submitEnquiry,
  });
}

/**
 * `POST /callbacks`.
 *
 * For "no preference" send `slot: ""` or omit it — never `null`, which slips
 * past the enum validation and is stored as a third empty value.
 */
export function useRequestCallback() {
  return useMutation<CallbackResult, ApiError, CallbackPayload>({
    mutationFn: writeEndpoints.requestCallback,
  });
}

/**
 * `POST /applications`.
 *
 * The applicant then moves through eight verification stages that the public
 * API cannot read. There is no "check my application status" endpoint — tell
 * applicants they will be contacted.
 */
export function useSubmitApplication() {
  return useMutation<ApplicationResult, ApiError, ApplicationPayload>({
    mutationFn: writeEndpoints.submitApplication,
  });
}

/* ------------------------------------------------------------------ *
 * Public content — these writes change what other visitors see
 * ------------------------------------------------------------------ */

/**
 * `POST /questions`.
 *
 * Posted questions are public immediately, before any admin sees them, so the
 * list is refetched unconditionally and the new entry will already be in it
 * with an empty answer.
 *
 * Note that `c` is **not** validated against the company list: a wrong code
 * silently creates a question attached to a company that does not exist. Always
 * source it from `useCompanyCode()` rather than from user input.
 */
export function useAskQuestion() {
  const queryClient = useQueryClient();

  return useMutation<QuestionResult, ApiError, QuestionPayload>({
    mutationFn: writeEndpoints.askQuestion,
    onSuccess: () => {
      // The key prefix covers both the company-scoped list and the
      // all-companies list, so one call refreshes everything affected.
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.all() });
    },
  });
}

/**
 * `POST /reviews`.
 *
 * Returns `status: "approved"` or `"pending"` depending on the server's
 * `REVIEW_AUTO_APPROVE` setting — the same frontend build has to handle both,
 * so always branch on the response:
 *
 * ```ts
 * const { status } = await submitReview.mutateAsync(payload);
 * toast(status === "approved"
 *   ? "Thanks! Your review is live."
 *   : "Thanks! Your review will appear once our team checks it.");
 * ```
 *
 * `c` **is** validated here — an unknown code returns `400 "Pick a company to
 * review."`, which is why the picker is populated from `GET /companies` and
 * sends `k` rather than letting anyone type a code.
 */
export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation<ReviewResult, ApiError, ReviewPayload>({
    mutationFn: writeEndpoints.submitReview,
    onSuccess: (result) => {
      // A pending review is not visible to anyone yet, so refetching would only
      // re-download the identical list.
      if (result.status === "approved") {
        queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all() });
      }
    },
  });
}

/* ------------------------------------------------------------------ *
 * Identity capture
 * ------------------------------------------------------------------ */

/**
 * `POST /members` — sign in / sign up.
 *
 * This is **not** authentication. It is an idempotent upsert keyed on email
 * that always returns 201, issues no token and grants no access; there is no
 * way to tell a new traveller from a returning one, and nothing in the public
 * API is personalised.
 *
 * **Superseded by `useRegister` / `useLogin` for signing in.** This endpoint
 * and its behaviour are unchanged and still documented, but it issues no token,
 * so the account it records cannot read bookings — `useIsSignedIn` keys off the
 * token, not off this. It survives as prefill capture for the public forms.
 */
export function useSignIn() {
  const setAccount = useAccountStore((s) => s.setAccount);

  return useMutation<MemberResult, ApiError, MemberPayload & { phone?: string }>({
    mutationFn: ({ name, email }) => writeEndpoints.signIn({ name, email }),
    onSuccess: (result, variables) => {
      setAccount({
        id: result._id,
        // The server lower-cases and trims the email, so prefer its copy.
        name: result.name,
        email: result.email,
        phone: variables.phone || undefined,
      });
    },
  });
}
