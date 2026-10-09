"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import CompanyRow from "@/components/cards/CompanyRow";
import { useCompanies, useDestinations } from "@/hooks/api";

/** Sort options. The API only ever returns trust-score order; the rest is ours. */
const SORTS = [
  { key: "trust", label: "Trust Score" },
  { key: "rating", label: "Rating" },
  { key: "price", label: "Price" },
] as const;

type SortKey = (typeof SORTS)[number]["key"];

const isSortKey = (value: string): value is SortKey =>
  SORTS.some((s) => s.key === value);

/**
 * The full company ranking, read from `GET /companies`.
 *
 * Search and sort stay in the URL (`?q=`, `?sort=`) so a filtered ranking is
 * still a shareable link, but both are applied in the browser: the endpoint
 * takes no query parameters at all, and the list is small enough that it does
 * not need to.
 */
export default function CompanyDirectory() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const sortParam = searchParams.get("sort") ?? "trust";
  const sort: SortKey = isSortKey(sortParam) ? sortParam : "trust";

  const { data: companies, isPending, isError, error } = useCompanies();
  const { data: destinations } = useDestinations();

  // Destination names are part of the search haystack, and companies reference
  // destinations by slug, so resolve them once rather than per keystroke.
  const destinationNames = useMemo(
    () => new Map((destinations ?? []).map((d) => [d.id, d.name])),
    [destinations]
  );

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();

    const matched = (companies ?? []).filter((c) =>
      [
        c.name,
        c.city,
        c.tags.join(" "),
        c.destinations.map((id) => destinationNames.get(id) ?? id).join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );

    // Copy before sorting — the array belongs to the query cache.
    return [...matched].sort((a, b) =>
      sort === "price"
        ? a.fromPrice - b.fromPrice
        : sort === "rating"
          ? b.rating - a.rating
          : b.trustScore - a.trustScore
    );
  }, [companies, destinationNames, q, sort]);

  if (isError) {
    return <div className="empty">{error.message}</div>;
  }

  return (
    <>
      <div className="lh mt-4">
        <h2>
          {isPending
            ? "Loading companies…"
            : `${list.length} ${list.length === 1 ? "company" : "companies"}`}
        </h2>
        <span>
          Sort:{" "}
          {SORTS.map((s) => (
            <Link
              key={s.key}
              className={`chipb${sort === s.key ? " on" : ""}`}
              href={`/companies?${new URLSearchParams({
                ...(q ? { q } : {}),
                sort: s.key,
              })}`}
              scroll={false}
            >
              {s.label}
            </Link>
          ))}
        </span>
      </div>

      {list.length ? (
        list.map((c, i) => (
          // "Best Overall" is only meaningful on the unfiltered trust ranking.
          <CompanyRow
            key={c.id}
            c={c}
            best={i === 0 && sort === "trust" && !q}
          />
        ))
      ) : (
        <div className="empty">
          {q ? `No companies match “${q}”.` : "No companies are listed yet."}
        </div>
      )}
    </>
  );
}
