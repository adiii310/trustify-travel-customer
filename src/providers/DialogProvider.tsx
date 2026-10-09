"use client";

/**
 * The shared modal forms, and the single place every API submission is made.
 *
 * One component handles all six POST endpoints because they share the same
 * concerns, and getting those concerns right once is worth more than six
 * bespoke forms:
 *
 *   - the submit button is disabled in flight, so a double click cannot spend
 *     two of the twenty submissions allowed per 10 minutes;
 *   - a 400 is unpacked into per-field messages shown under the right input;
 *   - a 429 gets its own copy, because "try again" is wrong advice;
 *   - a review's success message is chosen from the status the server returns,
 *     never assumed.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import Modal from "@/components/ui/Modal";
import {
  useAskQuestion,
  useCompanies,
  useRequestCallback,
  useSignIn,
  useSubmitApplication,
  useSubmitEnquiry,
  useSubmitReview,
} from "@/hooks/api";
import { useApp } from "@/hooks/useApp";
import { isApiError, toUserMessage } from "@/lib/api/errors";
import type { CallbackSlot } from "@/lib/api/types";
import { monthYear } from "@/lib/format";
import { buildForm, type Field, type FormContext } from "@/lib/forms";
import { companyCode, type FormKind } from "@/lib/types";
import { RATE_LIMIT_WARN_AT, useSubmissionsRemaining } from "@/store";
import { useToast } from "./ToastProvider";

/**
 * API field name → form field name, for the forms where the two differ.
 *
 * The server reports validation failures against *its* field names (`t`, `n`,
 * `q`, `c`, `msg`…). Without this translation a 400 on the review text would
 * look for an input called `t` and the message would never be shown.
 */
const API_FIELD_TO_FORM_FIELD: Partial<Record<FormKind, Record<string, string>>> = {
  enquiry: { msg: "message" },
  review: { c: "companyCode", n: "author", r: "rating", t: "text" },
  ask: { n: "author", q: "question" },
};

type DialogContextValue = {
  openForm: (kind: FormKind, ctx?: FormContext) => void;
  closeForm: () => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<{ kind: FormKind; ctx: FormContext } | null>(
    null
  );

  const openForm = useCallback(
    (kind: FormKind, ctx: FormContext = {}) => setOpen({ kind, ctx }),
    []
  );
  const closeForm = useCallback(() => setOpen(null), []);

  const value = useMemo(() => ({ openForm, closeForm }), [openForm, closeForm]);

  return (
    <DialogContext.Provider value={value}>
      {children}
      {open && (
        <FormDialog
          // Remount on kind change so no field state leaks between forms.
          key={open.kind}
          kind={open.kind}
          ctx={open.ctx}
          onClose={closeForm}
        />
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used inside <DialogProvider>");
  return ctx;
}

/* ------------------------------------------------------------------ */

/** Collected field values, keyed by field name. All values are trimmed strings. */
type FormValues = Record<string, string>;

function FormDialog({
  kind,
  ctx,
  onClose,
}: {
  kind: FormKind;
  ctx: FormContext;
  onClose: () => void;
}) {
  const toast = useToast();
  const app = useApp();

  /** Form-level message — a validation failure or the server's own `message`. */
  const [error, setError] = useState("");
  /** Per-field messages from a 400, keyed by the API's field name. */
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // The review picker has to offer real companies: `c` is validated server-side
  // and an unknown code comes back as 400 "Pick a company to review."
  const { data: companies } = useCompanies();
  const companyOptions = useMemo(
    () =>
      (companies ?? []).map((c) => ({
        value: companyCode(c),
        label: c.name,
      })),
    [companies]
  );

  const config = useMemo(
    () => buildForm(kind, ctx, { companyOptions }),
    [kind, ctx, companyOptions]
  );

  // One mutation per endpoint. They are all declared unconditionally — hooks
  // cannot be called inside the switch below.
  const signIn = useSignIn();
  const submitEnquiry = useSubmitEnquiry();
  const requestCallback = useRequestCallback();
  const submitApplication = useSubmitApplication();
  const submitReview = useSubmitReview();
  const askQuestion = useAskQuestion();

  const busy =
    signIn.isPending ||
    submitEnquiry.isPending ||
    requestCallback.isPending ||
    submitApplication.isPending ||
    submitReview.isPending ||
    askQuestion.isPending;

  const remaining = useSubmissionsRemaining();

  /* ---- Signed-in users opening "Login" get their profile instead ---- */
  if (kind === "login" && app.account) {
    return (
      <Modal title="Your profile" onClose={onClose}>
        <p className="text-[13px] mb-3">
          <b>{app.account.name}</b>
          <br />
          {app.account.email}
          {app.account.phone ? (
            <>
              <br />
              {app.account.phone}
            </>
          ) : null}
        </p>
        <div className="kv">
          Saved companies<b>{app.saved.length}</b>
        </div>
        <div className="kv">
          Trips &amp; bookings<b>{app.trips.length}</b>
        </div>
        <p className="text-[12px] text-mute mb-3">
          Signing in stores a name and an email so forms can be prefilled. It is
          not an account — nothing on this site is locked behind it.
        </p>
        <button
          className="btn wo w"
          onClick={() => {
            app.signOut();
            toast("Signed out. Your trips stay on this device.");
            onClose();
          }}
        >
          Sign out
        </button>
      </Modal>
    );
  }

  /** Prefill from the captured traveller identity where the names line up. */
  const prefill = (field: Field) => {
    if (field.defaultValue) return field.defaultValue;
    if (!app.account) return "";
    if (["name", "author", "contact"].includes(field.name))
      return app.account.name;
    if (field.name === "email") return app.account.email;
    if (field.name === "phone") return app.account.phone ?? "";
    return "";
  };

  /**
   * Client-side validation.
   *
   * Not a substitute for the server's — it runs again there — but it keeps
   * obvious mistakes from spending one of the twenty submissions. Phone is
   * checked here precisely because the API only caps its length.
   *
   * @returns the collected values, or `null` if something failed.
   */
  const collect = (form: HTMLFormElement): FormValues | null => {
    const data = new FormData(form);
    const values: FormValues = {};

    for (const field of config.fields) {
      const raw = String(data.get(field.name) ?? "").trim();

      if (field.required && !raw) {
        setError(`${field.label} is required`);
        return null;
      }
      if (field.maxLength && raw.length > field.maxLength) {
        setError(`${field.label} must be ${field.maxLength} characters or fewer`);
        return null;
      }
      if (field.type === "email" && raw && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
        setError("Enter a valid email address");
        return null;
      }
      if (field.type === "tel" && raw && raw.replace(/\D/g, "").length < 7) {
        setError("Enter a valid phone number");
        return null;
      }

      values[field.name] = raw;
    }

    return values;
  };

  /**
   * Turn a rejected mutation into something the visitor can act on.
   *
   * Field errors are surfaced inline *and* the server's message is shown at
   * form level, so a 400 that names no field still says something useful.
   */
  const handleFailure = (cause: unknown) => {
    setError(toUserMessage(cause));

    if (isApiError(cause) && cause.isValidation) {
      const alias = API_FIELD_TO_FORM_FIELD[kind] ?? {};
      setFieldErrors(
        Object.fromEntries(
          cause.fieldErrors.map(({ field, message }) => [
            alias[field] ?? field,
            message,
          ])
        )
      );
    }
  };

  /** Dispatch to the right endpoint and report the outcome. */
  const submit = async (values: FormValues) => {
    switch (kind) {
      /* POST /members — identity capture; phone never leaves the device. */
      case "login": {
        await signIn.mutateAsync({
          name: values.name,
          email: values.email,
          phone: values.phone || undefined,
        });
        toast(`Welcome, ${values.name.split(" ")[0]}`);
        return;
      }

      /* POST /enquiries */
      case "enquiry": {
        await submitEnquiry.mutateAsync({
          name: values.name,
          phone: values.phone,
          date: values.date || undefined,
          // An empty number input yields "", which must not become NaN.
          pax: values.pax ? Number(values.pax) : undefined,
          msg: values.message || undefined,
          company: ctx.companyName,
          // The attribution key. Without it the lead reaches nobody in particular.
          ck: ctx.companyCode,
          pkg: ctx.packageTitle,
        });
        toast(config.success);
        return;
      }

      /* POST /callbacks */
      case "callback": {
        await requestCallback.mutateAsync({
          name: values.name,
          phone: values.phone,
          // "" is the documented "no preference" value. The select's
          // placeholder option already carries it; this cast just narrows the
          // string the form produced to the endpoint's enum.
          slot: (values.slot ?? "") as CallbackSlot,
        });
        toast(config.success);
        return;
      }

      /* POST /applications */
      case "apply": {
        await submitApplication.mutateAsync({
          company: values.company,
          contact: values.contact,
          email: values.email,
          phone: values.phone,
          city: values.city || undefined,
          years: values.years ? Number(values.years) : undefined,
        });
        toast(config.success);
        return;
      }

      /* POST /reviews — the one endpoint whose success is not a single outcome. */
      case "review": {
        const result = await submitReview.mutateAsync({
          c: values.companyCode,
          n: values.author,
          r: Number(values.rating) || 5,
          t: values.text,
          trip: values.trip || undefined,
          // The API stores `d` as free display text; a "Sep 2024" style stamp
          // matches what existing reviews look like.
          d: monthYear(),
        });

        // Whether a review goes live or into the moderation queue is a server
        // setting. Never hard-code the assumption — read the status back.
        toast(
          result.status === "approved"
            ? "Thanks! Your review is live."
            : "Thanks! Your review will appear once our team checks it."
        );
        return;
      }

      /* POST /questions — visible to everyone the moment it lands. */
      case "ask": {
        if (!ctx.companyCode) {
          // `c` is NOT validated server-side: posting without a real code would
          // quietly create a question attached to no company at all.
          setError("We could not identify this company. Please reload and retry.");
          return;
        }
        await askQuestion.mutateAsync({
          c: ctx.companyCode,
          n: values.author,
          q: values.question,
        });
        toast(config.success);
        return;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const values = collect(e.currentTarget);
    if (!values) return;

    try {
      await submit(values);
      onClose();
    } catch (cause) {
      // The dialog deliberately stays open so the visitor keeps what they typed.
      handleFailure(cause);
    }
  };

  return (
    <Modal title={config.title} onClose={onClose}>
      {config.intro && <p className="text-[12px] text-mute mb-3">{config.intro}</p>}

      {/* All six endpoints draw on one 20-per-10-minutes budget, so warn
          before the visitor hits a 429 rather than after. */}
      {remaining !== null && remaining <= RATE_LIMIT_WARN_AT && (
        <p className="text-[12px] text-mute mb-3">
          {remaining > 0
            ? `${remaining} submission${remaining === 1 ? "" : "s"} left in the next few minutes.`
            : "Submission limit reached. Please try again in a few minutes."}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid2">
          {config.fields.map((field) => (
            <label
              className="fl"
              key={field.name}
              style={field.half ? undefined : { gridColumn: "1 / -1" }}
            >
              {field.label}
              {field.required ? " *" : ""}

              {field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  rows={3}
                  maxLength={field.maxLength}
                  defaultValue={prefill(field)}
                />
              ) : field.type === "select" ? (
                <select name={field.name} defaultValue={prefill(field)}>
                  {field.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name={field.name}
                  type={field.type}
                  maxLength={field.maxLength}
                  defaultValue={prefill(field)}
                />
              )}

              {/* Server-reported problem with this specific input. */}
              {fieldErrors[field.name] && (
                <small className="ferr">{fieldErrors[field.name]}</small>
              )}
            </label>
          ))}
        </div>

        {error && <div className="ferr">{error}</div>}

        <button className="btn g w" type="submit" disabled={busy}>
          {busy ? "Sending…" : config.submitLabel}
        </button>
      </form>
    </Modal>
  );
}
