"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

import DestinationPackages from "@/components/destination/DestinationPackages";
import FormButton from "@/components/ui/FormButton";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { PanelSkeleton, Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";
import { useDestinationDetail, usePackages } from "@/hooks/api";
import { isApiError } from "@/lib/api/errors";
import { cheapest } from "@/hooks/api";
import type { Company, Destination } from "@/lib/types";

/**
 * The destination page, read live from `GET /destinations/:slug`.
 *
 * A client component because it reads a query hook: the companies shown here
 * are the ones an admin ticked on each company record, and that relation only
 * exists server-side. The page shell around it stays a server component.
 */
export default function DestinationDetail({ slug }: { slug: string }) {
  const { data, isPending, isError, error } = useDestinationDetail(slug);

  if (isPending) return <DetailSkeleton />;

  if (isError) {
    // A 404 is the specific, expected failure: an admin can hide a destination
    // while people still hold links to it. Everything else is a fetch problem.
    const missing = isApiError(error) && error.status === 404;
    return (
      <div className="wrap page">
        <div className="crumb mute">
          <Link href="/">Home</Link> › <Link href="/destinations">Destinations</Link>
        </div>
        <h1 className="page-title">
          {missing ? "Destination not found" : "Could not load this destination"}
        </h1>
        <p className="page-sub">
          {missing
            ? "This destination is no longer listed. Browse the ones we cover instead."
            : error.message}
        </p>
        <Link className="btn y" href="/destinations">
          Browse all destinations
        </Link>
      </div>
    );
  }

  return <DestinationBody dest={data.destination} companies={data.companies} />;
}

function DetailSkeleton() {
  return (
    <>
      <div className="hero2">
        <div className="wrap">
          <SkeletonGroup label="Loading destination" className="grid gap-3">
            <Skeleton w={260} h={40} />
            <Skeleton w={160} h={13} />
            <Skeleton w={420} h={13} />
            <Skeleton w={380} h={13} />
          </SkeletonGroup>
          <div className="glance">
            <Skeleton w={120} h={15} className="mb-3 block" />
            <Skeleton w="100%" h={80} />
          </div>
        </div>
      </div>
      <div className="wrap lay">
        <aside>
          <PanelSkeleton lines={6} />
        </aside>
        <SkeletonGroup label="Loading packages" className="pkgrid">
          <PanelSkeleton lines={3} />
          <PanelSkeleton lines={3} />
        </SkeletonGroup>
        <aside>
          <PanelSkeleton lines={4} />
        </aside>
      </div>
    </>
  );
}

function DestinationBody({
  dest,
  companies,
}: {
  dest: Destination;
  companies: Company[];
}) {
  // The same request `DestinationPackages` makes, so this is one cached read
  // rather than two: "At a Glance" quotes the cheapest package, and the server
  // already sorted them ascending.
  const { data: packages } = usePackages({ destinationSlug: dest.id });

  const bestScore = companies.length
    ? Math.max(...companies.map((c) => c.trustScore))
    : 0;
  const bestPrice = cheapest(packages)?.price ?? 0;


  return (
    <>
      <div
        className="hero2"
        style={
          // With no cover photo this is omitted entirely and the hero keeps the
          // stylesheet's own background. With one, only the decorative second
          // layer is replaced — the dark scrim in front of it is unchanged, so
          // the heading and chips stay readable over any image.
          dest.coverImage
            ? ({
                backgroundImage:
                  "linear-gradient(90deg, rgba(6,14,28,.92) 10%, rgba(6,14,28,.45) 70%), " +
                  `url(${JSON.stringify(dest.coverImage)})`,
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
              <Link href="/destinations">Destinations</Link> › <b>{dest.name}</b>
            </div>
            <h1>{dest.name}</h1>
            <div className="sub">📍 {dest.region}</div>
            <p>{dest.desc}</p>
            {/* A chip is rendered only when it has a value — "Best Time: —"
                reads as an answer and is not one. */}
            <div className="chips">
              {dest.bestTime ? <span className="chip">📅 Best Time: {dest.bestTime}</span> : null}
              {dest.difficulty ? <span className="chip">📶 Difficulty: {dest.difficulty}</span> : null}
              {dest.duration ? <span className="chip">🕒 Ideal Duration: {dest.duration}</span> : null}
              {dest.budget ? <span className="chip">💰 Budget: {dest.budget}</span> : null}
            </div>
          </div>

          <div className="glance">
            <h3>At a Glance</h3>
            <div className="gg">
              <div>
                <b>{companies.length}</b>Verified Companies
              </div>
              <div>
                <b>{dest.rating}/5</b>Avg. Rating
              </div>
              <div>
                <b>{bestScore || "–"}/100</b>Best Trust Score
              </div>
              <div>
                <b>{bestPrice ? `₹${bestPrice.toLocaleString("en-IN")}` : "–"}</b>
                Starting From
              </div>
            </div>
            <Link className="btn y w mt-3.5" href={`/trips/new?destination=${dest.id}`}>
              Plan my own trip
            </Link>
          </div>
        </div>
      </div>

      <div className="wrap lay">
        <DestinationPackages destination={dest} companies={companies} />

        <aside>
          <div className="box">
            <h3>Why Trust These Rankings?</h3>
            <div className="stk">
              {[
                "9 Parameters Evaluation",
                "Company Background Check",
                "Package & Itinerary Analysis",
                "Mystery Booking & Experience",
                "Customer Reviews Verified",
                "Regular Re-evaluation",
              ].map((item) => (
                <span key={item}>
                  <i className="ck">✔</i> {item}
                </span>
              ))}
            </div>
          </div>

          {dest.highlights.length ? (
            <div className="box">
              <h3>Highlights</h3>
              <div className="stk">
                {dest.highlights.map((h) => (
                  <span key={h}>
                    <i className="ck">📍</i> {h}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="box">
            <h3>Need Help Choosing?</h3>
            Our travel experts are here to help you.
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
