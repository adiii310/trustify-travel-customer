import Link from "next/link";
import type { CSSProperties } from "react";

import type { Destination } from "@/lib/types";

/**
 * The gradient the tile has always used, with the admin's cover photo layered
 * on top of it when there is one.
 *
 * Stacked rather than swapped on purpose: the gradient stays as the backdrop,
 * so a destination with no photo looks exactly as it did before covers existed,
 * and a photo that is slow or fails to load never leaves a blank tile. The
 * `.d:before` scrim in `pages.css` already darkens the bottom of the tile, so
 * the white label text stays readable over any image.
 */
const tileBackground = (d: Destination): string => {
  const gradient = `linear-gradient(160deg, ${d.c1}, ${d.c2})`;
  return d.coverImage
    ? `url(${JSON.stringify(d.coverImage)}) center / cover no-repeat, ${gradient}`
    : gradient;
};

export default function DestinationCard({ d }: { d: Destination }) {
  return (
    <Link
      className="d"
      href={`/destinations/${d.id}`}
      style={{ "--g": tileBackground(d) } as CSSProperties}
    >
      <b>{d.name}</b>
      <span>{d.companies} Companies</span>
      <span>
        <em>★</em> {d.rating} Avg Rating
      </span>
      <u>Explore →</u>
    </Link>
  );
}
