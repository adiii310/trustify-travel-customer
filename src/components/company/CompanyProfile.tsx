"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

import CompareButton from "@/components/cards/CompareButton";
import CompanyQA from "@/components/company/CompanyQA";
import CompanyReviews from "@/components/company/CompanyReviews";
import CompanyTabs from "@/components/company/CompanyTabs";
import TrustRadar from "@/components/company/TrustRadar";
import FormButton from "@/components/ui/FormButton";
import {
  PanelSkeleton,
  Skeleton,
  SkeletonGroup,
} from "@/components/ui/Skeleton";
import { cheapest, useCompany, useDestinations, usePackages } from "@/hooks/api";
import { inr, num } from "@/lib/format";
import type { TabKey } from "@/lib/tabs";
import { companyCode, type Company, type Package } from "@/lib/types";

/**
 * A company's public profile, read live.
 *
 * Every tab renders only what the API returned. A company whose `about`,
 * `breakdown`, `docs`, `policies` or `photos` an admin has not filled in shows
 * an explicit "not published yet" rather than generated prose, a flat radar
 * built from the headline score, or a stock document list — each of those
 * reads as a fact about this company and none of them is one.
 */
export default function CompanyProfile({
  slug,
  active,
}: {
  slug: string;
  active: TabKey;
}) {
  const { data: company, isPending, isError, error } = useCompany(slug);
  const code = company ? companyCode(company) : undefined;

  const { data: packages, isPending: packagesPending } = usePackages({
    companyCode: code,
    enabled: Boolean(code),
  });

  if (isPending) return <ProfileSkeleton />;

  if (isError) {
    return (
      <div className="wrap page">
        <h1 className="page-title">Could not load this company</h1>
        <p className="page-sub">{error.message}</p>
        <Link className="btn y" href="/companies">
          Browse all companies
        </Link>
      </div>
    );
  }

  // The list loaded and this slug is not in it — hidden, renamed or never real.
  if (!company) {
    return (
      <div className="wrap page">
        <div className="crumb mute">
          <Link href="/">Home</Link> › <Link href="/companies">Companies</Link>
        </div>
        <h1 className="page-title">Company not found</h1>
        <p className="page-sub">
          This company is no longer listed. Browse the ones we have verified
          instead.
        </p>
        <Link className="btn y" href="/companies">
          Browse all companies
        </Link>
      </div>
    );
  }

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
              <h1>{company.name}</h1>
              {company.city ? <div className="sub">📍 {company.city}</div> : null}
              <div className="sub">
                {company.experience}+ Years Experience |{" "}
                {company.destinationCount}+ Destinations |{" "}
                {num(company.reviewCount)}+ Travellers
              </div>
              <span className="vb">✔ Verified</span>
              {company.tags.map((t) => (
                <span className="vb" key={t}>
                  {t}
                </span>
              ))}
            </div>

            <div className="ts">
              <div>TRUST SCORE 🛡️</div>
              <b>{company.trustScore}</b>
              <span className="text-[22px]">/100</span>
              <div className="text-[18px]">
                {company.trustScore >= 90 ? "Excellent" : "Very Good"}
              </div>
              <div className="stars text-[22px]">★★★★★</div>
              {company.verifiedSince ? (
                <div className="text-[12px]">
                  Verified since {company.verifiedSince}
                </div>
              ) : null}
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
        {active === "overview" && (
          <Overview
            company={company}
            packages={packages}
            packagesPending={packagesPending}
          />
        )}

        {active === "reviews" && (
          <CompanyReviews
            companyId={company.id}
            fallbackRating={company.rating}
            totalVerified={company.reviewCount}
          />
        )}

        {active === "packages" && (
          <PackagesTab
            company={company}
            packages={packages}
            isPending={packagesPending}
          />
        )}

        {active === "destinations" && <DestinationsTab company={company} />}

        {active === "photos" && <PhotosTab company={company} />}

        {active === "documents" && (
          <Panel title="Verified documents">
            {company.documents.length ? (
              <>
                {company.documents.map((d) => (
                  <div className="kv" key={d}>
                    📄 {d}
                    <span className="ver">✔ Verified</span>
                  </div>
                ))}
                {company.verifiedSince ? (
                  <p className="mute mt-3">
                    Documents are re-checked every 12 months. Last check:{" "}
                    {company.verifiedSince}.
                  </p>
                ) : null}
              </>
            ) : (
              <p className="mute">
                No document checks have been published for {company.name} yet.
              </p>
            )}
          </Panel>
        )}

        {active === "policies" && (
          <Panel title="Booking & cancellation policies">
            {company.policies.length ? (
              company.policies.map((p) => (
                <div className="kv" key={p.label}>
                  {p.label}
                  <b>{p.value}</b>
                </div>
              ))
            ) : (
              <p className="mute">
                {company.name} has not published its booking terms here yet.
                Ask them directly before booking.
              </p>
            )}
          </Panel>
        )}

        {active === "qa" && <CompanyQA companyId={company.id} />}
      </div>
    </>
  );
}

/** The `.box` wrapper every simple tab shares. */
function Panel({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="pt-6 pb-10">
      <div className="box">
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}

function Overview({
  company,
  packages,
  packagesPending,
}: {
  company: Company;
  packages: Package[] | undefined;
  packagesPending: boolean;
}) {
  const best = cheapest(packages);

  return (
    <div className="ov">
      <div className="box">
        <h3>Trust Score Breakdown</h3>
        {company.breakdown.length ? (
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
        ) : (
          <p className="mute">
            The per-parameter breakdown behind {company.name}&apos;s score of{" "}
            {company.trustScore}/100 has not been published yet.
          </p>
        )}
      </div>

      <div className="box">
        <h3>About {company.name}</h3>
        {company.about ? <p className="mute mb-2.5">{company.about}</p> : null}
        {company.verifiedSince ? (
          <div className="kv">
            Verified Since<b>{company.verifiedSince}</b>
          </div>
        ) : null}
        <div className="kv">
          Years in Business<b>{company.experience}+ Years</b>
        </div>
        {company.city ? (
          <div className="kv">
            Head Office<b>{company.city}</b>
          </div>
        ) : null}
        <div className="kv">
          Destinations Covered<b>{company.destinationCount}+</b>
        </div>
        <div className="kv">
          Verified Reviews<b>{num(company.reviewCount)}</b>
        </div>
      </div>

      <div>
        {packagesPending ? (
          <PanelSkeleton lines={2} />
        ) : best ? (
          <div className="box">
            <h3>{best.title}</h3>
            Starting from
            <div className="price">
              {inr(best.price)}{" "}
              <small className="text-[13px] font-normal">/ Person</small>
            </div>
            <Link className="btn g w" href={`/book/${best.id}`}>
              Book this trip
            </Link>
            <Link
              className="btn wo w"
              href={`/companies/${company.id}?tab=packages`}
            >
              View all packages
            </Link>
          </div>
        ) : (
          <div className="box">
            <h3>Packages</h3>
            <p className="mute mb-2.5">
              {company.name} has not published any packages here yet.
            </p>
            <FormButton kind="enquiry" companyId={company.id} className="btn g w">
              💬 Ask for current rates
            </FormButton>
          </div>
        )}

        {company.documents.length ? (
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
        ) : null}
      </div>
    </div>
  );
}

function PackagesTab({
  company,
  packages,
  isPending,
}: {
  company: Company;
  packages: Package[] | undefined;
  isPending: boolean;
}) {
  if (isPending) {
    return (
      <SkeletonGroup label="Loading packages" className="pk">
        {Array.from({ length: 3 }, (_, i) => (
          <PanelSkeleton key={i} lines={4} />
        ))}
      </SkeletonGroup>
    );
  }

  if (!packages?.length) {
    return (
      <Panel title="Packages">
        <p className="mute mb-2.5">
          {company.name} has not published any packages here yet. Send them an
          enquiry and they will quote you directly.
        </p>
        <FormButton kind="enquiry" companyId={company.id} className="btn g">
          💬 Enquire
        </FormButton>
      </Panel>
    );
  }

  return (
    <div className="pk">
      {packages.map((p) => (
        <div className="box m-0" key={p.id}>
          <h3>{p.title}</h3>
          <small className="mute">Starting from</small>
          <div className="price">
            {inr(p.price)}{" "}
            <small className="text-[12px] font-normal">/ Person</small>
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
  );
}

function DestinationsTab({ company }: { company: Company }) {
  const { data: destinations, isPending } = useDestinations();

  if (isPending) {
    return (
      <div className="pt-6 pb-10">
        <div className="box">
          <Skeleton w="45%" h={16} className="mb-3 block" />
          <SkeletonGroup label="Loading destinations" className="dest">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} h={170} rounded="var(--radius)" className="block w-full" />
            ))}
          </SkeletonGroup>
        </div>
      </div>
    );
  }

  // `company.destinations` is a list of slugs; the tiles need the full record,
  // which only the destination list has. A slug with no match is skipped rather
  // than rendered as a blank tile.
  const covered = (destinations ?? []).filter((d) =>
    company.destinations.includes(d.id)
  );

  return (
    <Panel title={`Where ${company.name} operates`}>
      {covered.length ? (
        <>
          <p className="mute mb-3">
            {company.destinationCount}+ destinations, including these verified
            routes:
          </p>
          <div className="dest">
            {covered.map((d) => (
              <Link
                key={d.id}
                className="d"
                href={`/destinations/${d.id}`}
                style={
                  {
                    "--g": d.coverImage
                      ? `url(${JSON.stringify(d.coverImage)}) center / cover no-repeat, linear-gradient(160deg, ${d.c1}, ${d.c2})`
                      : `linear-gradient(160deg, ${d.c1}, ${d.c2})`,
                  } as CSSProperties
                }
              >
                <b>{d.name}</b>
                <u>Explore →</u>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <p className="mute">
          The destinations {company.name} covers have not been listed yet.
        </p>
      )}
    </Panel>
  );
}

function PhotosTab({ company }: { company: Company }) {
  return (
    <Panel title="Trip gallery">
      {company.photos.length ? (
        <div className="gal">
          {company.photos.map((src) => (
            // A remote, admin-supplied URL: `next/image` would need every host
            // it might ever use registered in next.config.js.
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" loading="lazy" />
          ))}
        </div>
      ) : (
        <p className="mute">
          {company.name} has not uploaded any trip photos yet.
        </p>
      )}
    </Panel>
  );
}

function ProfileSkeleton() {
  return (
    <>
      <div className="chead">
        <div className="wrap">
          <SkeletonGroup label="Loading company" className="chead-main">
            <Skeleton w={78} h={78} rounded={16} />
            <div className="grid gap-2.5">
              <Skeleton w={240} h={28} />
              <Skeleton w={180} h={13} />
              <Skeleton w={300} h={13} />
            </div>
            <div className="grid gap-2.5">
              <Skeleton w={120} h={13} />
              <Skeleton w={90} h={40} />
              <Skeleton w={140} h={13} />
            </div>
          </SkeletonGroup>
        </div>
      </div>
      <div className="wrap">
        <div className="ov">
          <PanelSkeleton lines={6} />
          <PanelSkeleton lines={5} />
          <PanelSkeleton lines={3} />
        </div>
      </div>
    </>
  );
}
