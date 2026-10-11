"use client";

import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";
import { useSiteContent } from "@/hooks/api";

/** The strip of verification claims under the homepage hero. Admin-managed. */
export default function TrustBadges() {
  const { data, isPending } = useSiteContent();

  if (isPending) {
    return (
      <SkeletonGroup label="Loading verification badges" className="badges">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i}>
            <Skeleton w={110} h={13} />
          </span>
        ))}
      </SkeletonGroup>
    );
  }

  if (!data?.badges.length) return null;

  return (
    <div className="badges">
      {data.badges.map((b) => (
        <span key={b.id}>
          <i aria-hidden="true">{b.icon}</i>
          {b.title}
        </span>
      ))}
    </div>
  );
}
