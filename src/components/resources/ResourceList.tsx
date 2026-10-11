"use client";

import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";
import { useSiteContent } from "@/hooks/api";

/** The /resources accordion. Each entry is an admin-managed question + answer. */
export default function ResourceList() {
  const { data, isPending, isError, error } = useSiteContent();

  if (isPending) {
    return (
      <SkeletonGroup label="Loading travel resources">
        {Array.from({ length: 6 }, (_, i) => (
          <details key={i}>
            <summary>
              <Skeleton w={`${50 + ((i * 7) % 30)}%`} h={13} />
            </summary>
          </details>
        ))}
      </SkeletonGroup>
    );
  }

  if (isError) return <div className="empty">{error.message}</div>;

  if (!data.resources.length) {
    return <div className="empty">No guides have been published yet.</div>;
  }

  return (
    <>
      {data.resources.map((r) => (
        <details key={r.id}>
          <summary>{r.title}</summary>
          <p>{r.body}</p>
        </details>
      ))}
    </>
  );
}
