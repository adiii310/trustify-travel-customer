"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import DestinationCard from "@/components/cards/DestinationCard";
import { useDestinations } from "@/hooks/api";

/**
 * The destination grid, read from `GET /destinations`.
 *
 * The server returns every published destination sorted by verified-company
 * count; `?q=` filtering happens here because the endpoint accepts no query
 * parameters.
 */
export default function DestinationDirectory() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  const { data, isPending, isError, error } = useDestinations();

  const list = useMemo(() => {
    const destinations = data ?? [];
    const query = q.trim().toLowerCase();
    if (!query) return destinations;

    return destinations.filter((d) =>
      // `highlights` is editorial content the API does not serve, so it is
      // often empty — it still costs nothing to search when it is present.
      `${d.name} ${d.region} ${d.highlights.join(" ")}`
        .toLowerCase()
        .includes(query)
    );
  }, [data, q]);

  if (isError) {
    return <div className="empty mt-[18px]">{error.message}</div>;
  }

  return (
    <>
      <div className="dest mt-[18px]">
        {list.map((d) => (
          <DestinationCard d={d} key={d.id} />
        ))}
      </div>

      {!isPending && list.length === 0 && (
        <div className="empty mt-[18px]">
          {q
            ? `No destinations match “${q}”. Try a different search.`
            : "No destinations are listed yet."}
        </div>
      )}
    </>
  );
}
