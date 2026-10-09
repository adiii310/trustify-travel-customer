"use client";

import DestinationCard from "@/components/cards/DestinationCard";
import { useDestinations } from "@/hooks/api";

/** How many tiles the homepage grid shows. */
const COUNT = 8;

/**
 * The most-covered destinations, read from `GET /destinations`.
 *
 * The API already returns them sorted by verified-company count, so the first
 * few are the popular ones by definition.
 */
export default function PopularDestinations() {
  const { data } = useDestinations();

  return (
    <div className="dest">
      {(data ?? []).slice(0, COUNT).map((d) => (
        <DestinationCard d={d} key={d.id} />
      ))}
    </div>
  );
}
