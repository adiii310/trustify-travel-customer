"use client";

import DestinationCard from "@/components/cards/DestinationCard";
import { useDestinations } from "@/hooks/api";
import { pickFeatured } from "@/lib/featured";

/** How many tiles the grid shows when an admin has not curated the section. */
const FALLBACK_COUNT = 8;

/**
 * The destinations shown on the homepage, read from `GET /destinations`.
 *
 * An admin picks them in the admin panel's Homepage view. With nothing picked
 * this falls back to the most-covered destinations — the API already returns
 * them sorted by verified-company count, so the first few are the popular ones
 * by definition.
 */
export default function PopularDestinations() {
  const { data } = useDestinations();

  return (
    <div className="dest">
      {pickFeatured(data ?? [], FALLBACK_COUNT).map((d) => (
        <DestinationCard d={d} key={d.id} />
      ))}
    </div>
  );
}
