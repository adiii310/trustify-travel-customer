"use client";

import { useRouter } from "next/navigation";

import { useApp } from "@/hooks/useApp";

type Props = {
  companyId: string;
  className?: string;
  /** Jump to /compare right after adding. */
  goToCompare?: boolean;
  label?: string;
};

export default function CompareButton({
  companyId,
  className = "btn o2",
  goToCompare = false,
  label,
}: Props) {
  const { inCompare, toggleCompare, ready } = useApp();
  const router = useRouter();
  const active = ready && inCompare(companyId);

  return (
    <button
      className={className}
      onClick={() => {
        // The "go to compare" CTA never removes — it adds if needed, then
        // navigates. Plain compare buttons toggle.
        if (goToCompare && active) {
          router.push("/compare");
          return;
        }
        const nowInTray = toggleCompare(companyId);
        // A full tray leaves the company out; the toast explains why.
        if (goToCompare && nowInTray) router.push("/compare");
      }}
    >
      {label ?? (active ? "✔ In compare" : "Compare")}
    </button>
  );
}
