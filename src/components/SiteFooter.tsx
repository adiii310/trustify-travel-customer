"use client";

import Link from "next/link";

import { useDestinations, useSiteSettings } from "@/hooks/api";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * A client component because the brand name and the "Popular" column are both
 * live: the destinations listed there are the first four the API returns, in
 * its own coverage order, not a hard-coded shortlist.
 */
export default function SiteFooter() {
  const { data: settings } = useSiteSettings();
  const { data: destinations, isPending } = useDestinations();

  const popular = (destinations ?? []).slice(0, 4);
  const name = settings?.name ?? "";

  return (
    <footer className="site">
      <div className="wrap">
        <div className="fcols">
          <div>
            <h4>{name || <Skeleton w={130} h={15} />}</h4>
            <p className="max-w-[280px]">
              We don&apos;t rely on reviews alone. Every company is tested,
              evaluated and verified before it is ranked.
            </p>
          </div>

          <div>
            <h4>Explore</h4>
            <ul>
              <li>
                <Link href="/destinations">Destinations</Link>
              </li>
              <li>
                <Link href="/companies">Verified Companies</Link>
              </li>
              <li>
                <Link href="/compare">Compare</Link>
              </li>
              <li>
                <Link href="/trips">My Trips</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Popular</h4>
            <ul>
              {isPending
                ? Array.from({ length: 4 }, (_, i) => (
                    <li key={i}>
                      <Skeleton w={90} h={12} />
                    </li>
                  ))
                : popular.map((d) => (
                    <li key={d.id}>
                      <Link href={`/destinations/${d.id}`}>{d.name}</Link>
                    </li>
                  ))}
            </ul>
          </div>

          <div>
            <h4>Company</h4>
            <ul>
              <li>
                <Link href="/about">How We Verify</Link>
              </li>
              <li>
                <Link href="/resources">Travel Resources</Link>
              </li>
              <li>
                <Link href="/reviews">Traveller Reviews</Link>
              </li>
              <li>
                <Link href="/become-verified">Become Verified</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="fbot">
          © {new Date().getFullYear()}
          {name ? ` ${name}` : ""}
          {settings?.tagline ? ` · ${settings.tagline}` : ""}
        </div>
      </div>
    </footer>
  );
}
