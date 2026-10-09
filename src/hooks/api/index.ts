/**
 * Server state — TanStack Query.
 *
 * One hook per thing the API serves. Components call these; they never call
 * `@/lib/api` directly, so caching, invalidation and the wire→domain mapping
 * all stay in one place.
 *
 *   Reads        useCompanies, useDestinations, useReviews, useQuestions, useHealth
 *   Submissions  useSubmitEnquiry, useRequestCallback, useSubmitApplication,
 *                useAskQuestion, useSubmitReview, useSignIn
 *
 * See `src/store` for the other half of the split — state the device owns.
 */

export {
  useCompanies,
  useCompany,
  useCompanyCode,
  useCompanyNamesByCode,
} from "./useCompanies";
export { useDestination, useDestinations } from "./useDestinations";
export { useHealth, useIsApiReachable } from "./useHealth";
export { useCompanyQuestions, useQuestions } from "./useQuestions";
export { isListCapped, useCompanyReviews, useReviews } from "./useReviews";
export {
  useAskQuestion,
  useRequestCallback,
  useSignIn,
  useSubmitApplication,
  useSubmitEnquiry,
  useSubmitReview,
} from "./useSubmissions";
