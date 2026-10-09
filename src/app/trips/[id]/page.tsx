import type { Metadata } from "next";

import TripDetail from "@/components/trips/TripDetail";

export const metadata: Metadata = {
  title: "Trip Details",
};

type Props = { params: Promise<{ id: string }> };

export default async function TripPage({ params }: Props) {
  const { id } = await params;
  return <TripDetail tripId={id} />;
}
