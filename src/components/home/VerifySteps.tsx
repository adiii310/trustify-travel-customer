"use client";

import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";
import { useSiteContent } from "@/hooks/api";

/**
 * The verification steps, in the two shapes the site renders them:
 *
 *   "chips"   the compact icon + title grid on the homepage
 *   "list"    numbered title + detail rows on /about and /become-verified
 *
 * One admin-managed list behind both, so editing a step updates all three
 * pages. The count is not fixed at eight — it renders what it is given.
 */
export default function VerifySteps({
  variant = "chips",
}: {
  variant?: "chips" | "list";
}) {
  const { data, isPending } = useSiteContent();

  if (isPending) {
    return variant === "chips" ? (
      <SkeletonGroup label="Loading verification steps" className="steps">
        {Array.from({ length: 8 }, (_, i) => (
          <div className="step" key={i}>
            <Skeleton w={70} h={12} />
          </div>
        ))}
      </SkeletonGroup>
    ) : (
      <SkeletonGroup label="Loading verification steps">
        {Array.from({ length: 8 }, (_, i) => (
          <div className="kv" key={i}>
            <Skeleton w={160} h={13} />
            <Skeleton w="55%" h={12} />
          </div>
        ))}
      </SkeletonGroup>
    );
  }

  if (!data?.steps.length) return null;

  if (variant === "chips") {
    return (
      <div className="steps">
        {data.steps.map((s) => (
          <div className="step" key={s.id}>
            <i aria-hidden="true">{s.icon}</i>
            {s.title}
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {data.steps.map((s, i) => (
        <div className="kv" key={s.id}>
          <b>
            {i + 1}. {s.title}
          </b>
          <span>{s.body}</span>
        </div>
      ))}
    </>
  );
}
