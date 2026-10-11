"use client";

import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";
import { useMetrics } from "@/hooks/api";

/**
 * The headline figures across the top of the homepage, managed from the admin
 * panel's Homepage view.
 *
 * The count is not fixed — an admin can add or remove figures — so this renders
 * whatever arrives rather than assuming four. There is no hard-coded fallback:
 * invented round numbers ("450+ Verified Companies") are exactly the kind of
 * thing a visitor reads as a fact about the business.
 */
export default function HeroStats() {
  const { data, isPending } = useMetrics();

  if (isPending) {
    return (
      <SkeletonGroup label="Loading headline figures" className="stats">
        {Array.from({ length: 4 }, (_, i) => (
          <div className="stat" key={i}>
            <Skeleton w={38} h={38} rounded={10} />
            <div className="grid gap-1.5">
              <Skeleton w={64} h={18} />
              <Skeleton w={96} h={11} />
            </div>
          </div>
        ))}
      </SkeletonGroup>
    );
  }

  // Nothing published is a deliberate state — the strip collapses rather than
  // filling itself in.
  if (!data?.length) return null;

  return (
    <div className="stats">
      {data.map((s) => (
        <div className="stat" key={s.id}>
          <div className="ic" aria-hidden="true">
            {s.icon}
          </div>
          <div>
            {/* Display text, never a number — "450+" is deliberate. */}
            <b>{s.value}</b>
            <small>{s.label}</small>
          </div>
        </div>
      ))}
    </div>
  );
}
