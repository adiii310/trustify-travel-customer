import type { Metadata } from "next";

import BookingDetail from "@/components/account/BookingDetail";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Booking details" };

/** Server shell; the booking itself is private and read with the token. */
export default async function BookingPage({ params }: Props) {
  const { id } = await params;
  return <BookingDetail bookingId={decodeURIComponent(id)} />;
}
