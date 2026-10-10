import type { Metadata } from "next";
import Link from "next/link";

import MyBookings from "@/components/account/MyBookings";

export const metadata: Metadata = { title: "My Bookings" };

export default function MyBookingsPage() {
  return (
    <div className="wrap page">
      <div className="crumb mute">
        <Link href="/">Home</Link> › My Bookings
      </div>
      <h1 className="page-title">My Bookings</h1>
      <p className="page-sub">
        Every booking you have requested, and where each one has got to.
      </p>
      <MyBookings />
    </div>
  );
}
