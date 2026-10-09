"use client";

import { useMemo, useState } from "react";

import CompanyRow from "@/components/cards/CompanyRow";
import { BUDGET_RANGES, DURATIONS } from "@/lib/data/site";
import type { Company } from "@/lib/types";

export type ResultRow = {
  company: Company;
  /** Cheapest package this company runs to the destination. */
  price: number;
  /** Nights offered on this destination. */
  nights: number[];
};

type Sort = "trust" | "price" | "rating";

export default function DestinationResults({
  rows,
  destinationId,
}: {
  rows: ResultRow[];
  destinationId: string;
}) {
  const [budgets, setBudgets] = useState<number[]>([]);
  const [durations, setDurations] = useState<number[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<Sort>("trust");

  const toggle = (
    value: number,
    list: number[],
    set: (next: number[]) => void
  ) => set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const reset = () => {
    setBudgets([]);
    setDurations([]);
    setMinRating(0);
    setSort("trust");
  };

  const counts = useMemo(
    () => ({
      budget: BUDGET_RANGES.map(
        (r) => rows.filter((x) => x.price >= r.min && x.price < r.max).length
      ),
      duration: DURATIONS.map(
        (d) => rows.filter((x) => x.nights.some((n) => d.nights.includes(n))).length
      ),
    }),
    [rows]
  );

  const visible = useMemo(() => {
    const filtered = rows.filter((row) => {
      if (
        budgets.length &&
        !budgets.some((i) => {
          const r = BUDGET_RANGES[i];
          return row.price >= r.min && row.price < r.max;
        })
      )
        return false;

      if (
        durations.length &&
        !durations.some((i) =>
          row.nights.some((n) => DURATIONS[i].nights.includes(n))
        )
      )
        return false;

      if (minRating && row.company.rating < minRating) return false;
      return true;
    });

    const sorted = [...filtered];
    if (sort === "price") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "rating")
      sorted.sort((a, b) => b.company.rating - a.company.rating);
    else sorted.sort((a, b) => b.company.trustScore - a.company.trustScore);
    return sorted;
  }, [rows, budgets, durations, minRating, sort]);

  const activeFilters =
    budgets.length + durations.length + (minRating ? 1 : 0) > 0;

  return (
    <>
      <aside>
        <div className="box">
          <div className="lh">
            <h3 className="m-0">Filters</h3>
            <button
              className="btn sm wo"
              onClick={reset}
              disabled={!activeFilters && sort === "trust"}
            >
              ↻ Reset
            </button>
          </div>

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

          <h4>Trip duration</h4>
          {DURATIONS.map((d, i) => (
            <label key={d.label}>
              <input
                type="checkbox"
                checked={durations.includes(i)}
                onChange={() => toggle(i, durations, setDurations)}
              />
              {d.label}
              <span>{counts.duration[i]}</span>
            </label>
          ))}

          <h4>Minimum rating</h4>
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="w-full"
            aria-label="Minimum rating"
          >
            <option value={0}>Any rating</option>
            <option value={4}>4.0 and above</option>
            <option value={4.5}>4.5 and above</option>
            <option value={4.7}>4.7 and above</option>
          </select>
        </div>
      </aside>

      <div>
        <div className="lh">
          <h2>
            {visible.length} Verified{" "}
            {visible.length === 1 ? "Company" : "Companies"} Found
          </h2>
          <span>
            Sort By:{" "}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              aria-label="Sort results"
            >
              <option value="trust">Trust Score (High to Low)</option>
              <option value="price">Price (Low to High)</option>
              <option value="rating">Rating (High to Low)</option>
            </select>
          </span>
        </div>

        {visible.length ? (
          visible.map((row, i) => (
            <CompanyRow
              key={row.company.id}
              c={row.company}
              destinationId={destinationId}
              best={i === 0 && sort === "trust"}
            />
          ))
        ) : (
          <div className="empty">
            No companies match these filters.{" "}
            <button className="btn sm wo" onClick={reset}>
              Clear filters
            </button>
          </div>
        )}
      </div>
    </>
  );
}
