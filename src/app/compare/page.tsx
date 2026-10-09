import type { Metadata } from "next";
import Link from "next/link";

import CompareTable from "@/components/compare/CompareTable";

export const metadata: Metadata = {
  title: "Compare Companies",
  description:
    "Put two or three verified travel companies side by side across price, trust score and all 9 verification parameters.",
};

export default function ComparePage() {
  return (
    <div className="wrap page">
      <div className="crumb mute">
        <Link href="/">Home</Link> › Compare
      </div>
      <h1 className="page-title">Compare Travel Companies</h1>
      <p className="page-sub">
        Pick 2 or 3 verified companies. The best value in each row is
        highlighted.
      </p>
      <CompareTable />
    </div>
  );
}
