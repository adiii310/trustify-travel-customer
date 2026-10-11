/**
 * Server state — TanStack Query.
 *
 * One hook per thing the API serves. Components call these; they never call
 * `@/lib/api` directly, so caching, invalidation and the wire→domain mapping
 * all stay in one place.
 *
 *   Reads        useCompanies, useDestinations, usePackages, useReviews,
 *                useQuestions, useMetrics, useSiteContent, useSiteSettings,
 *                useHealth
 *   Account      useRegister, useLogin, useSignOut, useSession,
 *                useUpdateProfile, useChangePassword
 *   Bookings     useMyBookings, useMyBooking, useRequestBooking
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
export {
  useDestination,
  useDestinationDetail,
  useDestinations,
  type DestinationDetail,
} from "./useDestinations";
export { useHealth, useIsApiReachable } from "./useHealth";
export {
  useChangePassword,
  useLogin,
  useMyBooking,
  useMyBookings,
  useRegister,
  useRequestBooking,
  useSession,
  useSignOut,
  useUpdateProfile,
} from "./useAccount";
export { useMetrics } from "./useMetrics";
export { cheapest, usePackage, usePackages } from "./usePackages";
export {
  useSiteContent,
  useSiteSettings,
  type SiteContent,
} from "./useSiteContent";
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
