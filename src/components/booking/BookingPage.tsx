"use client";

import Link from "next/link";

import BookingFlow from "@/components/booking/BookingFlow";
import { PanelSkeleton, Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";
import { useCompanies, useDestination, usePackage } from "@/hooks/api";
import { isApiError } from "@/lib/api/errors";
import { companyCode } from "@/lib/types";
import { useAccountStore } from "@/store/accountStore";

/**
 * Resolves a shared `/book/<id>` link into the three records the flow needs.
 *
 * All three are read live, and all three can legitimately be missing: a package
 * can be unpublished after the link was shared, and its company or destination
 * can be hidden independently. Each case says so rather than rendering a
 * booking form with blanks in it — a form that quotes a price it does not have
 * is the worst possible version of this page.
 */
export default function BookingPage({ packageId }: { packageId: string }) {
  const token = useAccountStore((s) => s.token);

  const {
    data: pkg,
    isPending: packagePending,
    isError: packageFailed,
    error: packageError,
  } = usePackage(packageId);

  const { data: companies, isPending: companiesPending } = useCompanies();
  const { data: destination, isPending: destinationPending } = useDestination(
    pkg?.destinationId
  );

  // Booking needs an account, so an anonymous visitor is sent to sign in with
  // this page as `?next=` — they land straight back here afterwards rather
  // than on a dashboard, having lost the trip they were looking at.
  if (!token) {
    const next = encodeURIComponent(`/book/${packageId}`);
    return (
      <div className="wrap page">
        <div className="crumb mute">
          <Link href="/">Home</Link> ›{" "}
          <Link href="/destinations">Destinations</Link> › Book
        </div>
        <h1 className="page-title">Sign in to request this booking</h1>
        <p className="page-sub">
          Your bookings live in your account so you can track them. It takes a
          moment, and no payment is taken here.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <Link className="btn g" href={`/account/login?next=${next}`}>
            Sign in
          </Link>
          <Link className="btn wo" href={`/account/register?next=${next}`}>
            Create an account
          </Link>
        </div>
      </div>
    );
  }

  if (packagePending || companiesPending || destinationPending) {
    return (
      <div className="wrap page">
        <SkeletonGroup label="Loading this package" className="grid gap-4">
          <Skeleton w={320} h={30} />
          <Skeleton w={420} h={14} />
          <PanelSkeleton lines={5} />
        </SkeletonGroup>
      </div>
    );
  }

  if (packageFailed) {
    const missing = isApiError(packageError) && packageError.status === 404;
    return (
      <Unavailable
        title={missing ? "This package is no longer available" : "Could not load this package"}
        detail={
          missing
            ? "It may have been withdrawn since this link was shared. Browse what the company offers now."
            : packageError.message
        }
      />
    );
  }

  // Packages carry a company short code, not a slug, and there is no join.
  const company = (companies ?? []).find(
    (c) => companyCode(c).toUpperCase() === pkg.companyCode.toUpperCase()
  );

  if (!company) {
    return (
      <Unavailable
        title="This company is not currently listed"
        detail="The package exists but the company behind it is not published right now, so we cannot show you a booking page for it."
      />
    );
  }

  if (!destination) {
    return (
      <Unavailable
        title="This destination is not currently listed"
        detail={`${company.name} offers this package, but the destination is not published right now.`}
      />
    );
  }

  return (
    <div className="wrap page">
      <div className="crumb mute">
        <Link href="/">Home</Link> ›{" "}
        <Link href={`/destinations/${destination.id}`}>{destination.name}</Link>{" "}
        › <Link href={`/companies/${company.id}`}>{company.name}</Link> › Book
      </div>

      <h1 className="page-title">{pkg.title}</h1>
      <p className="page-sub">
        with {company.name} · Trust Score {company.trustScore}/100
        {company.verifiedSince ? ` · verified since ${company.verifiedSince}` : ""}
      </p>

      <BookingFlow pkg={pkg} company={company} destination={destination} />
    </div>
  );
}

function Unavailable({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="wrap page">
      <div className="crumb mute">
        <Link href="/">Home</Link> › <Link href="/companies">Companies</Link>
      </div>
      <h1 className="page-title">{title}</h1>
      <p className="page-sub">{detail}</p>
      <Link className="btn y" href="/companies">
        Browse verified companies
      </Link>
    </div>
  );
}
