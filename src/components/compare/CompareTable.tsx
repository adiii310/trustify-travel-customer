"use client";

import Link from "next/link";

import { useCompanies } from "@/hooks/api";
import { inr, num } from "@/lib/format";
import { MAX_COMPARE, useApp } from "@/hooks/useApp";
import type { Company } from "@/lib/types";

type Row = {
  label: string;
  value: (c: Company) => number | string;
  /** 1 = higher is better, -1 = lower is better, 0 = not comparable */
  better: 1 | -1 | 0;
  format?: (v: number) => string;
};

const BASE_ROWS: Row[] = [
  { label: "Trust Score /100", value: (c) => c.trustScore, better: 1 },
  { label: "Average Rating", value: (c) => c.rating, better: 1 },
  {
    label: "Starting price per person",
    value: (c) => c.fromPrice,
    better: -1,
    format: inr,
  },
  { label: "Years of Experience", value: (c) => c.experience, better: 1 },
  { label: "Destinations", value: (c) => c.destinationCount, better: 1 },
  {
    label: "Verified Reviews",
    value: (c) => c.reviewCount,
    better: 1,
    format: num,
  },
  { label: "Head Office", value: (c) => c.city, better: 0 },
  { label: "Verified Since", value: (c) => c.verifiedSince, better: 0 },
];

export default function CompareTable() {
  const { compare, toggleCompare, clearCompare, ready } = useApp();

  // Prices and trust scores are the whole point of this table, so they come
  // from the live company list rather than the static catalogue.
  const { data } = useCompanies();
  const companies = data ?? [];

  // A saved comparison can outlive a company: the tray is persisted on the
  // device, the company list is not. Unknown ids are dropped rather than
  // rendered as blank columns.
  const selected = compare
    .map((id) => companies.find((c) => c.id === id))
    .filter((c): c is Company => Boolean(c));

  const rows: Row[] = [
    ...BASE_ROWS,
    ...(selected[0]?.breakdown ?? []).map<Row>((param, i) => ({
      label: param.label,
      value: (c) => c.breakdown[i]?.score ?? 0,
      better: 1,
    })),
  ];

  return (
    <>
      <div className="mb-3.5">
        {companies.map((c) => {
          const on = ready && compare.includes(c.id);
          return (
            <button
              key={c.id}
              className={`chipb${on ? " on" : ""}`}
              onClick={() => toggleCompare(c.id)}
            >
              {on ? "✔" : "+"} {c.name}
            </button>
          );
        })}
        {ready && compare.length > 0 && (
          <button className="chipb" onClick={clearCompare}>
            Clear all
          </button>
        )}
      </div>

      {!ready ? (
        <div className="empty">Loading your comparison…</div>
      ) : selected.length < 2 ? (
        <div className="empty">
          Select at least 2 companies above to start comparing.
          <br />
          You can compare up to {MAX_COMPARE} at a time.
        </div>
      ) : (
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th />
                {selected.map((c) => (
                  <th key={c.id}>
                    {c.name}
                    <small>
                      <Link href={`/companies/${c.id}`}>View report</Link>
                    </small>
                    <small
                      className="text-mute"
                      onClick={() => toggleCompare(c.id)}
                    >
                      Remove
                    </small>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const values = selected.map((c) => row.value(c));
                const numeric = values.filter(
                  (v): v is number => typeof v === "number"
                );
                const best =
                  row.better && numeric.length === values.length
                    ? row.better > 0
                      ? Math.max(...numeric)
                      : Math.min(...numeric)
                    : null;

                return (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    {values.map((v, i) => (
                      <td
                        key={selected[i].id}
                        className={best !== null && v === best ? "best" : ""}
                      >
                        {typeof v === "number" && row.format ? row.format(v) : v}
                      </td>
                    ))}
                  </tr>
                );
              })}
              <tr>
                <td />
                {selected.map((c) => (
                  <td key={c.id}>
                    <Link className="btn g sm" href={`/companies/${c.id}?tab=packages`}>
                      Book with {c.name.split(" ")[0]}
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
