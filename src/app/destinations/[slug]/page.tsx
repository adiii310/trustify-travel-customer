import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import DestinationResults, {
  type ResultRow,
} from "@/components/destination/DestinationResults";
import FormButton from "@/components/ui/FormButton";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { companiesForDestination } from "@/lib/data/companies";
import { destinations, getDestination } from "@/lib/data/destinations";
import { packages, startingPrice } from "@/lib/data/packages";

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.id }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dest = getDestination(slug);
  if (!dest) return { title: "Destination not found" };
  return {
    title: `${dest.name} — Verified Travel Companies`,
    description: dest.desc,
  };
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const dest = getDestination(slug);
  if (!dest) notFound();

  const list = companiesForDestination(dest.id);
  const rows: ResultRow[] = list.map((company) => ({
    company,
    price: startingPrice(company.id, dest.id),
    nights: packages
      .filter((p) => p.companyId === company.id && p.destinationId === dest.id)
      .map((p) => p.nights),
  }));

  const bestScore = rows.length
    ? Math.max(...rows.map((r) => r.company.trustScore))
    : 0;
  const bestPrice = rows.length ? Math.min(...rows.map((r) => r.price)) : 0;

  return (
    <>
      <div className="hero2">
        <div className="wrap">
          <div>
            <div className="crumb">
              <Link href="/">Home</Link> ›{" "}
              <Link href="/destinations">Destinations</Link> ›{" "}
              <b>{dest.name}</b>
            </div>
            <h1>{dest.name}</h1>
            <div className="sub">📍 {dest.region}</div>
            <p>{dest.desc}</p>
            <div className="chips">
              <span className="chip">📅 Best Time: {dest.bestTime}</span>
              <span className="chip">📶 Difficulty: {dest.difficulty}</span>
              <span className="chip">🕒 Ideal Duration: {dest.duration}</span>
              <span className="chip">💰 Budget: {dest.budget}</span>
            </div>
          </div>

          <div className="glance">
            <h3>At a Glance</h3>
            <div className="gg">
              <div>
                <b>{rows.length}</b>Verified Companies
              </div>
              <div>
                <b>{dest.rating}/5</b>Avg. Rating
              </div>
              <div>
                <b>{bestScore || "–"}/100</b>Best Trust Score
              </div>
              <div>
                <b>
                  {bestPrice ? `₹${bestPrice.toLocaleString("en-IN")}` : "–"}
                </b>
                Starting From
              </div>
            </div>
            <Link
              className="btn y w mt-3.5"
              href={`/trips/new?destination=${dest.id}`}
            >
              Plan my own trip
            </Link>
          </div>
        </div>
      </div>

      <div className="wrap lay">
        <DestinationResults rows={rows} destinationId={dest.id} />

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
