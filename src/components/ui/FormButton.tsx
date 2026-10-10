"use client";

import { useCompany } from "@/hooks/api";
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
 * what a question or review is filed under.
 *
 * The live company list is the only source for that code. Until it loads the
 * button still opens the form, just without a company pre-selected: a code
 * guessed from anywhere else would silently file the submission against the
 * wrong company, and question codes are not validated server-side.
 */
export default function FormButton({
  kind,
  className = "btn g",
  companyId,
  packageTitle,
  children,
}: Props) {
  const { openForm } = useDialog();
  const { data: company } = useCompany(companyId);

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
