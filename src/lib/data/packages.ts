import type { Package } from "@/lib/types";
import { companies } from "./companies";
import { destinations, getDestination } from "./destinations";

/** Price multiplier per destination, applied to the company's base price. */
const DEST_INDEX: Record<string, number> = {
  kedarnath: 1,
  "leh-ladakh": 2.3,
  "spiti-valley": 1.9,
  kashmir: 1.7,
  kerala: 1.5,
  meghalaya: 1.8,
  rajasthan: 1.6,
  thailand: 3.6,
  vietnam: 4.2,
  bali: 5.1,
};

const TIERS = [
  {
    key: "explorer",
    suffix: "Explorer",
    nights: 3,
    days: 4,
    mult: 1,
    inclusions: [
      "Airport / station pickup and drop",
      "Hotels and camps on twin sharing",
      "Breakfast and dinner",
      "Registered local guide",
      "All transfers in a private vehicle",
    ],
  },
  {
    key: "classic",
    suffix: "Classic",
    nights: 4,
    days: 5,
    mult: 1.4,
    inclusions: [
      "Everything in the Explorer package",
      "One extra night at a premium stay",
      "All meals through the trip",
      "Dedicated trip manager",
      "Sightseeing entry tickets",
    ],
  },
  {
    key: "premium",
    suffix: "Premium",
    nights: 5,
    days: 6,
    mult: 2.1,
    inclusions: [
      "Everything in the Classic package",
      "4-star stays throughout",
      "Private cab at your disposal",
      "Priority / VIP access where available",
      "24x7 on-call trip manager",
    ],
  },
];

const EXCLUSIONS = [
  "Flights and train fare to the base city",
  "Travel insurance",
  "Personal expenses, tips and laundry",
  "Anything not listed under inclusions",
];

const price = (base: number, destId: string, mult: number) =>
  Math.round((base * (DEST_INDEX[destId] ?? 1) * mult) / 100) * 100 - 1;

const itinerary = (destId: string, days: number) => {
  const dest = getDestination(destId);
  const spots = dest?.highlights ?? [];
  const out: Package["itinerary"] = [
    {
      day: 1,
      title: `Arrival in ${dest?.name ?? "the base city"}`,
      detail:
        "Pickup from the arrival point, transfer to the hotel, briefing with your trip manager and an easy evening to settle in.",
    },
  ];
  for (let d = 2; d < days; d++) {
    const spot = spots[(d - 2) % Math.max(spots.length, 1)];
    out.push({
      day: d,
      title: spot ? `${spot} day` : `Exploring ${dest?.name ?? ""}`,
      detail: spot
        ? `After breakfast, head out to ${spot} with your guide. Free time in the afternoon, dinner back at the stay.`
        : "A full day of guided sightseeing with time to explore on your own.",
    });
  }
  out.push({
    day: days,
    title: "Departure",
    detail: "Breakfast, checkout and transfer to your departure point with memories and a feedback form.",
  });
  return out;
};

export const packages: Package[] = companies.flatMap((company) =>
  company.destinations.flatMap((destId) => {
    const dest = destinations.find((d) => d.id === destId);
    if (!dest) return [];
    return TIERS.map<Package>((tier) => ({
      id: `${company.id}--${destId}--${tier.key}`,
      companyId: company.id,
      destinationId: destId,
      title: `${tier.nights}N/${tier.days}D ${dest.name} ${tier.suffix}`,
      nights: tier.nights,
      days: tier.days,
      price: price(company.fromPrice, destId, tier.mult),
      inclusions: tier.inclusions,
      exclusions: EXCLUSIONS,
      itinerary: itinerary(destId, tier.days),
    }));
  })
);

export const getPackage = (id: string) => packages.find((p) => p.id === id);

export const packagesForCompany = (companyId: string) =>
  packages.filter((p) => p.companyId === companyId);

export const packagesForDestination = (destinationId: string) =>
  packages.filter((p) => p.destinationId === destinationId);

/** Cheapest package a company runs to a given destination. */
export const startingPrice = (companyId: string, destinationId?: string) => {
  const pool = packages.filter(
    (p) =>
      p.companyId === companyId &&
      (!destinationId || p.destinationId === destinationId)
  );
  return pool.length ? Math.min(...pool.map((p) => p.price)) : 0;
};
