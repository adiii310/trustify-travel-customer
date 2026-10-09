import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import TripPlanner from "@/components/trips/TripPlanner";

export const metadata: Metadata = {
  title: "Plan a Trip",
  description:
    "Build your own itinerary, set a budget, and send it to verified travel companies for quotes.",
};

export default function NewTripPage() {
  return (
    <div className="wrap page">
      <div className="crumb mute">
        <Link href="/">Home</Link> › <Link href="/trips">My Trips</Link> › Plan
      </div>
      <h1 className="page-title">Plan your trip</h1>
      <p className="page-sub">
        Set the basics and we&apos;ll shortlist verified companies that run that
        route. Nothing here needs an account.
      </p>
      <Suspense fallback={<div className="empty">Loading planner…</div>}>
        <TripPlanner />
      </Suspense>
    </div>
  );
}
