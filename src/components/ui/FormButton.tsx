"use client";

import { useCompany } from "@/hooks/api";
import { getCompany } from "@/lib/data/companies";
import { companyCode, type FormKind } from "@/lib/types";
import { useDialog } from "@/providers/DialogProvider";

type Props = {
  kind: FormKind;
  className?: string;
  /** Company slug. Resolved to the API short code before the form opens. */
  companyId?: string;
  packageTitle?: string;
  children: React.ReactNode;
};

/**
 * Opens one of the shared dialog forms.
 *
 * Its job beyond that is resolving the company *slug* a page knows about into
 * the *short code* the API needs — that code is what attributes an enquiry and
 * what a question or review is filed under. The live company list is the source
 * of truth; the static catalogue is only a fallback for the first render, before
 * the list has loaded.
 */
export default function FormButton({
  kind,
  className = "btn g",
  companyId,
  packageTitle,
  children,
}: Props) {
  const { openForm } = useDialog();
  const { data: liveCompany } = useCompany(companyId);

  const company = liveCompany ?? (companyId ? getCompany(companyId) : undefined);

  return (
    <button
      className={className}
      onClick={() =>
        openForm(kind, {
          companyId,
          companyCode: company ? companyCode(company) : undefined,
          companyName: company?.name,
          packageTitle,
        })
      }
    >
      {children}
    </button>
  );
}
