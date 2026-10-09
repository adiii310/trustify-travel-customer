import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import CompanyQA from "@/components/company/CompanyQA";
import CompanyReviews from "@/components/company/CompanyReviews";
import CompanyTabs from "@/components/company/CompanyTabs";
import TrustRadar from "@/components/company/TrustRadar";
import CompareButton from "@/components/cards/CompareButton";
import FormButton from "@/components/ui/FormButton";
import { companies, getCompany } from "@/lib/data/companies";
import { destinations, getDestination } from "@/lib/data/destinations";
import { packagesForCompany } from "@/lib/data/packages";
import { inr, num } from "@/lib/format";
import { isTabKey, type TabKey } from "@/lib/tabs";
import type { Company } from "@/lib/types";

export function generateStaticParams() {
  return companies.map((c) => ({ slug: c.id }));
}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = getCompany(slug);
  if (!company) return { title: "Company not found" };
  return {
    title: `${company.name} — Trust Score ${company.trustScore}/100`,
    description: company.about,
  };
}

export default async function CompanyPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { tab } = await searchParams;
  const company = getCompany(slug);
  if (!company) notFound();

  const active: TabKey = isTabKey(tab) ? tab : "overview";
  const pkgs = packagesForCompany(company.id);

  return (
    <>
      <div className="chead">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Home</Link> ›{" "}
            <Link href="/companies">Companies</Link> › <b>{company.name}</b>
          </div>

          <div className="chead-main">
            <div className="big">{company.initial}</div>

            <div>
              <div className="gold">🛡️ Gold Verified Company</div>
              <h1>{company.name}</h1>
              <div className="sub">📍 {company.city}</div>
              <div className="sub">
                {company.experience}+ Years Experience |{" "}
                {company.destinationCount}+ Destinations |{" "}
                {num(company.reviewCount)}+ Travellers
              </div>
              <span className="vb">✔ Verified</span>
              <span className="vb">🛡 Background Checked</span>
              <span className="vb">🛡 Service Tested</span>
            </div>

            <div className="ts">
              <div>TRUST SCORE 🛡️</div>
              <b>{company.trustScore}</b>
              <span className="text-[22px]">/100</span>
              <div className="text-[18px]">
                {company.trustScore >= 90 ? "Excellent" : "Very Good"}
              </div>
              <div className="stars text-[22px]">
                ★★★★★
              </div>
              <div className="text-[12px]">
                Verified since {company.verifiedSince}
              </div>
              <CompareButton
                companyId={company.id}
                className="btn"
                goToCompare
                label="Compare Company"
              />
            </div>
          </div>
        </div>
      </div>

      <CompanyTabs
        companyId={company.id}
        active={active}
        reviewCount={company.reviewCount}
      />

      <div className="wrap">
        {active === "overview" && <Overview company={company} />}

        {active === "reviews" && (
          <CompanyReviews
            companyId={company.id}
            fallbackRating={company.rating}
            totalVerified={company.reviewCount}
          />
        )}

        {active === "packages" && (
          <div className="pk">
            {pkgs.map((p) => (
              <div className="box m-0" key={p.id}>
                <h3>{p.title}</h3>
                <small className="mute">Starting from</small>
                <div className="price">
                  {inr(p.price)}{" "}
                  <small className="text-[12px] font-normal">
                    / Person
                  </small>
                </div>
                <ul>
                  {p.inclusions.slice(0, 4).map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
                <Link className="btn g w" href={`/book/${p.id}`}>
                  Book this trip
                </Link>
                <FormButton
                  kind="enquiry"
                  companyId={company.id}
                  packageTitle={p.title}
                  className="btn wo w"
                >
                  💬 Enquire
                </FormButton>
              </div>
            ))}
          </div>
        )}

        {active === "destinations" && (
          <div className="pt-6 pb-10">
            <div className="box">
              <h3>Where {company.name} operates</h3>
              <p className="mute mb-3">
                {company.destinationCount}+ destinations, including these
                verified routes:
              </p>
              <div className="dest">
                {company.destinations.map((id) => {
                  const d = getDestination(id);
                  if (!d) return null;
                  return (
                    <Link
                      key={id}
                      className="d"
                      href={`/destinations/${d.id}`}
                      style={
                        {
                          "--g": `linear-gradient(160deg, ${d.c1}, ${d.c2})`,
                        } as CSSProperties
                      }
                    >
                      <b>{d.name}</b>
                      <u>Explore →</u>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {active === "photos" && (
          <div className="pt-6 pb-10">
            <div className="box">
              <h3>Trip gallery</h3>
              <p className="mute mb-3">
                Photos submitted by travellers who booked with {company.name}.
              </p>
              <div className="dest">
                {destinations.slice(0, 6).map((d) => (
                  <div
                    className="d"
                    key={d.id}
                    style={
                      {
                        "--g": `linear-gradient(160deg, ${d.c1}, ${d.c2})`,
                      } as CSSProperties
                    }
                  >
                    <b>{d.name}</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {active === "documents" && (
          <div className="pt-6 pb-10">
            <div className="box">
              <h3>Verified documents</h3>
              {company.documents.map((d) => (
                <div className="kv" key={d}>
                  📄 {d}
                  <span className="ver">✔ Verified</span>
                </div>
              ))}
              <p className="mute mt-3">
                Documents are re-checked every 12 months. Last check:{" "}
                {company.verifiedSince}.
              </p>
            </div>
          </div>
        )}

        {active === "policies" && (
          <div className="pt-6 pb-10">
            <div className="box">
              <h3>Booking &amp; cancellation policies</h3>
              {company.policies.map((p) => (
                <div className="kv" key={p.label}>
                  {p.label}
                  <b>{p.value}</b>
                </div>
              ))}
            </div>
          </div>
        )}

        {active === "qa" && <CompanyQA companyId={company.id} />}
      </div>
    </>
  );
}

function Overview({ company }: { company: Company }) {
  const pkgs = packagesForCompany(company.id);
  const cheapest = pkgs.reduce(
    (best, p) => (!best || p.price < best.price ? p : best),
    pkgs[0]
  );

  return (
    <div className="ov">
      <div className="box">
        <h3>Trust Score Breakdown</h3>
        <div className="bd">
          <TrustRadar data={company.breakdown} />
          <ul>
            {company.breakdown.map((b) => (
              <li key={b.label}>
                {b.label}
                <b>{b.score}/100</b>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="box">
        <h3>About {company.name}</h3>
        <p className="mute mb-2.5">
          {company.about}
        </p>
        <div className="kv">
          Verified Since<b>{company.verifiedSince}</b>
        </div>
        <div className="kv">
          Years in Business<b>{company.experience}+ Years</b>
        </div>
        <div className="kv">
          Head Office<b>{company.city}</b>
        </div>
        <div className="kv">
          Service Availability<b>24x7</b>
        </div>
        <div className="kv">
          Destinations Covered<b>{company.destinationCount}+</b>
        </div>
        <div className="kv">
          Verified Reviews<b>{num(company.reviewCount)}</b>
        </div>
      </div>

      <div>
        {cheapest && (
          <div className="box">
            <h3>{cheapest.title}</h3>
            Starting from
            <div className="price">
              {inr(cheapest.price)}{" "}
              <small className="text-[13px] font-normal">/ Person</small>
            </div>
            <Link className="btn g w" href={`/book/${cheapest.id}`}>
              Book this trip
            </Link>
            <Link
              className="btn wo w"
              href={`/companies/${company.id}?tab=packages`}
            >
              View all packages
            </Link>
          </div>
        )}

        <div className="box">
          <div className="lh">
            <h3 className="m-0">Verified Documents</h3>
            <Link
              href={`/companies/${company.id}?tab=documents`}
              className="text-green"
            >
              View All
            </Link>
          </div>
          {company.documents.slice(0, 3).map((d) => (
            <div className="kv" key={d}>
              📄 {d}
              <span className="ver">✔ Verified</span>
            </div>
          ))}
        </div>

        <div className="box">
          <h3>Talk to {company.name}</h3>
          <FormButton kind="enquiry" companyId={company.id} className="btn g w">
            💬 Send an enquiry
          </FormButton>
          <FormButton kind="callback" className="btn wo w">
            📞 Request a call back
          </FormButton>
        </div>
      </div>
    </div>
  );
}
