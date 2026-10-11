import type { Metadata } from "next";

import PackageDetail from "@/components/packages/PackageDetail";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Package details",
  description:
    "Itinerary, inclusions, pricing and availability for a verified travel package.",
};

/**
 * Server shell. The package, its destination and its company are read live in
 * the browser — packages are admin-managed and the set changes without a
 * deploy, so there is no `generateStaticParams`.
 */
export default async function PackagePage({ params }: Props) {
  const { id } = await params;
  return <PackageDetail packageId={decodeURIComponent(id)} />;
}
