import type { Metadata } from "next";

import DestinationDetail from "@/components/destination/DestinationDetail";

type Props = { params: Promise<{ slug: string }> };

/**
 * Metadata is derived from the slug.
 *
 * There is no `generateStaticParams` and no bundled copy of the destination
 * list: destinations are admin-managed, the set changes without a deploy, and
 * the API is routinely unreachable during `next build`. The slug the visitor
 * followed is always about the right destination, which a stale cached name
 * would not be.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  return {
    title: `${name} — Verified Travel Companies`,
    description: `Verified travel companies covering ${name}, ranked by trust score.`,
  };
}

/** Server shell; the page itself reads `GET /destinations/:slug` in the browser. */
export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  return <DestinationDetail slug={slug} />;
}
