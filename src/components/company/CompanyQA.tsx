"use client";

import FormButton from "@/components/ui/FormButton";
import { useCompanyCode, useCompanyQuestions } from "@/hooks/api";

/**
 * Questions and answers for one company, read live from
 * `GET /questions?c=<code>`.
 *
 * Two behaviours of this endpoint drive the markup:
 *
 *  - A question is public the instant it is posted, with an empty answer. So
 *    `answer` is rendered only when it is non-empty, and an awaiting-reply
 *    badge takes its place otherwise.
 *  - An admin hiding a question removes it from the response entirely. A
 *    question disappearing between loads is normal and is never an error.
 */
export default function CompanyQA({ companyId }: { companyId: string }) {
  const code = useCompanyCode(companyId);
  const { data, isPending, isError, error } = useCompanyQuestions(code);

  const list = data ?? [];

  return (
    <div className="box mt-6 mb-10 text-[14px]">
      <div className="lh">
        <h3 className="m-0">Questions &amp; Answers</h3>
        <FormButton kind="ask" companyId={companyId} className="btn g">
          Ask a question
        </FormButton>
      </div>

      {list.length ? (
        list.map((q) => (
          <div className="rc" key={q.id}>
            <b>{q.author}</b>
            <p className="mt-1">{q.question}</p>
            {q.answer ? (
              <p className="mt-1.5 text-mute">
                <b className="text-green2">Company reply:</b> {q.answer}
              </p>
            ) : (
              <small className="mute">Awaiting a reply from the company.</small>
            )}
          </div>
        ))
      ) : (
        <p className="mute mt-2.5">
          {isPending
            ? "Loading questions…"
            : isError
              ? error.message
              : "No questions yet. Ask the first one."}
        </p>
      )}
    </div>
  );
}
