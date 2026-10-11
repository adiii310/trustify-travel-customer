import type { Metadata } from "next";

import CompanyProfile from "@/components/company/CompanyProfile";
import { isTabKey, type TabKey } from "@/lib/tabs";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

/**
 * Metadata is built from the slug alone.
 *
 * The company record is only readable in the browser — every call this app
 * makes is client-side — while metadata is resolved on the server. Rather than
 * show a stale name from a bundled copy, the title is derived from the URL the
 * visitor already followed, which is always about the right company.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    title: `${name} — Verified Travel Company`,
    description: `Trust score, verified reviews, packages and policies for ${name}.`,
  };
}

/**
 * Server shell. The profile reads `GET /companies` and the per-tab endpoints in
 * the browser, so there is no `generateStaticParams` here: the company list is
 * admin-managed and the API is routinely unreachable at build time.
 *
 * `tab` stays a search param so every tab is linkable.
 */
export default async function CompanyPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { tab } = await searchParams;
  const active: TabKey = isTabKey(tab) ? tab : "overview";

  return <CompanyProfile slug={slug} active={active} />;
}
