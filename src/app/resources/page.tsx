import type { Metadata } from "next";
import Link from "next/link";

import { RESOURCES } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Travel Resources",
  description:
    "Checklists and guides for picking a trustworthy travel company and planning a safe trip.",
};

export default function ResourcesPage() {
  return (
    <div className="wrap page max-w-[820px]">
      <div className="crumb mute">
        <Link href="/">Home</Link> › Resources
      </div>
      <h1 className="page-title">Travel Resources</h1>
      <p className="page-sub">
        Short, practical guides written by the team that runs our verification
        checks.
      </p>

      {RESOURCES.map((r) => (
        <details key={r.q}>
          <summary>{r.q}</summary>
          <p>{r.a}</p>
        </details>
      ))}
    </div>
  );
}
