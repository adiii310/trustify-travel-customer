import Link from "next/link";

import CompareButton from "@/components/cards/CompareButton";
import { stars } from "@/lib/format";
import type { Company } from "@/lib/types";

export default function CompanyCard({ c }: { c: Company }) {
  return (
    <div className="c">
      <div className="top">
        <div className="av">{c.initial}</div>
        <div>
          <b>{c.name}</b>
          <br />
          Trust Score
        </div>
      </div>

      <div className="score">
        {c.trustScore}
        <small>/100</small>{" "}
        <span className="stars">{stars(c.rating)}</span>{" "}
        <small>({c.rating})</small>
      </div>

      <div className="meta">
        <div>
          Destinations<b>{c.destinationCount}</b>
        </div>
        <div>
          Verified Since<b>{c.verifiedSince}</b>
        </div>
      </div>

      <div className="acts">
        <Link className="btn g" href={`/companies/${c.id}`}>
          View Details
        </Link>
        <CompareButton companyId={c.id} className="btn o2" />
      </div>
    </div>
  );
}
