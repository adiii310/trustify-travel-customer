"use client";

import { useMemo, useState } from "react";

import FormButton from "@/components/ui/FormButton";
import { isListCapped, useCompanyCode, useCompanyReviews } from "@/hooks/api";
import { LIST_CAP } from "@/lib/api/config";
import { averageRating, starBar } from "@/lib/reviews";
import { num, stars } from "@/lib/format";

/**
 * Approved reviews for one company, read live from `GET /reviews?c=<code>`.
 *
 * The API filters by company short code and nothing else — the star filter
 * below is applied in the browser, as it must be.
 */
export default function CompanyReviews({
  companyId,
  fallbackRating,
  totalVerified,
}: {
  companyId: string;
  /** Headline rating from the company record, shown until reviews arrive. */
  fallbackRating: number;
  /** The company's stored review count — not a count of this list. */
  totalVerified: number;
}) {
  // The profile page knows the slug; reviews are keyed by short code. The query
  // stays disabled until the company list resolves that for us.
  const code = useCompanyCode(companyId);
  const { data, isPending, isError, error } = useCompanyReviews(code);

  const [filter, setFilter] = useState(0);

  const all = useMemo(() => data ?? [], [data]);
  const shown = filter ? all.filter((r) => r.rating === filter) : all;

  // Prefer the average of what we can actually see; fall back to the company's
  // own rating while the list is still loading or if it comes back empty.
  const avg = all.length ? averageRating(all) : fallbackRating;

  return (
    <div className="rv">
      <div className="box">
        <h3>Ratings</h3>
        <div className="score">
          {avg}
          <small>/5</small>
        </div>
        <span className="stars">{stars(avg)}</span>
        <br />
        <small className="mute">
          {all.length} shown here · {num(totalVerified)} verified in total
        </small>
        {/* The endpoint has no paging, so a full list means older reviews
            exist but cannot be reached. Say so rather than implying this is
            everything. */}
        {isListCapped(all) && (
          <>
            <br />
            <small className="mute">
              Showing the {LIST_CAP} most recent.
            </small>
          </>
        )}
        <div className="mt-3">
          {starBar(all).map((b) => (
            <div className="bar" key={b.stars}>
              {b.stars}★
              <i>
                <u style={{ width: `${b.pct}%` }} />
              </i>
              {b.pct}%
            </div>
          ))}
        </div>
      </div>

      <div className="box">
        <div className="lh">
          <h3 className="m-0">Traveller Reviews</h3>
          <span>
            {[0, 5, 4, 3].map((n) => (
              <button
                key={n}
                className={`chipb${filter === n ? " on" : ""}`}
                onClick={() => setFilter(n)}
              >
                {n ? `${n}★` : "All"}
              </button>
            ))}
            <FormButton kind="review" companyId={companyId} className="btn g">
              Write a review
            </FormButton>
          </span>
        </div>

        {shown.length ? (
          shown.map((r) => (
            <div className="rc" key={r.id}>
              <b>{r.author}</b>{" "}
              {r.verified && <span className="ver">✔ Verified traveller</span>}{" "}
              <span className="stars">{stars(r.rating)}</span>
              <br />
              <small>
                {r.date}
                {r.trip ? ` · ${r.trip}` : ""}
              </small>
              <p className="mt-1">{r.text}</p>
            </div>
          ))
        ) : (
          <p className="mute py-3">
            {isPending
              ? "Loading reviews…"
              : isError
                ? error.message
                : "No reviews for this rating yet. Be the first to write one."}
          </p>
        )}
      </div>
    </div>
  );
}
