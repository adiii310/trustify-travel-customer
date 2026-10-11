/**
 * Every public endpoint in `api.md`, as one typed function each.
 *
 * This is the only module that knows the URL paths. Hooks call these; nothing
 * calls `fetch` directly. Each function returns the **raw wire payload** —
 * mapping to domain types happens in `mappers.ts` so that callers which want
 * the untouched record (debug screens, admin tooling) can still get it.
 */

import { authGet, authPatch, authPost, get, post } from "./client";
import type {
  ApiAvailability,
  ApiBooking,
  ApiMember,
  ApiSession,
  BookingPayload,
  LoginPayload,
  RegisterPayload,
  ApiCompany,
  ApiContent,
  ApiDestination,
  ApiDestinationDetail,
  ApiHealth,
  ApiPackage,
  ApiSettings,
  ApiMetric,
  ApiQuestion,
  ApiReview,
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
} from "./types";

/* ------------------------------------------------------------------ *
 * Reads — unauthenticated, unpaged, not rate limited (api.md §4)
 * ------------------------------------------------------------------ */

/** Server-side filters for `GET /packages`. All optional, all combinable. */
export type PackageFilters = {
  /** Company short code (`k`). */
  companyCode?: string;
  /** Destination slug. */
  destinationSlug?: string;
  /** Per person, inclusive. */
  minPrice?: number;
  /** Per person, inclusive. */
  maxPrice?: number;
  /** Exact nights. */
  nights?: number;
  availability?: ApiAvailability;
};

export const readEndpoints = {
  /** Liveness probe. Does not touch the database. */
  health: () => get<ApiHealth>("/health"),

  /** Published companies, already sorted by trust score descending. */
  companies: () => get<ApiCompany[]>("/companies"),

  /** Published destinations, already sorted by company count descending. */
  destinations: () => get<ApiDestination[]>("/destinations"),

  /**
   * One destination plus the published companies covering it.
   *
   * @param slug The destination's `slug` / `id` (`"kedarnath"`), not its `_id`.
   * @throws {ApiError} 404 when the slug is unknown or the destination is hidden.
   */
  destination: (slug: string) =>
    get<ApiDestinationDetail>(`/destinations/${encodeURIComponent(slug)}`),

  /**
   * Approved reviews, newest first, capped at 500.
   * @param companyCode Company short code (`k`). Case-insensitive. Omit for all.
   */
  reviews: (companyCode?: string) =>
    get<ApiReview[]>("/reviews", { c: companyCode }),

  /**
   * Non-hidden questions — both `open` and `answered` — newest first, max 500.
   * @param companyCode Company short code (`k`). Case-insensitive. Omit for all.
   */
  questions: (companyCode?: string) =>
    get<ApiQuestion[]>("/questions", { c: companyCode }),

  /**
   * Homepage hero figures, already ordered. Admin-managed, so the count is not
   * fixed — render whatever arrives and keep a local fallback for an empty list.
   */
  metrics: () => get<ApiMetric[]>("/metrics"),

  /**
   * Published packages, cheapest first, capped at 200.
   *
   * Every filter is applied server-side and they combine, so a destination
   * page narrows by price and duration without pulling the whole list.
   */
  packages: (filters: PackageFilters = {}) =>
    get<ApiPackage[]>("/packages", {
      c: filters.companyCode,
      d: filters.destinationSlug,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      nights: filters.nights,
      avail: filters.availability,
    }),

  /**
   * One package by `_id` — what a shared booking link resolves.
   * @throws {ApiError} 404 when unknown or unpublished.
   */
  package: (id: string) => get<ApiPackage>(`/packages/${encodeURIComponent(id)}`),

  /**
   * Every editable site content list, grouped and already ordered: homepage
   * trust badges, verification steps, the resources FAQ, the trust-parameter
   * names and the trip-planner interests.
   */
  content: () => get<ApiContent>("/content"),

  /** Site-wide settings as a flat `{ key: value }` map. Always complete. */
  settings: () => get<ApiSettings>("/settings"),
} as const;

/* ------------------------------------------------------------------ *
 * Submissions — all six share ONE budget of 20 per IP per 10 minutes
 * (api.md §5). Burning one here reduces the allowance for all the others.
 * ------------------------------------------------------------------ */

export const writeEndpoints = {
  /** Trip enquiry. Send `ck` so the lead can be attributed to a company. */
  submitEnquiry: (payload: EnquiryPayload) =>
    post<EnquiryResult>("/enquiries", payload),

  /** Call-back request. Send `slot: ""` for no preference, never `null`. */
  requestCallback: (payload: CallbackPayload) =>
    post<CallbackResult>("/callbacks", payload),

  /** A travel company applying for verification. No status endpoint exists. */
  submitApplication: (payload: ApplicationPayload) =>
    post<ApplicationResult>("/applications", payload),

  /**
   * Ask a company a question. Public immediately, before any admin sees it —
   * refetch the list afterwards and the new entry is already there.
   * `c` is NOT validated, so a typo silently creates an orphan question.
   */
  askQuestion: (payload: QuestionPayload) =>
    post<QuestionResult>("/questions", payload),

  /**
   * Submit a review. `c` IS validated against the company list — an unknown
   * code is a 400. Branch on the returned `status`: it is `"approved"` or
   * `"pending"` depending on the server's moderation setting.
   */
  submitReview: (payload: ReviewPayload) =>
    post<ReviewResult>("/reviews", payload),

  /**
   * Traveller sign-in / sign-up. Identity capture only: an idempotent upsert
   * keyed on email that always returns 201, issues no token and grants no
   * access. Treat it as a newsletter-style capture.
   */
  signIn: (payload: MemberPayload) => post<MemberResult>("/members", payload),
} as const;

/* ------------------------------------------------------------------ *
 * Customer account and bookings (api.md §6)
 *
 * The only authenticated endpoints on this site. Every one of them carries the
 * bearer token set by `accountStore`, and the server derives the customer from
 * that token — a member id in a request body is never read.
 * ------------------------------------------------------------------ */

export const accountEndpoints = {
  /**
   * Create an account. Returns a token, so there is no second sign-in step.
   *
   * An email already captured by `signIn` (the passwordless identity endpoint)
   * is **upgraded** rather than rejected: it is the same traveller, and they
   * have never set a password.
   */
  register: (payload: RegisterPayload) =>
    post<ApiSession>("/auth/customer/register", payload),

  /** `identifier` is an email, a username or a phone number. */
  login: (payload: LoginPayload) => post<ApiSession>("/auth/customer/login", payload),

  /** Whose token this is. Used to revalidate a restored session on boot. */
  me: () => authGet<{ member: ApiMember }>("/auth/customer/me"),

  /** `email` is deliberately not updatable — it is the registration key. */
  updateProfile: (payload: Partial<Pick<ApiMember, "name" | "phone" | "username">>) =>
    authPatch<{ member: ApiMember }>("/auth/customer/me", payload),

  /** Proves the current password, and reissues the token on success. */
  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    authPost<ApiSession>("/auth/customer/password", payload),
} as const;

export const bookingEndpoints = {
  /**
   * Submit a booking request. Always lands as `pending`, never confirmed, and
   * takes no payment. The server prices it from the package.
   */
  request: (payload: BookingPayload) => authPost<ApiBooking>("/bookings", payload),

  /** The signed-in traveller's own bookings, newest first. */
  mine: (status?: string) => authGet<ApiBooking[]>("/bookings", { status }),

  /** One of their own. Another customer's booking is a 404, not a 403. */
  one: (id: string) => authGet<ApiBooking>(`/bookings/${encodeURIComponent(id)}`),
} as const;

/** Flat facade over both groups, mirroring the drop-in client in api.md §3. */
export const api = {
  ...readEndpoints,
  ...writeEndpoints,
} as const;
