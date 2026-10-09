import Link from "next/link";

import { destinations } from "@/lib/data/destinations";
import { SITE } from "@/lib/data/site";

export default function SiteFooter() {
  return (
    <footer className="site">
      <div className="wrap">
        <div className="fcols">
          <div>
            <h4>{SITE.name}</h4>
            <p className="max-w-[280px]">
              We don&apos;t rely on reviews alone. Every company is tested,
              evaluated and verified across 9 trust parameters before it is
              ranked.
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
              {destinations.slice(0, 4).map((d) => (
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
          © {new Date().getFullYear()} {SITE.name} · {SITE.tagline}
        </div>
      </div>
    </footer>
  );
}
