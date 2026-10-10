"use client";

import Link from "next/link";
import { useState } from "react";

import FormButton from "@/components/ui/FormButton";
import { isListCapped, useCompanies, useReviews } from "@/hooks/api";
import { LIST_CAP } from "@/lib/api/config";
import { averageRating } from "@/lib/reviews";
import { stars } from "@/lib/format";

/**
 * Every approved review across every company.
 *
 * Fetched once with no `?c=` filter; both the company and the rating filters
 * run in the browser, because the API offers neither. The company list is read
 * alongside so each review's company code can be shown as a name and linked to
 * a profile — the API performs no join.
 */
export default function AllReviews() {
  const { data: companies } = useCompanies();
  const { data, isPending, isError, error } = useReviews();

  const [companyId, setCompanyId] = useState("");
  const [rating, setRating] = useState(0);

  const reviews = data ?? [];
  const list = reviews.filter(
    (r) =>
      (!companyId || r.companyId === companyId) &&
      (!rating || r.rating === rating)
  );

  /**
   * A review may reference a company that is no longer listed — it can be
   * hidden while its approved reviews stay live — so fall back to the raw
   * identifier rather than rendering a blank.
   */
  const nameFor = (id: string) =>
    companies?.find((c) => c.id === id)?.name ?? id;

  return (
    <>
      <div className="lh">
        <span>
          {isPending
            ? "Loading reviews…"
            : `${list.length} reviews · average ${averageRating(list) || "–"}/5`}
        </span>
        <FormButton kind="review" className="btn g">
          Write a review
        </FormButton>
      </div>

      <div className="box">
        <div className="lh mb-0">
          <label className="p-0">
            Company
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="ml-2"
            >
              <option value="">All companies</option>
              {(companies ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <span>
            {[0, 5, 4, 3, 2, 1].map((n) => (
              <button
                key={n}
                className={`chipb${rating === n ? " on" : ""}`}
                onClick={() => setRating(n)}
              >
                {n ? `${n}★` : "All"}
              </button>
            ))}
          </span>
        </div>
      </div>

      {isListCapped(reviews) && (
        <p className="mute text-[12px] mb-2">
          Showing the {LIST_CAP} most recent reviews — the API does not page
          beyond that.
        </p>
      )}

      <div className="box">
        {list.length ? (
          list.map((r) => (
            <div className="rc" key={r.id}>
              <b>{r.author}</b>{" "}
              {r.verified && <span className="ver">✔ Verified traveller</span>}{" "}
              <span className="stars">{stars(r.rating)}</span>
              <br />
              <small>
                <Link href={`/companies/${r.companyId}`}>
                  {nameFor(r.companyId)}
                </Link>
                {" · "}
                {r.date}
                {r.trip ? ` · ${r.trip}` : ""}
              </small>
              <p className="mt-1">{r.text}</p>
            </div>
          ))
        ) : (
          <p className="mute">
            {isError ? error.message : "No reviews match these filters yet."}
          </p>
        )}
      </div>
    </>
  );
}
