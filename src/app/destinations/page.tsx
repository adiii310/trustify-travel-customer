import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import DestinationDirectory from "@/components/destination/DestinationDirectory";
import QuerySearch from "@/components/ui/QuerySearch";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Browse every destination covered by verified Trustify Trips travel companies.",
};

/**
 * Server-rendered shell; the grid itself is live API data fetched in the
 * browser by `DestinationDirectory`.
 */
export default function DestinationsPage() {
  return (
    <div className="wrap page">
      <div className="crumb mute">
        <Link href="/">Home</Link> › Destinations
      </div>
      <h1 className="page-title">Destinations</h1>
      <p className="page-sub">
        Every destination covered by companies that cleared our verification.
      </p>

      {/* Both children read `?q=` with `useSearchParams`, which Next requires
          be wrapped in Suspense. */}
      <Suspense fallback={<input className="fi" placeholder="Search destinations" disabled />}>
        <QuerySearch placeholder="Search by name, region or highlight" />
      </Suspense>

      <Suspense fallback={<div className="dest mt-[18px]" />}>
        <DestinationDirectory />
      </Suspense>
    </div>
  );
}
