"use client";

import { PanelSkeleton } from "@/components/ui/Skeleton";
import { useSiteContent } from "@/hooks/api";

/**
 * The parameters every company is scored on, listed on /about.
 *
 * The heading counts the live list rather than saying "The 9 Trust Parameters":
 * the list is admin-managed, so a hard-coded nine would be wrong the moment
 * someone adds a tenth. It is also the same vocabulary a company's own
 * `breakdown` uses, which is why both are edited in the admin panel.
 */
export default function TrustParameters() {
  const { data, isPending } = useSiteContent();

  if (isPending) return <PanelSkeleton lines={5} />;
  if (!data?.trustParameters.length) return null;

  return (
    <div className="box">
      <h3>The {data.trustParameters.length} Trust Parameters</h3>
      <p className="mute mb-2.5">
        Each parameter is scored out of 100. The headline Trust Score is a
        weighted average, re-evaluated at least once a year.
      </p>
      <div className="stk">
        {data.trustParameters.map((p) => (
          <span key={p.id}>
            <i className="ck">✔</i> {p.title}
          </span>
        ))}
      </div>
    </div>
  );
}
