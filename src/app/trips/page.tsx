import type { Metadata } from "next";
import Link from "next/link";

import TripsDashboard from "@/components/trips/TripsDashboard";

export const metadata: Metadata = {
  title: "My Trips",
  description:
    "Your bookings, saved trip plans and shortlisted travel companies — kept on this device, no account required.",
};

export default function TripsPage() {
  return (
    <div className="wrap page">
      <div className="crumb mute">
        <Link href="/">Home</Link> › My Trips
      </div>
      <div className="lh">
        <div>
          <h1 className="page-title">My Trips</h1>
          <p className="page-sub mb-0">
            Bookings and trip plans are saved on this device. Sign in to tag
            them to a profile.
          </p>
        </div>
        <Link className="btn g" href="/trips/new">
          + Plan a new trip
        </Link>
      </div>
      <TripsDashboard />
    </div>
  );
}
