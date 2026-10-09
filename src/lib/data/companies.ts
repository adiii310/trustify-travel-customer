import { companyCode, type Company, type TrustParameter } from "@/lib/types";

/** The 9 parameters every verified company is scored on. */
export const TRUST_PARAMETERS = [
  "Itinerary Quality",
  "Accommodation",
  "Transport",
  "Pricing Transparency",
  "Customer Support",
  "Safety",
  "Meals",
  "Tour Management",
  "Value For Money",
] as const;

/**
 * Deterministic per-company spread around the headline trust score.
 *
 * Exported because the public API returns only the headline `score` — the
 * per-parameter breakdown is admin-side data. `mappers.ts` calls this with an
 * empty offset list to synthesise a flat breakdown for a company the static
 * catalogue has never seen.
 */
export const breakdown = (base: number, offsets: number[] = []): TrustParameter[] =>
  TRUST_PARAMETERS.map((label, i) => ({
    label,
    score: Math.max(60, Math.min(99, base + (offsets[i] ?? 0))),
  }));

/** Documents every verified company clears. Not served by the public API. */
export const STANDARD_DOCS = [
  "GST Certificate",
  "Company Registration",
  "Tourism License",
  "Insurance Policy",
];

/** Platform-wide booking terms. Not served by the public API. */
export const STANDARD_POLICIES = [
  { label: "Cancellation", value: "Free up to 15 days before departure" },
  { label: "Refunds", value: "Processed within 7 working days" },
  { label: "Payment", value: "25% to book, balance before departure" },
  { label: "Reschedule", value: "One free date change up to 10 days prior" },
];

export const companies: Company[] = [
  {
    id: "holiday-heaven",
    initial: "H",
    name: "Holiday Heaven",
    trustScore: 96,
    rating: 4.8,
    destinationCount: 24,
    verifiedSince: "Jan 2023",
    city: "Dehradun, Uttarakhand",
    experience: 8,
    fromPrice: 10499,
    reviewCount: 2340,
    tags: ["Custom Itineraries", "24x7 Support", "Great Hotels", "On-time Service"],
    about:
      "A Dehradun based operator specialising in Himalayan pilgrimage and adventure circuits. Known for transparent pricing, well planned itineraries and round-the-clock trip managers.",
    destinations: ["kedarnath", "leh-ladakh", "spiti-valley", "kashmir", "meghalaya"],
    breakdown: breakdown(96, [-4, -6, -8, -1, 0, 0, -16, -5, -7]),
    documents: STANDARD_DOCS,
    policies: STANDARD_POLICIES,
  },
  {
    id: "wander-india",
    initial: "W",
    name: "Wander India",
    trustScore: 94,
    rating: 4.7,
    destinationCount: 18,
    verifiedSince: "Mar 2023",
    city: "Haridwar, Uttarakhand",
    experience: 6,
    fromPrice: 9499,
    reviewCount: 1786,
    tags: ["Well Planned", "Good Food", "Clean Vehicles", "Supportive Staff"],
    about:
      "Haridwar based team running small-group yatras and weekend Himalayan escapes. Strong on food quality and vehicle hygiene, with a dedicated on-ground coordinator per batch.",
    destinations: ["kedarnath", "kashmir", "rajasthan", "kerala"],
    breakdown: breakdown(94, [-2, -5, -4, -3, -2, -1, 2, -6, 1]),
    documents: STANDARD_DOCS,
    policies: STANDARD_POLICIES,
  },
  {
    id: "mountain-miles",
    initial: "M",
    name: "Mountain Miles",
    trustScore: 93,
    rating: 4.6,
    destinationCount: 26,
    verifiedSince: "Feb 2023",
    city: "Rishikesh, Uttarakhand",
    experience: 7,
    fromPrice: 9999,
    reviewCount: 1452,
    tags: ["Experienced Team", "Good Stays", "Safe Travel", "Value for Money"],
    about:
      "Rishikesh based adventure specialist with certified trek leaders and a documented safety protocol for every high-altitude route they operate.",
    destinations: ["kedarnath", "spiti-valley", "leh-ladakh", "meghalaya"],
    breakdown: breakdown(93, [1, -4, 0, -6, -3, 4, -9, 2, 3]),
    documents: STANDARD_DOCS,
    policies: STANDARD_POLICIES,
  },
  {
    id: "dream-trails",
    initial: "D",
    name: "Dream Trails",
    trustScore: 92,
    rating: 4.6,
    destinationCount: 26,
    verifiedSince: "Apr 2023",
    city: "Dehradun, Uttarakhand",
    experience: 5,
    fromPrice: 11499,
    reviewCount: 980,
    tags: ["Scenic Routes", "Small Groups", "Local Guides"],
    about:
      "Boutique operator capping every departure at 12 travellers. Routes are built around local guides and lesser-known stops rather than the standard circuit.",
    destinations: ["kedarnath", "kashmir", "spiti-valley", "bali"],
    breakdown: breakdown(92, [4, 2, -5, -2, -1, 1, 3, -4, -8]),
    documents: STANDARD_DOCS,
    policies: STANDARD_POLICIES,
  },
  {
    id: "coastline-voyages",
    initial: "C",
    name: "Coastline Voyages",
    trustScore: 91,
    rating: 4.5,
    destinationCount: 15,
    verifiedSince: "Jun 2023",
    city: "Kochi, Kerala",
    experience: 9,
    fromPrice: 13999,
    reviewCount: 1210,
    tags: ["Backwater Experts", "Family Friendly", "Licensed Houseboats"],
    about:
      "Kochi based operator running backwater and beach itineraries across Kerala, with their own fleet of licensed houseboats and inspected homestays.",
    destinations: ["kerala", "rajasthan", "thailand", "bali"],
    breakdown: breakdown(91, [2, 5, 1, -3, -2, 2, 6, -1, -4]),
    documents: STANDARD_DOCS,
    policies: STANDARD_POLICIES,
  },
  {
    id: "northern-compass",
    initial: "N",
    name: "Northern Compass",
    trustScore: 89,
    rating: 4.5,
    destinationCount: 12,
    verifiedSince: "Aug 2023",
    city: "Srinagar, Jammu & Kashmir",
    experience: 11,
    fromPrice: 15499,
    reviewCount: 1604,
    tags: ["Local Operator", "Winter Specialists", "Own Fleet"],
    about:
      "The longest-running operator on our Kashmir list. Locally owned, with their own vehicle fleet and winter-rated equipment for Gulmarg departures.",
    destinations: ["kashmir", "leh-ladakh", "spiti-valley"],
    breakdown: breakdown(89, [3, 1, 8, -4, -5, 5, -2, 2, 4]),
    documents: STANDARD_DOCS,
    policies: STANDARD_POLICIES,
  },
  {
    id: "serene-escapes",
    initial: "S",
    name: "Serene Escapes",
    trustScore: 88,
    rating: 4.4,
    destinationCount: 20,
    verifiedSince: "Oct 2023",
    city: "Jaipur, Rajasthan",
    experience: 6,
    fromPrice: 12499,
    reviewCount: 742,
    tags: ["Heritage Stays", "Private Cabs", "Flexible Dates"],
    about:
      "Jaipur based operator focused on heritage-property stays and private-cab circuits across Rajasthan, with flexible departure dates year round.",
    destinations: ["rajasthan", "kerala", "thailand"],
    breakdown: breakdown(88, [5, 7, 2, -1, -3, 1, 4, 0, -2]),
    documents: STANDARD_DOCS,
    policies: STANDARD_POLICIES,
  },
  {
    id: "atlas-getaways",
    initial: "A",
    name: "Atlas Getaways",
    trustScore: 87,
    rating: 4.4,
    destinationCount: 16,
    verifiedSince: "Nov 2023",
    city: "Mumbai, Maharashtra",
    experience: 10,
    fromPrice: 42999,
    reviewCount: 1098,
    tags: ["International Trips", "Visa Assistance", "Group Departures"],
    about:
      "International specialist handling visas, forex and group departures to Southeast Asia, with an on-ground partner in each destination country.",
    destinations: ["thailand", "vietnam", "bali"],
    breakdown: breakdown(87, [4, 6, 5, 2, 3, 1, 2, 4, -6]),
    documents: STANDARD_DOCS,
    policies: STANDARD_POLICIES,
  },
];

export const getCompany = (id: string) => companies.find((c) => c.id === id);

/** Look a static seed up by its API short code (`k`), case-insensitively. */
export const getCompanyByCode = (code: string) =>
  companies.find((c) => companyCode(c).toUpperCase() === code.toUpperCase());

export const companiesForDestination = (destinationId: string) =>
  companies.filter((c) => c.destinations.includes(destinationId));

export const companyName = (id: string) => getCompany(id)?.name ?? id;
