/**
 * Aggregates over a list of reviews.
 *
 * These are computations over live data, not content — they moved here when
 * the seeded review catalogue they used to sit beside was deleted. Both return
 * zeroes for an empty list rather than a placeholder, so a company with no
 * reviews shows "no reviews yet" instead of an invented average.
 */
import type { Review } from "@/lib/types";

/** Share of reviews at each star rating, 5 down to 1. */
export const starBar = (reviews: Review[]) =>
  [5, 4, 3, 2, 1].map((n) => ({
    stars: n,
    pct: reviews.length
      ? Math.round(
          (100 * reviews.filter((r) => r.rating === n).length) / reviews.length
        )
      : 0,
  }));

/** Mean rating to one decimal place, or `0` when there are none. */
export const averageRating = (reviews: Review[]) =>
  reviews.length
    ? Number(
        (reviews.reduce((t, r) => t + r.rating, 0) / reviews.length).toFixed(1)
      )
    : 0;
