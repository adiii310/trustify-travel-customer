import Link from "next/link";

import CompareButton from "@/components/cards/CompareButton";
import { startingPrice } from "@/lib/data/packages";
import { inr, num } from "@/lib/format";
import type { Company } from "@/lib/types";

type Props = {
  c: Company;
  /** Scope the headline price to one destination. */
  destinationId?: string;
  best?: boolean;
};

export default function CompanyRow({ c, destinationId, best }: Props) {
  const price = startingPrice(c.id, destinationId) || c.fromPrice;

  return (
    <div className="row">
      <div className="av">{c.initial}</div>

      <div>
        {best && (
          <>
            <span className="pill">Best Overall</span>
            <br />
          </>
        )}
        <h3>
          <Link href={`/companies/${c.id}`}>{c.name}</Link>
          <span className="ver">✔ Verified</span>
        </h3>
        📍 {c.city} &nbsp; 👤 {c.experience}+ Years Experience
        <br />
        {c.tags.map((t) => (
          <span className="tag" key={t}>
            {t}
          </span>
        ))}
      </div>

      <div>
        Trust Score
        <div className="score">
          🛡 {c.trustScore}
          <small>/100</small>
          <span className="exc">Excellent</span>
        </div>
        <span className="stars">★★★★★</span>
        <br />({c.rating}/5 from {num(c.reviewCount)} reviews)
      </div>

      <div>
        Starting from
        <div className="price">{inr(price)}</div>
        Per Person
        <Link className="btn g w" href={`/companies/${c.id}`}>
          View Full Report
        </Link>
        <CompareButton companyId={c.id} className="btn wo w" />
      </div>
    </div>
  );
}
