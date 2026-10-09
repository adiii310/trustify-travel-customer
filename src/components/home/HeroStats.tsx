"use client";

import { useMetrics } from "@/hooks/api";
import { HERO_STATS } from "@/lib/data/site";
import type { Metric } from "@/lib/types";

/**
 * Shown until the API answers, and whenever it serves nothing.
 *
 * The strip is part of the page's first impression, so it must never collapse
 * to an empty row: an admin who hides every figure, a cold cache and an
 * unreachable API all land here. Follows the house rule — live API value first,
 * static catalogue second.
 */
const FALLBACK: Metric[] = HERO_STATS.map((s) => ({
  id: s.label,
  icon: s.icon,
  value: s.value,
  label: s.label,
}));

/**
 * The headline figures across the top of the homepage, managed from the admin
 * panel's Homepage view.
 *
 * The count is not fixed — an admin can add or remove figures — so this renders
 * whatever arrives rather than assuming four.
 */
export default function HeroStats() {
  const { data } = useMetrics();
  const metrics = data?.length ? data : FALLBACK;

  return (
    <div className="stats">
      {metrics.map((s) => (
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
