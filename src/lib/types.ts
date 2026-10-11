export type Destination = {
  id: string;
  name: string;
  region: string;
  companies: number;
  rating: number;
  desc: string;
  /**
   * All four are admin-entered and genuinely optional — `""` when nobody has
   * filled them in. Render the chip only when there is a value; an em dash in
   * a "Best Time" chip reads as a real answer and is not one.
   */
  bestTime: string;
  difficulty: string;
  duration: string;
  budget: string;
  /** gradient stops used by the destination tile */
  c1: string;
  c2: string;
  /**
   * Cover photo an admin uploaded, as a hosted URL.
   *
   * `""` means "no photo", which is a finished state — the gradient above
   * always renders behind it, never instead of it.
   */
  coverImage?: string;
  /** Admin-managed. Empty hides the panel. */
  highlights: string[];
  /** Picked by an admin for the homepage grid. Absent on pre-curation records. */
  featured?: boolean;
  /** Position in that grid, ascending. */
  featuredRank?: number;
};

/**
 * A headline figure in the homepage hero strip, managed from the admin panel.
 *
 * `value` is display text (`"450+"`), never a number — the figures are curated
 * marketing copy and do not track anything the API counts.
 */
export type Metric = {
  id: string;
  icon: string;
  value: string;
  label: string;
};

export type TrustParameter = {
  label: string;
  score: number;
};

export type Company = {
  /** URL slug. Derived from the name — the API has no slug for companies. */
  id: string;
  /**
   * The API's company short code (`k`). This — not `id` — is the join key for
   * reviews, questions, packages and enquiry attribution, and the value every
   * submission must send. Read it through `companyCode()`.
   */
  code?: string;
  /** Display letter shown in the avatar tile. */
  initial: string;
  name: string;
  trustScore: number;
  rating: number;
  destinationCount: number;
  verifiedSince: string;
  city: string;
  experience: number;
  fromPrice: number;
  reviewCount: number;
  tags: string[];
  /** Admin-managed profile copy. `""` hides the About panel. */
  about: string;
  /** Destination slugs this company travels to. Empty hides the tab. */
  destinations: string[];
  /**
   * Per-parameter trust scores. **Any length** — never assume nine, and never
   * synthesise rows from `trustScore`: an empty array means the breakdown has
   * not been entered, and the panel is hidden.
   */
  breakdown: TrustParameter[];
  /** Verified document names. Empty hides the tab. */
  documents: string[];
  /** Booking terms. Empty hides the tab. */
  policies: { label: string; value: string }[];
  /** Hosted gallery image URLs. Empty hides the tab. */
  photos: string[];
  /** Created at, epoch ms. */
  createdAt?: number;
  /**
   * Picked by an admin for the homepage "Top Rated Companies" strip.
   *
   * Absent on records created before curation existed. Read through
   * `pickFeatured`, which normalises both fields.
   */
  featured?: boolean;
  /** Position in that strip, ascending. */
  featuredRank?: number;
};

export type Package = {
  id: string;
  /**
   * Company **short code** (`k`), not a slug — packages are stored against the
   * code like reviews and questions, and there is no server-side join.
   */
  companyCode: string;
  /** Destination slug. */
  destinationId: string;
  title: string;
  /** One-line pitch for the card. `""` hides that line. */
  desc: string;
  nights: number;
  days: number;
  /** Per person, INR. */
  price: number;
  inclusions: string[];
  exclusions: string[];
  itinerary: { day: number; title: string; detail: string }[];
  /**
   * The same itinerary as a downloadable PDF. `""` when none was uploaded.
   *
   * Independent of `itinerary` above — a package may have either, both or
   * neither, and each section is shown only if it has something in it.
   */
  itineraryPdf: string;
  /** `""` falls back to the destination's own cover, then to its gradient. */
  coverImage: string;
  /**
   * Whether it can be booked — **not** whether it is listed. A sold-out
   * package is still shown and still comparable; only the booking action
   * changes.
   */
  availability: Availability;
};

export type Availability = "open" | "limited" | "soldout";

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  open: "Available",
  limited: "Few seats left",
  soldout: "Sold out",
};

/**
 * One entry in an admin-managed site content list — a homepage trust badge, a
 * verification step, a resources FAQ entry, a trust-parameter name or a
 * trip-planner interest. `body` is empty for the title-only lists.
 */
export type ContentItem = {
  id: string;
  icon: string;
  title: string;
  body: string;
};

/** Site-wide values from `GET /settings`. Any of them may be `""`. */
export type SiteSettings = {
  name: string;
  tagline: string;
  /** Digits with country code. `""` hides every WhatsApp button. */
  whatsapp: string;
  whatsappMessage: string;
};

export type Review = {
  id: string;
  companyId: string;
  author: string;
  rating: number;
  date: string;
  trip: string;
  text: string;
  verified: boolean;
  createdAt: number;
};

export type Question = {
  id: string;
  companyId: string;
  author: string;
  question: string;
  /** Undefined until a company replies — the API sends `""`, we normalise it. */
  answer?: string;
  createdAt: number;
};

/* ---------- Helpers over the domain model ---------- */

/**
 * The code to send to the API for a company.
 *
 * Every API record carries an explicit `code`; the display letter is the
 * fallback for the rare record saved without one.
 */
export const companyCode = (company: Pick<Company, "code" | "initial">): string =>
  company.code ?? company.initial;

/* ---------- User-generated (stored locally, guest friendly) ---------- */

export type Traveller = {
  name: string;
  age?: number;
};

export type Booking = {
  id: string;
  kind: "booking";
  companyId: string;
  packageId: string;
  destinationId: string;
  title: string;
  startDate: string;
  travellers: number;
  pricePerPerson: number;
  total: number;
  contact: { name: string; email: string; phone: string };
  notes?: string;
  status: "confirmed" | "cancelled";
  createdAt: number;
};

export type TripPlan = {
  id: string;
  kind: "plan";
  title: string;
  destinationId: string;
  startDate: string;
  endDate: string;
  travellers: number;
  budgetPerPerson: number;
  interests: string[];
  notes: string;
  status: "draft" | "planned";
  createdAt: number;
};

export type Trip = Booking | TripPlan;

/**
 * The signed-in traveller.
 *
 * Previously this was captured locally by the sign-in dialog and never left
 * the device. It is now a real account on the server, and `username` is a
 * third way to sign in.
 */
export type Account = {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  username?: string;
};

export type BookingStatus =
  | "pending"
  | "contacted"
  | "awaiting_payment"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "rejected";

export type PaymentStatus =
  | "not_required"
  | "unpaid"
  | "partially_paid"
  | "paid"
  | "refunded";

/** Traveller-facing wording. Deliberately explains what happens next. */
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Request received",
  contacted: "We have been in touch",
  awaiting_payment: "Awaiting payment",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Not available",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  not_required: "No payment needed",
  unpaid: "Not paid yet",
  partially_paid: "Part paid",
  paid: "Paid",
  refunded: "Refunded",
};

/** A trip the traveller asked a company to run, worked manually by the team. */
export type BookingRequest = {
  id: string;
  /** Human-quotable, e.g. `TT-K4M2XP`. */
  reference: string;
  packageId: string;
  companyCode: string;
  destinationId: string;
  /** What the package cost and said when it was booked, not today. */
  snapshot: {
    title: string;
    price: number;
    nights: number;
    days: number;
    destinationName: string;
    companyName: string;
  };
  startDate: string;
  travellers: number;
  requirements: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  /** Total quoted, INR. */
  amount: number;
  advance: number;
  /** Verified by the team outside this site. */
  paid: number;
  balance: number;
  /** The team's note to the traveller. Internal notes are never sent here. */
  update: string;
  createdAt: number;
};

export type FormKind =
  | "login"
  | "enquiry"
  | "callback"
  | "apply"
  | "review"
  | "ask";
