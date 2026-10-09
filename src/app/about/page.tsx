import type { Metadata } from "next";
import Link from "next/link";

import { TRUST_PARAMETERS } from "@/lib/data/companies";
import { VERIFY_STEPS } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "How We Verify",
  description:
    "The 8-stage process and 9 trust parameters behind every Trustify Trips ranking.",
};

export default function AboutPage() {
  return (
    <div className="wrap page max-w-[820px]">
      <div className="crumb mute">
        <Link href="/">Home</Link> › About
      </div>
      <h1 className="page-title">About Trustify Trips</h1>
      <p className="page-sub">
        We help travellers pick trustworthy travel companies. We don&apos;t rely
        on reviews alone: every company is tested, evaluated and verified before
        it is ranked.
      </p>

      <div className="box">
        <h3>How We Verify</h3>
        {VERIFY_STEPS.map((s, i) => (
          <div className="kv" key={s.title}>
            <b>
              {i + 1}. {s.title}
            </b>
            <span>{s.detail}</span>
          </div>
        ))}
      </div>

      <div className="box">
        <h3>The 9 Trust Parameters</h3>
        <p className="mute mb-2.5">
          Each parameter is scored out of 100. The headline Trust Score is a
          weighted average, re-evaluated at least once a year.
        </p>
        <div className="stk">
          {TRUST_PARAMETERS.map((p) => (
            <span key={p}>
              <i className="ck">✔</i> {p}
            </span>
          ))}
        </div>
      </div>

      <div className="box">
        <h3>What we do not do</h3>
        <div className="stk">
          <span>
            <i className="ck">✕</i> We do not sell ranking positions.
          </span>
          <span>
            <i className="ck">✕</i> We do not publish unverified reviews as
            verified.
          </span>
          <span>
            <i className="ck">✕</i> We do not hide a company&apos;s complaint
            history.
          </span>
        </div>
      </div>

      <Link className="btn g" href="/become-verified">
        Become Verified
      </Link>
    </div>
  );
}
