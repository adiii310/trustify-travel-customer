/**
 * Wire shape → domain model.
 *
 * The API is deliberately terse (`k`, `c`, `n`, `r`, `t`, `ts`); the UI needs
 * friendlier names. That rename is **all** that happens here.
 *
 * There is no static catalogue behind these mappers any more. Everything the
 * customer site shows is stored and admin-managed, so a value the API did not
 * send is rendered as absent — an empty string, an empty array — and the
 * component hides that section. Nothing here invents a figure, a sentence or a
 * list to fill a gap: a plausible-looking fallback is indistinguishable from
 * real data to a visitor, which is exactly the confusion it would cause.
 *
 * The one derived value is `id`, the URL slug, because the API has no slug for
 * a company. It is computed from the name, not substituted from anywhere.
 */

import { monthYear, slugify } from "@/lib/format";
import type {
  Account,
  BookingRequest,
  Company,
  ContentItem,
  Destination,
  Metric,
  Package,
  Question,
  Review,
  SiteSettings,
  TrustParameter,
} from "@/lib/types";

import type {
  ApiBooking,
  ApiCompany,
  ApiContent,
  ApiContentItem,
  ApiDestination,
  ApiDestinationDetail,
  ApiMember,
  ApiMetric,
  ApiPackage,
  ApiQuestion,
  ApiReview,
  ApiSettings,
} from "./types";

/* ------------------------------------------------------------------ *
 * Companies
 * ------------------------------------------------------------------ */

/**
 * Resolve a company's URL slug from its name.
 *
 * The API has no slug for companies, so routes are keyed on the slugified
 * name. Stable as long as a company is not renamed.
 */
export const companySlug = (name: string): string => slugify(name);

export function toCompany(dto: ApiCompany): Company {
  return {
    id: companySlug(dto.name),
    code: dto.k,
    initial: dto.k.charAt(0).toUpperCase() || dto.name.charAt(0).toUpperCase(),
    name: dto.name,

    trustScore: dto.score,
    rating: dto.rating,
    destinationCount: dto.dests,
    verifiedSince: dto.since,
    city: dto.city,
    experience: dto.exp,
    fromPrice: dto.price,
    reviewCount: dto.reviews,
    tags: dto.tags ?? [],
    createdAt: dto.ts,

    // Homepage curation. Absent on records created before the fields existed,
    // so both are normalised here rather than at every call site.
    featured: dto.featured ?? false,
    featuredRank: dto.featuredRank ?? 0,

    // Admin-managed profile content. Each of these is genuinely optional, and
    // empty means "nobody has filled this in" — the page omits the section.
    about: dto.about ?? "",
    breakdown: dto.breakdown ?? [],
    destinations: dto.places ?? [],
    documents: dto.docs ?? [],
    policies: dto.policies ?? [],
    photos: dto.photos ?? [],
  };
}

export const toCompanies = (dtos: ApiCompany[]): Company[] => dtos.map(toCompany);

/* ------------------------------------------------------------------ *
 * Destinations
 * ------------------------------------------------------------------ */

export function toDestination(dto: ApiDestination): Destination {
  return {
    // `id` mirrors `slug`; prefer it, but tolerate either being the one present.
    id: dto.id || dto.slug,
    name: dto.name,
    region: dto.region,
    companies: dto.n,
    rating: dto.rating,
    desc: dto.desc,
    c1: dto.c1,
    c2: dto.c2,
    coverImage: dto.img ?? "",

    featured: dto.featured ?? false,
    featuredRank: dto.featuredRank ?? 0,

    // Stored blank as `""` on a record saved without them, and absent entirely
    // on one that predates them. Both mean "not set", and both render as
    // nothing — the chip is dropped rather than showing an em dash.
    bestTime: dto.best ?? "",
    difficulty: dto.diff ?? "",
    duration: dto.dur ?? "",
    budget: dto.budget ?? "",

    highlights: dto.highlights ?? [],
  };
}

export const toDestinations = (dtos: ApiDestination[]): Destination[] =>
  dtos.map(toDestination);

/**
 * `GET /destinations/:slug` → the destination and the companies covering it.
 *
 * Both halves go through the same mappers the list endpoints use, so a company
 * rendered on a destination page is identical to the one in the directory.
 */
export function toDestinationDetail(dto: ApiDestinationDetail): {
  destination: Destination;
  companies: Company[];
} {
  return {
    destination: toDestination(dto),
    companies: toCompanies(dto.companies ?? []),
  };
}

/* ------------------------------------------------------------------ *
 * Packages
 * ------------------------------------------------------------------ */

export function toPackage(dto: ApiPackage): Package {
  return {
    id: dto._id,
    companyCode: dto.c,
    destinationId: dto.d,
    title: dto.title,
    desc: dto.desc ?? "",
    nights: dto.nights,
    days: dto.days,
    price: dto.price,
    inclusions: dto.inclusions ?? [],
    exclusions: dto.exclusions ?? [],
    itinerary: dto.itinerary ?? [],
    itineraryPdf: dto.pdf ?? "",
    coverImage: dto.img ?? "",
    // Absent on records saved before the field existed. `open` is the only
    // defensible reading: the package is published and has no stated limit.
    availability: dto.avail ?? "open",
  };
}

export const toPackages = (dtos: ApiPackage[]): Package[] => dtos.map(toPackage);

/* ------------------------------------------------------------------ *
 * Account and bookings
 * ------------------------------------------------------------------ */

export const toAccount = (dto: ApiMember): Account => ({
  id: dto._id,
  name: dto.name,
  email: dto.email,
  phone: dto.phone || undefined,
  username: dto.username || undefined,
});

export function toBooking(dto: ApiBooking): BookingRequest {
  return {
    id: dto._id,
    reference: dto.ref,
    packageId: dto.pkg,
    companyCode: dto.c,
    destinationId: dto.d,
    snapshot: {
      title: dto.snap?.title ?? "",
      price: dto.snap?.price ?? 0,
      nights: dto.snap?.nights ?? 0,
      days: dto.snap?.days ?? 0,
      destinationName: dto.snap?.destName ?? dto.d,
      companyName: dto.snap?.companyName ?? dto.c,
    },
    startDate: dto.startDate ?? "",
    travellers: dto.pax,
    requirements: dto.msg ?? "",
    status: dto.status,
    paymentStatus: dto.payStatus,
    amount: dto.amount ?? 0,
    advance: dto.advance ?? 0,
    paid: dto.paid ?? 0,
    balance: dto.balance ?? 0,
    update: dto.update ?? "",
    createdAt: dto.ts,
  };
}

export const toBookings = (dtos: ApiBooking[]): BookingRequest[] => dtos.map(toBooking);

/* ------------------------------------------------------------------ *
 * Site content and settings
 * ------------------------------------------------------------------ */

export const toContentItem = (dto: ApiContentItem): ContentItem => ({
  id: dto._id,
  icon: dto.icon,
  title: dto.title,
  body: dto.body,
});

/**
 * Every group is present in the response, so this never has to invent one.
 * A group with no rows stays an empty array and its section is hidden.
 */
export const toContent = (dto: ApiContent) => ({
  badges: (dto.badge ?? []).map(toContentItem),
  steps: (dto.step ?? []).map(toContentItem),
  resources: (dto.resource ?? []).map(toContentItem),
  trustParameters: (dto.parameter ?? []).map(toContentItem),
  interests: (dto.interest ?? []).map(toContentItem),
});

export const toSettings = (dto: ApiSettings): SiteSettings => ({
  name: dto["site.name"] ?? "",
  tagline: dto["site.tagline"] ?? "",
  whatsapp: dto["site.whatsapp"] ?? "",
  whatsappMessage: dto["site.whatsappMessage"] ?? "",
});

/* ------------------------------------------------------------------ *
 * Homepage metrics
 * ------------------------------------------------------------------ */

export function toMetric(dto: ApiMetric): Metric {
  return {
    id: dto._id,
    icon: dto.icon,
    // Display text — never coerced to a number. "450+" is the point.
    value: dto.value,
    label: dto.label,
  };
}

export const toMetrics = (dtos: ApiMetric[]): Metric[] => dtos.map(toMetric);

/* ------------------------------------------------------------------ *
 * Company-code resolution
 *
 * Reviews, questions and packages reference a company by its short code and
 * the API does no join, so the client builds the lookup. A code with no
 * matching company is expected — a company can be hidden while its approved
 * reviews stay live — so the resolver falls back to the raw code rather than
 * dropping the record.
 * ------------------------------------------------------------------ */

/** Maps a company short code to the slug its profile page lives at. */
export type CompanyCodeResolver = (code: string) => string;

export function createCompanyCodeResolver(
  companies: Company[] = []
): CompanyCodeResolver {
  const bySlug = new Map<string, string>();
  for (const company of companies) {
    bySlug.set((company.code ?? company.initial).toUpperCase(), company.id);
  }
  return (code: string) => bySlug.get(code.toUpperCase()) ?? code;
}

/* ------------------------------------------------------------------ *
 * Reviews & questions
 * ------------------------------------------------------------------ */

export function toReview(dto: ApiReview, resolve: CompanyCodeResolver): Review {
  return {
    id: dto._id,
    companyId: resolve(dto.c),
    author: dto.n,
    rating: dto.r,
    // `d` is free text and may be empty; `ts` is the only reliable date.
    date: dto.d || monthYear(new Date(dto.ts).toISOString()),
    trip: dto.trip || "",
    text: dto.t,
    // Only approved reviews are ever returned, so everything read here is
    // moderated. The flag distinguishes them from an optimistic local insert.
    verified: dto.status === "approved",
    createdAt: dto.ts,
  };
}

export const toReviews = (
  dtos: ApiReview[],
  resolve: CompanyCodeResolver
): Review[] => dtos.map((dto) => toReview(dto, resolve));

export function toQuestion(
  dto: ApiQuestion,
  resolve: CompanyCodeResolver
): Question {
  return {
    id: dto._id,
    companyId: resolve(dto.c),
    author: dto.n,
    question: dto.q,
    // The API sends "" for unanswered. Normalise to undefined so components can
    // test truthiness without caring which empty value arrived.
    answer: dto.a || undefined,
    createdAt: dto.ts,
  };
}

export const toQuestions = (
  dtos: ApiQuestion[],
  resolve: CompanyCodeResolver
): Question[] => dtos.map((dto) => toQuestion(dto, resolve));

export type { TrustParameter };
