import type { Metadata } from "next";
import Link from "next/link";

import TrustParameters from "@/components/home/TrustParameters";
import VerifySteps from "@/components/home/VerifySteps";

export const metadata: Metadata = {
  title: "How We Verify",
  description:
    "The verification process and the trust parameters behind every ranking.",
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
        <VerifySteps variant="list" />
      </div>

      <TrustParameters />

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
