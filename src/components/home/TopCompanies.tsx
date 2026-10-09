"use client";

import CompanyCard from "@/components/cards/CompanyCard";
import { useCompanies } from "@/hooks/api";

/** How many cards the homepage grid shows. */
const COUNT = 4;

/**
 * The highest-scoring companies, read from `GET /companies`.
 *
 * No sorting needed — the API already returns the list by trust score
 * descending, which is exactly the ranking this section is about.
 */
export default function TopCompanies() {
  const { data } = useCompanies();

  return (
    <div className="co">
      {(data ?? []).slice(0, COUNT).map((c) => (
        <CompanyCard c={c} key={c.id} />
      ))}
    </div>
  );
}
