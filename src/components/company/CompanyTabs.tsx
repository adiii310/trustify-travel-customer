"use client";

import Link from "next/link";

import { COMPANY_TABS, type TabKey } from "@/lib/tabs";
import { useApp } from "@/hooks/useApp";

export default function CompanyTabs({
  companyId,
  active,
  reviewCount,
}: {
  companyId: string;
  active: TabKey;
  reviewCount: number;
}) {
  const { isSaved, toggleSaved, ready } = useApp();
  const saved = ready && isSaved(companyId);

  return (
    <div className="tabs">
      <div className="wrap">
        {COMPANY_TABS.map((t) => (
          <Link
            key={t.key}
            href={`/companies/${companyId}?tab=${t.key}`}
            scroll={false}
            className={`tab${t.key === active ? " on" : ""}`}
          >
            {t.label}
            {t.key === "reviews" ? ` (${reviewCount.toLocaleString("en-IN")})` : ""}
          </Link>
        ))}
        <button className="save" onClick={() => toggleSaved(companyId)}>
          {saved ? "❤️" : "♡"} Save Company
        </button>
      </div>
    </div>
  );
}
