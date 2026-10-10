import Link from "next/link";

import HeroSearch from "@/components/home/HeroSearch";
import HeroStats from "@/components/home/HeroStats";
import PopularDestinations from "@/components/home/PopularDestinations";
import TopCompanies from "@/components/home/TopCompanies";
import TrustBadges from "@/components/home/TrustBadges";
import VerifySteps from "@/components/home/VerifySteps";

/**
 * Page shell. Every block below is a client component reading a live API list
 * and managed from the admin panel; nothing on this page is hard-coded except
 * the headline and the section titles around them.
 */
export default function HomePage() {
  return (
    <>
      <header className="hero">
        <div className="wrap">
          <div>
            <h1>
              Find India&apos;s Most <span>Trusted Travel Companies</span>
            </h1>
            <p>
              Every company is independently reviewed, verified and ranked
              before we recommend it.
            </p>
            <HeroSearch />
            <div className="cta">
              <Link className="btn y" href="/companies">
                Explore Rankings
              </Link>
              <Link className="btn ol" href="/about">
                How We Verify
              </Link>
            </div>
          </div>

          <HeroStats />
        </div>
      </header>

      <div className="wrap">
        <TrustBadges />
      </div>

      <div className="wrap">
        <section>
          <div className="head">
            <h2>Popular Destinations</h2>
            <Link href="/destinations">View All Destinations →</Link>
          </div>
          <PopularDestinations />
        </section>

        <section>
          <div className="verify">
            <div>
              <h2>How We Verify</h2>
              We don&apos;t rely on reviews. We test, evaluate and verify every
              company.
              <br />
              <br />
              <Link className="btn g" href="/about">
                Know Our Process
              </Link>
            </div>
            <VerifySteps />
          </div>
        </section>

        <section>
          <div className="head">
            <h2>Top Rated Companies</h2>
            <Link href="/companies">View All Companies →</Link>
          </div>
          <TopCompanies />
        </section>

        <section className="pb-12">
          <div className="box p-6">
            <div className="lh">
              <div>
                <h3 className="m-0 text-[18px]">
                  Planning something of your own?
                </h3>
                <p className="text-mute mt-1">
                  Build a custom itinerary, save it, and send it to verified
                  companies for quotes. No account needed.
                </p>
              </div>
              <Link className="btn g" href="/trips/new">
                Plan a trip
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
