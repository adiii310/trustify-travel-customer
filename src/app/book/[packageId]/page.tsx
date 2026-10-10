import type { Metadata } from "next";

import BookingPage from "@/components/booking/BookingPage";

type Props = { params: Promise<{ packageId: string }> };

export const metadata: Metadata = {
  title: "Book a trip",
  description: "Book a package with a verified travel company.",
};

/**
 * Server shell. The package, its company and its destination are all read live
 * in the browser, so there is no `generateStaticParams`: packages are
 * admin-managed and the set changes without a deploy.
 */
export default async function BookPage({ params }: Props) {
  const { packageId } = await params;
  return <BookingPage packageId={decodeURIComponent(packageId)} />;
}
