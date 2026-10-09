/**
 * Wire shape → domain model.
 *
 * The API is deliberately terse (`k`, `c`, `n`, `r`, `t`, `ts`) and serves only
 * what it stores. The UI needs friendlier names and a few things the public API
 * does not expose at all — a company's trust-score breakdown, its "about" copy,
 * which destinations it covers, a destination's highlights.
 *
 * The rule applied here, consistently:
 *
 *   live API value  →  static catalogue value  →  neutral default
 *
 * So a company the backend knows about always renders with real numbers, is
 * enriched with editorial content when we have it, and still renders sanely
 * when we do not. Enrichment is matched on slug first, then on short code.
 */

import {
  breakdown,
  companies as staticCompanies,
  getCompanyByCode,
  getCompany,
  STANDARD_DOCS,
  STANDARD_POLICIES,
} from "@/lib/data/companies";
import { getDestination } from "@/lib/data/destinations";
import { monthYear, slugify } from "@/lib/format";
import type { Company, Destination, Metric, Question, Review } from "@/lib/types";

import type {
  ApiCompany,
  ApiDestination,
  ApiMetric,
  ApiQuestion,
  ApiReview,
} from "./types";

/** Shown wherever the API has no value and the catalogue has no fallback. */
const UNKNOWN = "—";

/* ------------------------------------------------------------------ *
 * Companies
 * ------------------------------------------------------------------ */

/**
 * Resolve a company's URL slug from its name.
 *
 * The API has no slug for companies, so routes are keyed on the slugified
 * name. This is stable as long as a company is not renamed; the static
 * catalogue uses exactly the same derivation, which is what lets enrichment
 * match up.
 */
export const companySlug = (name: string): string => slugify(name);

/** Editorial copy for a company the static catalogue has never heard of. */
const fallbackAbout = (dto: ApiCompany): string =>
  `${dto.name} is a verified travel company based in ${dto.city}, with ` +
  `${dto.exp} years in business and ${dto.dests} destinations covered. ` +
  `Verified since ${dto.since}.`;

export function toCompany(dto: ApiCompany): Company {
  const id = companySlug(dto.name);
  // Match the static profile by slug first; fall back to the short code so a
  // renamed company keeps its editorial content.
  const profile = getCompany(id) ?? getCompanyByCode(dto.k);

  return {
    id,
    code: dto.k,
    initial: dto.k.charAt(0).toUpperCase() || dto.name.charAt(0).toUpperCase(),
    name: dto.name,

    // ---- Live figures: always the API's, never the catalogue's ----
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

    // ---- Enrichment: admin-side data the public API does not serve ----
    about: profile?.about ?? fallbackAbout(dto),
    // No company→destination relation exists in the public API, so an unknown
    // company simply covers no linkable destinations.
    destinations: profile?.destinations ?? [],
    // A flat breakdown at the headline score is honest: we know the total, not
    // the split.
    breakdown: profile?.breakdown ?? breakdown(dto.score),
    documents: profile?.documents ?? STANDARD_DOCS,
    policies: profile?.policies ?? STANDARD_POLICIES,
  };
}

export const toCompanies = (dtos: ApiCompany[]): Company[] => dtos.map(toCompany);

/* ------------------------------------------------------------------ *
 * Destinations
 * ------------------------------------------------------------------ */

export function toDestination(dto: ApiDestination): Destination {
  // `id` mirrors `slug`; prefer it, but tolerate either being the one present.
  const id = dto.id || dto.slug;
  const profile = getDestination(id);

  return {
    id,
    name: dto.name,
    region: dto.region,
    companies: dto.n,
    rating: dto.rating,
    desc: dto.desc,
    c1: dto.c1,
    c2: dto.c2,

    featured: dto.featured ?? false,
    featuredRank: dto.featuredRank ?? 0,

    // These four are frequently missing from the response entirely (not null),
    // so every read goes through `??` with a catalogue value behind it.
    bestTime: dto.best ?? profile?.bestTime ?? UNKNOWN,
    difficulty: dto.diff ?? profile?.difficulty ?? UNKNOWN,
    duration: dto.dur ?? profile?.duration ?? UNKNOWN,
    budget: dto.budget ?? profile?.budget ?? UNKNOWN,

    // Never served by the public API.
    highlights: profile?.highlights ?? [],
  };
}

export const toDestinations = (dtos: ApiDestination[]): Destination[] =>
  dtos.map(toDestination);

/* ------------------------------------------------------------------ *
 * Homepage metrics
 *
 * No catalogue fallback here: unlike companies and destinations there is no
 * editorial content to enrich, and the component owns the "API served nothing"
 * case so it can fall back to its own default copy.
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
 * Reviews and questions reference a company by its short code and the API does
 * no join, so the client builds the lookup. A code with no matching company is
 * expected — a company can be hidden while its approved reviews stay live — so
 * every resolver falls back rather than dropping the record.
 * ------------------------------------------------------------------ */

/** Maps a company short code to the slug its profile page lives at. */
export type CompanyCodeResolver = (code: string) => string;

/**
 * Build a code → slug resolver from the live company list.
 *
 * Falls back to the static catalogue, then to the raw code, so a review always
 * renders even when its company has been pulled from the directory.
 */
export function createCompanyCodeResolver(
  companies: Company[] = []
): CompanyCodeResolver {
  const bySlug = new Map<string, string>();
  for (const company of companies) {
    bySlug.set((company.code ?? company.initial).toUpperCase(), company.id);
  }

  return (code: string) => {
    const key = code.toUpperCase();
    return bySlug.get(key) ?? getCompanyByCode(key)?.id ?? code;
  };
}

/** Resolver used when the company list has not loaded yet. */
export const staticCompanyCodeResolver: CompanyCodeResolver =
  createCompanyCodeResolver(staticCompanies);

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
