import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import CompanyDirectory from "@/components/companies/CompanyDirectory";
import QuerySearch from "@/components/ui/QuerySearch";

export const metadata: Metadata = {
  title: "Verified Companies",
  description:
    "Every travel company on Trustify Trips, ranked by a Trust Score built from 9 independently checked parameters.",
};

/**
 * The page shell stays a server component so the title, description and
 * metadata are still rendered statically. The ranking itself is live API data,
 * which has to be fetched client-side — see `CompanyDirectory`.
 */
export default function CompaniesPage() {
  return (
    <div className="wrap page">
      <div className="crumb mute">
        <Link href="/">Home</Link> › Companies
      </div>
      <h1 className="page-title">Verified Companies</h1>
      <p className="page-sub">
        Ranked by Trust Score. Every listing has cleared document checks, a
        background check and a mystery booking.
      </p>

      {/* Both children read `?q=` / `?sort=` with `useSearchParams`, which Next
          requires be wrapped in Suspense. */}
      <Suspense fallback={<input className="fi" placeholder="Search companies" disabled />}>
        <QuerySearch placeholder="Search by company, city or destination" />
      </Suspense>

      <Suspense fallback={<div className="lh mt-4"><h2>Loading companies…</h2></div>}>
        <CompanyDirectory />
      </Suspense>
    </div>
  );
}
