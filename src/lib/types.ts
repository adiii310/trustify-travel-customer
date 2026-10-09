export type Destination = {
  id: string;
  name: string;
  region: string;
  companies: number;
  rating: number;
  desc: string;
  /**
   * The API has no default for these four — a destination that was never
   * given them has no such key at all. The mapper fills the gap from the
   * static catalogue, falling back to an em dash. Never assume a real value.
   */
  bestTime: string;
  difficulty: string;
  duration: string;
  budget: string;
  /** gradient stops used by the destination tile */
  c1: string;
  c2: string;
  /** Not served by the public API — comes from the static catalogue only. */
  highlights: string[];
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
   * reviews, questions and enquiry attribution, and the value every submission
   * must send. Optional only because the static catalogue predates it; read it
   * through `companyCode()` so the display letter is used as a fallback.
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
  about: string;
  destinations: string[];
  breakdown: TrustParameter[];
  documents: string[];
  policies: { label: string; value: string }[];
  /** Created at, epoch ms. Present on API records, absent on static seeds. */
  createdAt?: number;
};

export type Package = {
  id: string;
  companyId: string;
  destinationId: string;
  title: string;
  nights: number;
  days: number;
  price: number;
  inclusions: string[];
  exclusions: string[];
  itinerary: { day: number; title: string; detail: string }[];
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
 * API records carry an explicit `code`; static catalogue entries predate the
 * field and use their display letter, which is the same value on every seed.
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

export type Account = {
  name: string;
  email: string;
  phone?: string;
};

export type FormKind =
  | "login"
  | "enquiry"
  | "callback"
  | "apply"
  | "review"
  | "ask";
