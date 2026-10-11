"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

import FormButton from "@/components/ui/FormButton";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { PanelSkeleton, Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";
import { useCompanies, useDestination, usePackage } from "@/hooks/api";
import { isApiError } from "@/lib/api/errors";
import { attachmentUrl, inr } from "@/lib/format";
import { AVAILABILITY_LABELS, companyCode } from "@/lib/types";

/**
 * One package in full: who sells it, where it goes, what each day looks like,
 * what is and is not included, what it costs and whether it can be booked.
 *
 * Both associations are resolved live. The API validates them on write, so a
 * published package always points at a real company and a real destination —
 * but either can be *hidden* after the fact, which is why each is handled
 * separately rather than assumed.
 */
export default function PackageDetail({ packageId }: { packageId: string }) {
  const { data: pkg, isPending, isError, error } = usePackage(packageId);

  const { data: companies, isPending: companiesPending } = useCompanies();
  const { data: destination, isPending: destinationPending } = useDestination(
    pkg?.destinationId
  );

  if (isPending || companiesPending || destinationPending) {
    return (
      <div className="wrap page">
        <SkeletonGroup label="Loading this package" className="grid gap-4">
          <Skeleton w={340} h={30} />
          <Skeleton w={420} h={14} />
          <PanelSkeleton lines={6} />
        </SkeletonGroup>
      </div>
    );
  }

  if (isError) {
    const missing = isApiError(error) && error.status === 404;
    return (
      <div className="wrap page">
        <div className="crumb mute">
          <Link href="/">Home</Link> ›{" "}
          <Link href="/destinations">Destinations</Link>
        </div>
        <h1 className="page-title">
          {missing ? "This package is no longer available" : "Could not load this package"}
        </h1>
        <p className="page-sub">
          {missing
            ? "It may have been withdrawn since this link was shared. Browse what is on offer now."
            : error.message}
        </p>
        <Link className="btn y" href="/destinations">
          Browse destinations
        </Link>
      </div>
    );
  }

  // Packages carry a company short code, not a slug, and there is no join.
  const operator = (companies ?? []).find(
    (c) => companyCode(c).toUpperCase() === pkg.companyCode.toUpperCase()
  );

  const soldOut = pkg.availability === "soldout";
  // The package's own cover, then the destination's. With neither, the hero
  // keeps the stylesheet's background rather than being given a made-up image.
  const cover = pkg.coverImage || destination?.coverImage || "";

  return (
    <>
      <div
        className="hero2"
        style={
          cover
            ? ({
                backgroundImage:
                  "linear-gradient(90deg, rgba(6,14,28,.92) 10%, rgba(6,14,28,.45) 70%), " +
                  `url(${JSON.stringify(cover)})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              } as CSSProperties)
            : undefined
        }
      >
        <div className="wrap">
          <div>
            <div className="crumb">
              <Link href="/">Home</Link> ›{" "}
              <Link href="/destinations">Destinations</Link> ›{" "}
              {destination ? (
                <Link href={`/destinations/${destination.id}`}>{destination.name}</Link>
              ) : (
                pkg.destinationId
              )}{" "}
              › <b>{pkg.title}</b>
            </div>
            <h1>{pkg.title}</h1>
            <div className="sub">
              📍 {destination?.name ?? pkg.destinationId}
              {operator ? (
                <>
                  {" · "}
                  <Link href={`/companies/${operator.id}`}>{operator.name}</Link>
                </>
              ) : null}
            </div>
            {pkg.desc ? <p>{pkg.desc}</p> : null}
            <div className="chips">
              <span className="chip">
                🕒 {pkg.days}D / {pkg.nights}N
              </span>
              <span className="chip">
                🎟 {AVAILABILITY_LABELS[pkg.availability]}
              </span>
              {operator ? (
                <span className="chip">🛡 Trust Score {operator.trustScore}/100</span>
              ) : null}
            </div>
          </div>

          <div className="glance">
            <h3>Starting from</h3>
            <div className="price">
              {inr(pkg.price)}{" "}
              <small className="text-[13px] font-normal">/ Person</small>
            </div>
            {soldOut ? (
              <p className="mt-2 text-[13px]">
                This departure is sold out. Enquire and the operator will offer
                you the next one.
              </p>
            ) : (
              <Link className="btn y w mt-3.5" href={`/book/${pkg.id}`}>
                Book this trip
              </Link>
            )}
            <FormButton
              kind="enquiry"
              companyId={operator?.id}
              packageTitle={pkg.title}
              className="btn wo w mt-2"
            >
              💬 Enquire about this package
            </FormButton>
          </div>
        </div>
      </div>

      <div className="wrap lay">
        <aside>
          <div className="box">
            <h3>At a glance</h3>
            <div className="kv border-t-0">
              Destination
              <b>{destination?.name ?? pkg.destinationId}</b>
            </div>
            <div className="kv">
              Duration
              <b>
                {pkg.days} days / {pkg.nights} nights
              </b>
            </div>
            <div className="kv">
              Operator<b>{operator?.name ?? pkg.companyCode}</b>
            </div>
            <div className="kv">
              Availability<b>{AVAILABILITY_LABELS[pkg.availability]}</b>
            </div>
            <div className="kv">
              Price<b>{inr(pkg.price)} per person</b>
            </div>
          </div>
        </aside>

        <div>
          {pkg.itinerary.length ? (
            <div className="box">
              <h3>Day by day</h3>
              {pkg.itinerary.map((day) => (
                <div className="pkday" key={day.day}>
                  <b>Day {day.day}</b>
                  <div>
                    {day.title}
                    {day.detail ? <span className="block">{day.detail}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Shown whether or not there is a day-by-day list above: the two are
              independent, and an operator may publish only the document. */}
          {pkg.itineraryPdf ? (
            <div className="box">
              <h3>Full itinerary (PDF)</h3>
              <p className="mute mb-2.5">
                The complete day-by-day plan from {operator?.name ?? "the operator"},
                to read now or keep on your phone for the trip.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <a
                  className="btn g"
                  href={pkg.itineraryPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📄 View itinerary
                </a>
                {/* `fl_attachment` rather than a `download` attribute, which
                    browsers ignore on a cross-origin link. */}
                <a className="btn wo" href={attachmentUrl(pkg.itineraryPdf)}>
                  ⬇ Download PDF
                </a>
              </div>
            </div>
          ) : null}

          {pkg.inclusions.length ? (
            <div className="box">
              <h3>What&apos;s included</h3>
              <div className="stk">
                {pkg.inclusions.map((i) => (
                  <span key={i}>
                    <i className="ck">✔</i> {i}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {pkg.exclusions.length ? (
            <div className="box">
              <h3>Not included</h3>
              <div className="stk">
                {pkg.exclusions.map((e) => (
                  <span key={e}>
                    <i className="ck">✕</i> {e}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <aside>
          {destination ? (
            <div className="box">
              <h3>Compare {destination.name} packages</h3>
              <p className="mute mb-2.5">
                See every verified company running this route, side by side.
              </p>
              <Link className="btn wo w" href={`/destinations/${destination.id}`}>
                All {destination.name} packages
              </Link>
            </div>
          ) : null}

          <div className="box">
            <h3>Questions about this trip?</h3>
            Our travel experts can help you choose.
            <WhatsAppButton />
            <FormButton kind="callback" className="btn wo w">
              📞 Request a Call Back
            </FormButton>
          </div>
        </aside>
      </div>
    </>
  );
}
