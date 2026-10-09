/**
 * Wire types — a 1:1 TypeScript mirror of every shape in `api.md`.
 *
 * These are deliberately *not* the types the UI renders. They keep the API's
 * terse field names (`k`, `c`, `n`, `r`, `t`, `q`, `a`, `d`, `ts`) exactly as
 * the server sends them so that a change on the backend shows up here as a
 * compile error rather than as a silent `undefined` three layers down.
 *
 * `src/lib/api/mappers.ts` converts these into the friendly domain types in
 * `src/lib/types.ts` that components actually consume.
 */

/* ------------------------------------------------------------------ *
 * Response envelope (api.md §2)
 * ------------------------------------------------------------------ */

/** One field-level validation failure, used to highlight a specific input. */
export type ApiFieldError = {
  field: string;
  message: string;
};

export type ApiSuccess<T> = {
  success: true;
  statusCode: number;
  /** Human-readable and always safe to show the user as-is. */
  message: string;
  data: T;
};

export type ApiFailure = {
  success: false;
  statusCode: number;
  message: string;
  /** Always present — an empty array when no specific field was at fault. */
  errors: ApiFieldError[];
};

/**
 * Every endpoint returns this, success or failure. Branch on `success` or the
 * HTTP status — never on the shape of `data`.
 */
export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

/* ------------------------------------------------------------------ *
 * Read payloads (api.md §4)
 * ------------------------------------------------------------------ */

/** `GET /health` — the only ISO timestamp in the public API. */
export type ApiHealth = {
  ok: boolean;
  time: string;
};

/** `GET /companies` — published companies, sorted by `score` descending. */
export type ApiCompany = {
  _id: string;
  /** Short code / logo letter. This is the join key for reviews + questions. */
  k: string;
  name: string;
  /** Trust score 0-100. Drives the server-side sort. */
  score: number;
  /** 0-5. */
  rating: number;
  /** Number of destinations covered. */
  dests: number;
  /** Verified-since label, e.g. `"Jan 2023"` — display text, not a date. */
  since: string;
  city: string;
  /** Years in business. */
  exp: number;
  /** 3N/4D price per person in INR. A display figure, not a live quote. */
  price: number;
  /** Display review count stored on the company — NOT a live count. */
  reviews: number;
  tags: string[];
  /**
   * Picked by an admin for the homepage "Top Rated Companies" strip.
   *
   * **May be absent**, not `false`: records created before curation existed
   * have no such key, and the backend reads lists with `.lean()`, which does
   * not apply schema defaults to stored documents. Always read it with `??`.
   */
  featured?: boolean;
  /** Position in that strip, ascending. Absent on pre-curation records. */
  featuredRank?: number;
  status: "published";
  /** Created at, epoch milliseconds. */
  ts: number;
};

/**
 * `GET /destinations` — published destinations, sorted by `n` descending.
 *
 * `best`, `diff`, `dur` and `budget` have no server-side defaults and may be
 * **absent entirely** rather than `null`, hence the optional markers.
 */
export type ApiDestination = {
  _id: string;
  slug: string;
  /** Mirror of `slug`. Link by this. */
  id: string;
  name: string;
  region: string;
  /** Verified companies covering this destination. */
  n: number;
  rating: number;
  desc: string;
  /** Card gradient start colour. */
  c1: string;
  /** Card gradient end colour. */
  c2: string;
  /** Picked for the homepage grid. **May be absent** — see `ApiCompany`. */
  featured?: boolean;
  /** Position in that grid, ascending. Absent on pre-curation records. */
  featuredRank?: number;
  status: "published";
  ts: number;
  /** Best season, e.g. `"May - Oct"`. */
  best?: string;
  /** Difficulty, e.g. `"Moderate"`. */
  diff?: string;
  /** Typical duration, e.g. `"3N/4D"`. */
  dur?: string;
  /** Typical budget range, e.g. `"₹10,000 - ₹15,000"`. */
  budget?: string;
};

/** `GET /reviews` — approved only, newest first, capped at 500. */
export type ApiReview = {
  _id: string;
  /** Company short code. */
  c: string;
  /** Reviewer name. */
  n: string;
  /** Rating 1-5. */
  r: number;
  /** Package name. May be an empty string. */
  trip: string;
  /** Review text. */
  t: string;
  /** Free-text display date, e.g. `"Sep 2024"`. NOT parseable — sort by `ts`. */
  d: string;
  status: "approved";
  ts: number;
};

/** `GET /questions` — non-hidden questions (open + answered), newest first. */
export type ApiQuestion = {
  _id: string;
  /** Company short code. Not validated on write — orphan codes are possible. */
  c: string;
  /** Asker name. */
  n: string;
  /** The question. */
  q: string;
  /** The answer — an empty string until a company replies. */
  a: string;
  status: ApiQuestionStatus;
  ts: number;
};

export type ApiQuestionStatus = "open" | "answered";

/**
 * `GET /metrics` — the admin-managed headline figures in the homepage hero
 * strip, published only, sorted by `order` ascending.
 *
 * Unlike every other public list this one is **not** newest-first: it is a
 * fixed strip of positional slots, not a feed.
 */
export type ApiMetric = {
  _id: string;
  /** Emoji. May be an empty string. */
  icon: string;
  /**
   * Display **text**, not a number — `"450+"`, `"50,000+"`.
   *
   * Admin-entered and deliberately not a live count of anything. Render it
   * verbatim; do not parse it or reconcile it against the other endpoints.
   */
  value: string;
  /** e.g. `"Verified Companies"`. */
  label: string;
  /** Position, ascending. */
  order: number;
  status: "published";
  ts: number;
};

/* ------------------------------------------------------------------ *
 * Submission payloads (api.md §5)
 *
 * The server accepts ONLY the fields listed for each endpoint; anything else
 * in the body is dropped silently. These types encode exactly that whitelist.
 * ------------------------------------------------------------------ */

/** `POST /enquiries` — a trip enquiry. */
export type EnquiryPayload = {
  /** Required. Max 80 chars. */
  name: string;
  /** Required. Max 20 chars. Length-capped but NOT format-validated. */
  phone: string;
  /** Preferred travel date. Free text or `YYYY-MM-DD`; stored as given. */
  date?: string;
  /** Travellers, 0-500. */
  pax?: number;
  /** Message, max 2000 chars. */
  msg?: string;
  /** Company name the enquiry is about. */
  company?: string;
  /** Company short code — send this so the lead can be attributed. */
  ck?: string;
  /** Package name the enquiry came from. */
  pkg?: string;
};

/**
 * Preferred callback window.
 *
 * Send `""` (or omit the field) for "no preference" — **never `null`**, which
 * bypasses enum validation and is stored verbatim as a third empty value.
 */
export type CallbackSlot = "Morning" | "Afternoon" | "Evening" | "";

/** `POST /callbacks` — request a call back. */
export type CallbackPayload = {
  /** Required. Max 80. */
  name: string;
  /** Required. Max 20. */
  phone: string;
  slot?: CallbackSlot;
};

/** `POST /applications` — a travel company applies to get verified. */
export type ApplicationPayload = {
  /** Required. Trading name, max 120. */
  company: string;
  /** Required. Contact person, max 80. */
  contact: string;
  /** Required. Must look like an email. Stored lower-cased. */
  email: string;
  /** Required. Max 20. */
  phone: string;
  city?: string;
  /** Years in business, 0 or more. */
  years?: number;
};

/** `POST /questions` — ask a company a question. */
export type QuestionPayload = {
  /** Required. Company short code, case-insensitive. NOT validated server-side. */
  c: string;
  /** Required. Asker name, max 80. */
  n: string;
  /** Required. Question, max 1000. */
  q: string;
};

/** `POST /reviews` — submit a review. */
export type ReviewPayload = {
  /** Required. Company short code. **Validated** against the company list. */
  c: string;
  /** Required. Reviewer name, max 80. */
  n: string;
  /** Required. Rating 1-5 — `0` and `6` are rejected. */
  r: number;
  /** Required. Review text, max 2000. */
  t: string;
  /** Package name, max 120. */
  trip?: string;
  /** Display date, e.g. `"Sep 2024"`. */
  d?: string;
};

/** `POST /members` — traveller sign-in / sign-up (identity capture only). */
export type MemberPayload = {
  /** Required. Max 80. */
  name: string;
  /** Required. Must look like an email. Stored lower-cased and trimmed. */
  email: string;
};

/* ------------------------------------------------------------------ *
 * Submission results
 * ------------------------------------------------------------------ */

/** Shared shape of the four fixed-status submission responses. */
export type SubmissionResult<TStatus extends string = string> = {
  _id: string;
  status: TStatus;
};

export type EnquiryResult = SubmissionResult<"new">;
export type CallbackResult = SubmissionResult<"new">;
export type ApplicationResult = SubmissionResult<"active">;
export type QuestionResult = SubmissionResult<"open">;

/**
 * A review lands either in the moderation queue or straight on the site,
 * depending on the server's `REVIEW_AUTO_APPROVE` setting. Always branch on
 * the returned `status` — the same frontend build must handle both.
 */
export type ReviewResult = SubmissionResult<"pending" | "approved">;

/**
 * `POST /members` always returns 201, for both new and returning travellers,
 * and grants no token. There is no way to tell a sign-up from a sign-in.
 */
export type MemberResult = {
  _id: string;
  name: string;
  email: string;
};

/* ------------------------------------------------------------------ *
 * Rate limiting (api.md §5)
 * ------------------------------------------------------------------ */

/** Parsed `RateLimit-*` headers returned on every submission response. */
export type RateLimitSnapshot = {
  /** Ceiling for the window, e.g. 20. */
  limit: number;
  /** Submissions still available in this window. */
  remaining: number;
  /** Seconds until the window resets. */
  resetSeconds: number;
  /** When this snapshot was taken, epoch ms — used to age it out. */
  readAt: number;
};
