import type { Metadata } from "next";
import Link from "next/link";

import FormButton from "@/components/ui/FormButton";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import VerifySteps from "@/components/home/VerifySteps";

export const metadata: Metadata = {
  title: "Become a Verified Company",
  description:
    "Apply to have your travel company verified and ranked on Trustify Trips.",
};

export default function BecomeVerifiedPage() {
  return (
    <div className="wrap page max-w-[820px]">
      <div className="crumb mute">
        <Link href="/">Home</Link> › Become Verified
      </div>
      <h1 className="page-title">Become a Verified Company</h1>
      <p className="page-sub">
        Verification takes about three weeks end to end. There is no fee to
        apply and no way to pay for a higher ranking.
      </p>

      <div className="box">
        <h3>What the process looks like</h3>
        <VerifySteps variant="list" />
      </div>

      <div className="box">
        <h3>What you will need</h3>
        <div className="stk">
          <span>
            <i className="ck">✔</i> GST certificate and company registration
          </span>
          <span>
            <i className="ck">✔</i> State tourism licence, where applicable
          </span>
          <span>
            <i className="ck">✔</i> Public liability or traveller insurance
          </span>
          <span>
            <i className="ck">✔</i> Three sample itineraries with full pricing
          </span>
          <span>
            <i className="ck">✔</i> Contact details for two past travellers
          </span>
        </div>
      </div>

      <div className="box">
        <h3>Start your application</h3>
        <p className="mute mb-2.5">
          Send us the basics and our verification team will reply within three
          working days.
        </p>
        <FormButton kind="apply" className="btn g w">
          Apply for verification
        </FormButton>
        <WhatsAppButton
          className="btn wo w"
          message="Hi Trustify Trips, I would like to get my travel company verified."
        >
          💬 Talk to the verification team
        </WhatsAppButton>
      </div>
    </div>
  );
}
