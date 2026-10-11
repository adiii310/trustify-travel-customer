import Link from "next/link";
import type { CSSProperties } from "react";

import { inr } from "@/lib/format";
import {
  AVAILABILITY_LABELS,
  type Company,
  type Destination,
  type Package,
} from "@/lib/types";

/**
 * One package in a destination listing.
 *
 * The cover falls back along the chain the rest of the site uses — the
 * package's own photo, then the destination's, then the destination's gradient
 * — so a card always has a backdrop and none of those steps invents an image.
 *
 * `operator` and `destination` are passed in rather than looked up here: a card
 * renders inside a list, and a lookup per card is the N+1 the caller already
 * avoided by resolving both once.
 */
export default function PackageCard({
  pkg,
  operator,
  destination,
}: {
  pkg: Package;
  /** The company selling it. `undefined` only while the list is still loading. */
  operator?: Company;
  /** The destination it goes to, for the cover fallback and the label. */
  destination?: Destination;
}) {
  const cover =
    pkg.coverImage ||
    destination?.coverImage ||
    "";
  const gradient = destination
    ? `linear-gradient(160deg, ${destination.c1}, ${destination.c2})`
    : "linear-gradient(160deg, #2b4463, #0a1424)";

  const soldOut = pkg.availability === "soldout";

  return (
    <article className="pkc">
      <div
        className="pkc-cover"
        style={
          {
            backgroundImage: cover
              ? `url(${JSON.stringify(cover)}), ${gradient}`
              : gradient,
          } as CSSProperties
        }
      >
        <span className="pkc-dur">
          {pkg.days}D / {pkg.nights}N
        </span>
        <span className={`pkc-avail${soldOut ? " out" : ""}`}>
          {AVAILABILITY_LABELS[pkg.availability]}
        </span>
      </div>

      <div className="pkc-body">
        <h3>
          <Link href={`/packages/${pkg.id}`}>{pkg.title}</Link>
        </h3>

        <div className="pkc-meta">
          📍 {destination?.name ?? pkg.destinationId}
          {operator ? (
            <>
              {" · "}
              <Link href={`/companies/${operator.id}`}>{operator.name}</Link>
            </>
          ) : null}
        </div>

        {pkg.desc ? <p className="pkc-desc">{pkg.desc}</p> : null}

        {pkg.itineraryPdf ? (
          <span className="pkc-meta">📄 Itinerary PDF available</span>
        ) : null}

        <div className="pkc-foot">
          <div>
            <small className="mute">Starting from</small>
            <div className="price">
              {inr(pkg.price)}{" "}
              <small className="text-[12px] font-normal">/ Person</small>
            </div>
          </div>
          <Link className="btn g" href={`/packages/${pkg.id}`}>
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
