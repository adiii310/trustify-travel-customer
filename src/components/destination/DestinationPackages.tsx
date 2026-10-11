"use client";

import { useMemo, useState } from "react";

import PackageCard from "@/components/cards/PackageCard";
import { PanelSkeleton, SkeletonGroup } from "@/components/ui/Skeleton";
import { usePackages } from "@/hooks/api";
import { BUDGET_RANGES } from "@/lib/data/site";
import { companyCode, type Company, type Destination } from "@/lib/types";

type Sort = "price" | "duration" | "trust";

/**
 * Every published package for one destination, with the filters a traveller
 * needs to compare them: duration, price, operator and availability.
 *
 * **Scoped strictly to the destination.** The slug goes to the server as `?d=`
 * and the filters narrow that result — there is no path by which a package for
 * another destination can appear here, which is the whole point of the
 * destination ↔ package relationship.
 *
 * Duration, price and company are filtered client-side over the already-fetched
 * destination list rather than re-querying per keystroke: the list is capped at
 * 200 and the counts beside each option have to be computed from the full set
 * anyway.
 */
export default function DestinationPackages({
  destination,
  companies,
}: {
  destination: Destination;
  /** Companies covering this destination, already resolved by the page. */
  companies: Company[];
}) {
  const { data, isPending, isError, error } = usePackages({
    destinationSlug: destination.id,
  });

  const [nights, setNights] = useState<number[]>([]);
  const [budgets, setBudgets] = useState<number[]>([]);
  const [operator, setOperator] = useState("");
  const [bookableOnly, setBookableOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("price");

  const all = useMemo(() => data ?? [], [data]);

  // Resolve both sides once for the whole list — a lookup per card would be the
  // N+1 this page exists to avoid.
  const byCode = useMemo(() => {
    const map = new Map<string, Company>();
    for (const c of companies) map.set(companyCode(c).toUpperCase(), c);
    return map;
  }, [companies]);

  /** Durations actually on offer, so the filter never shows an empty option. */
  const durations = useMemo(
    () => [...new Set(all.map((p) => p.nights))].sort((a, b) => a - b),
    [all]
  );

  const toggle = (value: number, list: number[], set: (next: number[]) => void) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const reset = () => {
    setNights([]);
    setBudgets([]);
    setOperator("");
    setBookableOnly(false);
    setSort("price");
  };

  const counts = useMemo(
    () => ({
      nights: durations.map((n) => all.filter((p) => p.nights === n).length),
      budget: BUDGET_RANGES.map(
        (r) => all.filter((p) => p.price >= r.min && p.price < r.max).length
      ),
    }),
    [all, durations]
  );

  const visible = useMemo(() => {
    const filtered = all.filter((p) => {
      if (nights.length && !nights.includes(p.nights)) return false;
      if (
        budgets.length &&
        !budgets.some((i) => {
          const r = BUDGET_RANGES[i];
          return p.price >= r.min && p.price < r.max;
        })
      )
        return false;
      if (operator && p.companyCode.toUpperCase() !== operator) return false;
      if (bookableOnly && p.availability === "soldout") return false;
      return true;
    });

    const sorted = [...filtered];
    if (sort === "duration") sorted.sort((a, b) => a.nights - b.nights);
    else if (sort === "trust")
      sorted.sort(
        (a, b) =>
          (byCode.get(b.companyCode.toUpperCase())?.trustScore ?? 0) -
          (byCode.get(a.companyCode.toUpperCase())?.trustScore ?? 0)
      );
    // The server already returns cheapest first, so "price" needs no re-sort.
    return sorted;
  }, [all, nights, budgets, operator, bookableOnly, sort, byCode]);

  const activeFilters =
    nights.length + budgets.length + (operator ? 1 : 0) + (bookableOnly ? 1 : 0) > 0;

  if (isPending) {
    return (
      <>
        <aside>
          <PanelSkeleton lines={6} />
        </aside>
        <SkeletonGroup label="Loading packages" className="pkgrid">
          {Array.from({ length: 4 }, (_, i) => (
            <PanelSkeleton key={i} lines={3} />
          ))}
        </SkeletonGroup>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <aside />
        <div className="empty">{error.message}</div>
      </>
    );
  }

  return (
    <>
      <aside>
        <div className="box">
          <div className="lh">
            <h3 className="m-0">Filters</h3>
            <button
              className="btn sm wo"
              onClick={reset}
              disabled={!activeFilters && sort === "price"}
            >
              ↻ Reset
            </button>
          </div>

          {durations.length > 1 && (
            <>
              <h4>Trip duration</h4>
              {durations.map((n, i) => (
                <label key={n}>
                  <input
                    type="checkbox"
                    checked={nights.includes(n)}
                    onChange={() => toggle(n, nights, setNights)}
                  />
                  {n + 1}D / {n}N
                  <span>{counts.nights[i]}</span>
                </label>
              ))}
            </>
          )}

          <h4>Budget (per person)</h4>
          {BUDGET_RANGES.map((r, i) => (
            <label key={r.label}>
              <input
                type="checkbox"
                checked={budgets.includes(i)}
                onChange={() => toggle(i, budgets, setBudgets)}
              />
              {r.label}
              <span>{counts.budget[i]}</span>
            </label>
          ))}

          <h4>Operator</h4>
          <select
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className="w-full"
            aria-label="Filter by operator"
          >
            <option value="">Any company</option>
            {companies.map((c) => (
              <option key={c.id} value={companyCode(c).toUpperCase()}>
                {c.name}
              </option>
            ))}
          </select>

          <h4>Availability</h4>
          <label>
            <input
              type="checkbox"
              checked={bookableOnly}
              onChange={() => setBookableOnly((v) => !v)}
            />
            Hide sold out
            <span>{all.filter((p) => p.availability !== "soldout").length}</span>
          </label>
        </div>
      </aside>

      <div>
        <div className="lh">
          <h2>
            {visible.length} Package{visible.length === 1 ? "" : "s"} to{" "}
            {destination.name}
          </h2>
          <span>
            Sort By:{" "}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              aria-label="Sort packages"
            >
              <option value="price">Price (Low to High)</option>
              <option value="duration">Duration (Short to Long)</option>
              <option value="trust">Operator Trust Score</option>
            </select>
          </span>
        </div>

        {visible.length ? (
          <div className="pkgrid">
            {visible.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                operator={byCode.get(pkg.companyCode.toUpperCase())}
                destination={destination}
              />
            ))}
          </div>
        ) : (
          <div className="empty">
            {all.length ? (
              <>
                No packages match these filters.{" "}
                <button className="btn sm wo" onClick={reset}>
                  Clear filters
                </button>
              </>
            ) : (
              `No company has published a package to ${destination.name} yet. Send an enquiry and we will get you quotes.`
            )}
          </div>
        )}
      </div>
    </>
  );
}
