/**
 * Homepage curation.
 *
 * An admin picks which companies and destinations fill the two homepage
 * sections by setting `featured` and `featuredRank` in the admin panel. The
 * public API applies neither — `GET /companies` and `GET /destinations` return
 * every published record in their own natural order (trust score, coverage) —
 * so the choice is applied here, against the list the page already holds.
 *
 * Plain module, not `"use client"`: it holds no state and is imported by both
 * server and client components.
 */

type Curatable = {
  featured?: boolean;
  featuredRank?: number;
};

/**
 * The records a curated homepage section should show.
 *
 * Falls back to the first `count` of the list when nothing is featured, which
 * is the ordering the section had before curation existed. **An empty featured
 * set means "not configured", never "show nothing"** — a fresh install has no
 * featured records and must still render a populated homepage.
 *
 * When an admin has curated the section, every featured record is returned, not
 * just the first `count`: the whole point is that the admin decides. Both grids
 * wrap, so a longer list adds a row rather than overflowing.
 *
 * @param count How many to show when falling back.
 */
export function pickFeatured<T extends Curatable>(
  list: readonly T[],
  count: number,
): T[] {
  const featured = list.filter((item) => item.featured);
  if (featured.length === 0) return list.slice(0, count);

  // `?? 0` matters: a record saved before these fields existed has no
  // `featuredRank` key, and `undefined - undefined` is NaN, which leaves
  // `sort` with an inconsistent comparator and an arbitrary order.
  return [...featured].sort(
    (a, b) => (a.featuredRank ?? 0) - (b.featuredRank ?? 0),
  );
}
