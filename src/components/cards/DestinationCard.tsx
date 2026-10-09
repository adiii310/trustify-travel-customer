import Link from "next/link";
import type { CSSProperties } from "react";

import type { Destination } from "@/lib/types";

export default function DestinationCard({ d }: { d: Destination }) {
  return (
    <Link
      className="d"
      href={`/destinations/${d.id}`}
      style={
        { "--g": `linear-gradient(160deg, ${d.c1}, ${d.c2})` } as CSSProperties
      }
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
