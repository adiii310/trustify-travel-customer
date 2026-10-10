/**
 * Loading placeholders.
 *
 * These exist because the site no longer ships a static catalogue to render
 * while a request is in flight. Showing a plausible-looking company that then
 * silently changes into a different one is worse than showing nothing, so the
 * shapes here deliberately read as "not loaded" — no names, no numbers, no
 * content that could be mistaken for an answer.
 *
 * Every skeleton mirrors the real element's box so the page does not jump when
 * the data lands, and carries `aria-hidden` with a live-region message on the
 * wrapper, so a screen reader hears "Loading…" once rather than a dozen empty
 * boxes.
 *
 * Plain module, not `"use client"` — these hold no state and are rendered from
 * both server and client components.
 */

import type { CSSProperties } from "react";

import { cx } from "@/lib/format";

/** One shimmering block. `w` and `h` accept any CSS length. */
export function Skeleton({
  w,
  h = 14,
  className,
  rounded = 6,
}: {
  w?: number | string;
  h?: number | string;
  className?: string;
  rounded?: number | string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cx("sk", className)}
      style={
        {
          width: typeof w === "number" ? `${w}px` : w,
          height: typeof h === "number" ? `${h}px` : h,
          borderRadius: typeof rounded === "number" ? `${rounded}px` : rounded,
        } as CSSProperties
      }
    />
  );
}

/**
 * Wraps a set of skeletons and announces them once.
 *
 * `role="status"` with `aria-busy` is what makes a screen reader say
 * "Loading destinations" instead of reading the decorative boxes.
 */
export function SkeletonGroup({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className={className}>
      {children}
    </div>
  );
}

/** Matches `.d` — the 170px destination tile. */
export function DestinationCardSkeleton() {
  return <Skeleton h={170} rounded="var(--radius)" className="block w-full" />;
}

/** Matches `.c` — a company card in the homepage strip and the directory. */
export function CompanyCardSkeleton() {
  return (
    <div className="c">
      <Skeleton w={54} h={54} rounded={12} />
      <div className="mt-3 grid gap-2">
        <Skeleton w="70%" h={16} />
        <Skeleton w="45%" h={12} />
        <Skeleton w="90%" h={12} />
        <Skeleton w="60%" h={12} />
      </div>
    </div>
  );
}

/** Matches `.row` — a company result row on a destination page. */
export function CompanyRowSkeleton() {
  return (
    <div className="row">
      <Skeleton w={56} h={56} rounded={12} />
      <div className="grid gap-2">
        <Skeleton w="55%" h={16} />
        <Skeleton w="35%" h={12} />
        <Skeleton w="75%" h={12} />
      </div>
      <div className="grid gap-2">
        <Skeleton w={90} h={12} />
        <Skeleton w={70} h={22} />
      </div>
      <div className="grid gap-2">
        <Skeleton w={90} h={12} />
        <Skeleton w={110} h={24} />
        <Skeleton w="100%" h={34} rounded={8} />
      </div>
    </div>
  );
}

/** Matches `.box` — the generic panel used across every page. */
export function PanelSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="box">
      <Skeleton w="40%" h={16} className="mb-3 block" />
      <div className="grid gap-2">
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} w={i === lines - 1 ? "60%" : "100%"} h={12} />
        ))}
      </div>
    </div>
  );
}

/** Matches one `.rv` review card. */
export function ReviewSkeleton() {
  return (
    <div className="rv">
      <div className="grid gap-2">
        <Skeleton w="30%" h={14} />
        <Skeleton w="20%" h={12} />
        <Skeleton w="100%" h={12} />
        <Skeleton w="80%" h={12} />
      </div>
    </div>
  );
}

/** `n` copies of a skeleton, as the grids and lists all need. */
export function SkeletonList({
  count,
  children,
}: {
  count: number;
  children: (index: number) => React.ReactNode;
}) {
  return <>{Array.from({ length: count }, (_, i) => children(i))}</>;
}
