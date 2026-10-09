import type { Metadata } from "next";
import Link from "next/link";

import AllReviews from "@/components/reviews/AllReviews";

export const metadata: Metadata = {
  title: "Traveller Reviews",
  description:
    "Verified reviews from travellers who booked through Trustify Trips verified companies.",
};

export default function ReviewsPage() {
  return (
    <div className="wrap page">
      <div className="crumb mute">
        <Link href="/">Home</Link> › Reviews
      </div>
      <h1 className="page-title">Traveller Reviews</h1>
      <p className="page-sub">
        Reviews are tied to a real booking wherever possible. Anything written
        on this device appears here too.
      </p>
      <AllReviews />
    </div>
  );
}
