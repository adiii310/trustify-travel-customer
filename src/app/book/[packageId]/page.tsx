import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import BookingFlow from "@/components/booking/BookingFlow";
import { getCompany } from "@/lib/data/companies";
import { getDestination } from "@/lib/data/destinations";
import { getPackage, packages } from "@/lib/data/packages";

export function generateStaticParams() {
  return packages.map((p) => ({ packageId: p.id }));
}

type Props = { params: Promise<{ packageId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { packageId } = await params;
  const pkg = getPackage(decodeURIComponent(packageId));
  if (!pkg) return { title: "Package not found" };
  return {
    title: `Book ${pkg.title}`,
    description: `Book the ${pkg.title} package with a Trustify Trips verified company.`,
  };
}

export default async function BookPage({ params }: Props) {
  const { packageId } = await params;
  const pkg = getPackage(decodeURIComponent(packageId));
  if (!pkg) notFound();

  const company = getCompany(pkg.companyId);
  const destination = getDestination(pkg.destinationId);
  if (!company || !destination) notFound();

  return (
    <div className="wrap page">
      <div className="crumb mute">
        <Link href="/">Home</Link> ›{" "}
        <Link href={`/destinations/${destination.id}`}>{destination.name}</Link>{" "}
        › <Link href={`/companies/${company.id}`}>{company.name}</Link> › Book
      </div>

      <h1 className="page-title">{pkg.title}</h1>
      <p className="page-sub">
        with {company.name} · Trust Score {company.trustScore}/100 · verified
        since {company.verifiedSince}
      </p>

      <BookingFlow pkg={pkg} company={company} destination={destination} />
    </div>
  );
}
