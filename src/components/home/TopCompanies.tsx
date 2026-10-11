"use client";

import CompanyCard from "@/components/cards/CompanyCard";
import { useCompanies } from "@/hooks/api";
import { pickFeatured } from "@/lib/featured";

/** How many cards the grid shows when an admin has not curated the section. */
const FALLBACK_COUNT = 4;

/**
 * The companies shown on the homepage, read from `GET /companies`.
 *
 * An admin picks them in the admin panel's Homepage view. With nothing picked
 * this falls back to the highest trust scores — the API already returns the
 * list in that order, which is exactly the ranking this section is about.
 */
export default function TopCompanies() {
  const { data } = useCompanies();

  return (
    <div className="co">
      {pickFeatured(data ?? [], FALLBACK_COUNT).map((c) => (
        <CompanyCard c={c} key={c.id} />
      ))}
    </div>
  );
}
