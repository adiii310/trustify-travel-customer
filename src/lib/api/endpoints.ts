/**
 * Every public endpoint in `api.md`, as one typed function each.
 *
 * This is the only module that knows the URL paths. Hooks call these; nothing
 * calls `fetch` directly. Each function returns the **raw wire payload** —
 * mapping to domain types happens in `mappers.ts` so that callers which want
 * the untouched record (debug screens, admin tooling) can still get it.
 */

import { get, post } from "./client";
import type {
  ApiCompany,
  ApiDestination,
  ApiHealth,
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

export const readEndpoints = {
  /** Liveness probe. Does not touch the database. */
  health: () => get<ApiHealth>("/health"),

  /** Published companies, already sorted by trust score descending. */
  companies: () => get<ApiCompany[]>("/companies"),

  /** Published destinations, already sorted by company count descending. */
  destinations: () => get<ApiDestination[]>("/destinations"),

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

/** Flat facade over both groups, mirroring the drop-in client in api.md §3. */
export const api = {
  ...readEndpoints,
  ...writeEndpoints,
} as const;
