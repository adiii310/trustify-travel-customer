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
   * Profile copy. **May be absent or `""`** on a company nobody has written
   * one for; the site hides the section rather than inventing a sentence.
   */
  about?: string;
  /**
   * Per-parameter trust scores behind the headline `score`.
   *
   * Any length — the server stores whatever an admin entered, so never assume
   * nine. Absent or empty means the breakdown has not been filled in, and the
   * panel is hidden; it is NOT a cue to spread `score` across invented rows.
   */
  breakdown?: ApiTrustParameter[];
  /** Verified document names. Absent or empty hides the tab. */
  docs?: string[];
  /** Booking terms, as label/value pairs. Absent or empty hides the tab. */
  policies?: ApiPolicy[];
  /** Hosted gallery image URLs. Absent or empty hides the tab. */
  photos?: string[];
  /**
   * Destination slugs this company runs trips to, lower-cased.
   *
   * This — not `dests` — is the company→destination link. `dests` is a headline
   * number an admin types in; `places` is the list the server filters on, and
   * nothing derives one from the other.
   *
   * **May be absent**, for the same reason as `featured` below. Read it as
   * `?? []`.
   */
  places?: string[];
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

export type ApiTrustParameter = {
  label: string;
  /** 0-100. */
  score: number;
};

export type ApiPolicy = {
  label: string;
  value: string;
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
  /**
   * Optional cover photo, as a hosted URL.
   *
   * `""` and a missing key both mean "no photo" — the gradient above is the
   * fallback and must stay behind the image rather than being replaced by it.
   * Authored as 3:2 landscape, served at most 1600px on the longest edge.
   */
  img?: string;
  /**
   * What there is to see. **May be absent** on a destination nobody has filled
   * in; the panel is hidden rather than populated from anywhere else.
   */
  highlights?: string[];
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

/**
 * `GET /destinations/:slug` — one published destination plus the published
 * companies covering it. The only public read that joins two collections.
 *
 * An unknown or hidden slug is a 404, which the client surfaces as an
 * `ApiError`, not as an empty result.
 */
export type ApiDestinationDetail = ApiDestination & {
  /**
   * Companies whose `places` contains this slug, sorted by `score` descending.
   *
   * **Legitimately empty** when no verified company sells the destination yet —
   * that is a state to render, not an error. Note it is unrelated to `n`, which
   * is the admin-entered headline figure and is never reconciled against this.
   */
  companies: ApiCompany[];
};

/** One day of a package itinerary. */
export type ApiItineraryDay = {
  /** 1-based. */
  day: number;
  title: string;
  /** May be an empty string. */
  detail: string;
};

/**
 * `GET /packages?c=&d=` — published packages, **cheapest first**.
 *
 * Also `GET /packages/:id` for a single one, which is the only public read
 * keyed on an `_id`: a booking link has to survive being shared and a package
 * has no other stable handle.
 */
export type ApiPackage = {
  _id: string;
  /** Company short code. Always resolves — validated on write. */
  c: string;
  /** Destination slug. Always resolves — validated on write. */
  d: string;
  title: string;
  /** One-line pitch. **May be absent or `""`.** */
  desc?: string;
  nights: number;
  days: number;
  /** Per person, INR. Drives the server-side sort. */
  price: number;
  inclusions: string[];
  exclusions: string[];
  itinerary: ApiItineraryDay[];
  /**
   * The same itinerary as a downloadable PDF. **May be absent or `""`.**
   *
   * Independent of `itinerary` above: a package may have the day-by-day list,
   * the document, both or neither. Show whichever arrived.
   */
  pdf?: string;
  /** Cover photo URL. **May be absent** — fall back to the destination's own. */
  img?: string;
  /**
   * Whether it can be booked right now — **not** whether it is listed.
   * A `soldout` package is still published and still comparable.
   * **May be absent** on records saved before the field existed.
   */
  avail?: ApiAvailability;
  status: "published";
  ts: number;
};

export type ApiAvailability = "open" | "limited" | "soldout";

/** One entry in an editable site content list. */
export type ApiContentItem = {
  _id: string;
  group: ApiContentGroup;
  /** Emoji. May be an empty string. */
  icon: string;
  /** Badge label, step title, FAQ question, parameter name or interest. */
  title: string;
  /** Step detail or FAQ answer. Empty for the title-only groups. */
  body: string;
  order: number;
  status: "published";
  ts: number;
};

export type ApiContentGroup =
  | "badge"
  | "step"
  | "resource"
  | "parameter"
  | "interest";

/**
 * `GET /content` — every published content list, **grouped**, each already in
 * display order.
 *
 * One request rather than five: the homepage alone needs `badge` and `step`.
 * Every group is always present, as an empty array when it has no rows, so no
 * caller has to guard a missing key.
 */
export type ApiContent = Record<ApiContentGroup, ApiContentItem[]>;

/**
 * `GET /settings` — site-wide values as a flat map.
 *
 * The server fills in every declared key from its own defaults, so this is
 * always complete. A key present with an empty string is an admin clearing it
 * deliberately — render nothing, do not substitute.
 */
export type ApiSettings = Record<string, string>;

/* ------------------------------------------------------------------ *
 * Customer accounts and bookings (api.md §6)
 *
 * Everything below needs a customer bearer token. These are the only
 * authenticated endpoints on the customer site.
 * ------------------------------------------------------------------ */

/** The only shape of an account the API returns. Never carries a hash. */
export type ApiMember = {
  _id: string;
  name: string;
  email: string;
  /** `""` when the traveller never chose one. */
  username: string;
  phone: string;
  ts: number;
};

/** `POST /auth/customer/register` and `/login`. */
export type ApiSession = {
  token: string;
  member: ApiMember;
};

export type ApiBookingStatus =
  | "pending"
  | "contacted"
  | "awaiting_payment"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "rejected";

export type ApiPaymentStatus =
  | "not_required"
  | "unpaid"
  | "partially_paid"
  | "paid"
  | "refunded";

/** What the package cost and said at the moment of booking. */
export type ApiBookingSnapshot = {
  title: string;
  /** Per person, at booking time — not the package's price today. */
  price: number;
  nights: number;
  days: number;
  destName: string;
  companyName: string;
};

/**
 * `GET /bookings`, `GET /bookings/:id`, `POST /bookings`.
 *
 * This is the **customer projection**, which is narrower than the record the
 * admin API returns. `notes` (internal), `history`, `assignee` and the
 * individual `payments` are deliberately absent — the server builds this shape
 * by naming what goes in, so a field added later stays invisible here until
 * someone lists it.
 */
export type ApiBooking = {
  _id: string;
  /** Human-quotable and unique, e.g. `TT-K4M2XP`. */
  ref: string;
  /** The package's `_id`. Still resolvable unless it was withdrawn. */
  pkg: string;
  /** Company short code. */
  c: string;
  /** Destination slug. */
  d: string;
  snap: ApiBookingSnapshot;
  /** `YYYY-MM-DD`, or `""` when no date was given. */
  startDate: string;
  pax: number;
  /** The traveller's own special requirements. */
  msg: string;
  status: ApiBookingStatus;
  payStatus: ApiPaymentStatus;
  /** Total quoted, INR. */
  amount: number;
  advance: number;
  /** Verified by an admin outside this application. */
  paid: number;
  balance: number;
  /** The admin's customer-facing note. The internal one is never sent. */
  update: string;
  ts: number;
};

/** `POST /bookings`. The server prices it — an amount sent here is ignored. */
export type BookingPayload = {
  /** Required. The package `_id`. */
  pkg: string;
  /** Required. 1-50. */
  pax: number;
  /** `YYYY-MM-DD`. */
  startDate?: string;
  /** Special requirements, max 2000. */
  msg?: string;
  /** Defaults to the account's phone number. */
  phone?: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  /** Required. Digits are normalised server-side. */
  phone: string;
  /** Optional, 3-30 chars. A third way to sign in. */
  username?: string;
  /** Required, at least 8 characters. */
  password: string;
};

/** One field takes an email, a username or a phone number. */
export type LoginPayload = {
  identifier: string;
  password: string;
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
