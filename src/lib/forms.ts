/**
 * Declarative configuration for the six shared dialog forms.
 *
 * Field `name`s are chosen to match the API payload keys wherever the API is
 * not cryptic, so `DialogProvider` can map a submission with almost no
 * translation. Where the API uses a one-letter key (`c`, `n`, `r`, `t`, `q`)
 * the form keeps a readable name and the mapping is done explicitly — a form
 * field called `t` would be unmaintainable.
 *
 * This module is pure configuration: it performs no I/O and knows nothing
 * about TanStack Query.
 */

import type { FormKind } from "@/lib/types";

export type Field = {
  name: string;
  label: string;
  type: "text" | "tel" | "email" | "date" | "number" | "textarea" | "select";
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string;
  /** Render at half width inside the two-column grid. */
  half?: boolean;
  /** Client-side cap, mirroring the server's own limit on that field. */
  maxLength?: number;
};

export type FormContext = {
  /** Company slug — used for links and to preselect the review picker. */
  companyId?: string;
  /** Company short code (`k`) — the value submissions must carry. */
  companyCode?: string;
  companyName?: string;
  packageTitle?: string;
};

export type FormConfig = {
  title: string;
  intro?: string;
  submitLabel: string;
  /** Default success message. The review form overrides it per response. */
  success: string;
  fields: Field[];
};

export type FormOptions = {
  /**
   * Company picker options for the review form, sourced from `GET /companies`.
   * The `value` MUST be the company's short code (`k`) — reviews validate it
   * server-side and reject anything else with "Pick a company to review."
   */
  companyOptions?: { value: string; label: string }[];
};

/** Max lengths the server enforces, kept here so the UI can warn first. */
const LIMITS = {
  name: 80,
  phone: 20,
  message: 2000,
  question: 1000,
  reviewText: 2000,
  trip: 120,
  companyName: 120,
} as const;

export function buildForm(
  kind: FormKind,
  ctx: FormContext = {},
  options: FormOptions = {}
): FormConfig {
  switch (kind) {
    /* -------------------------------------------------------------- *
     * POST /members — identity capture, not authentication.
     * The API stores only name + email; phone stays on this device.
     * -------------------------------------------------------------- */
    case "login":
      return {
        title: "Login / Join",
        intro:
          "Signing in is optional — it just saves your details for future forms and syncs your saved companies on this device.",
        submitLabel: "Continue",
        success: "Welcome",
        fields: [
          {
            name: "name",
            label: "Your name",
            type: "text",
            required: true,
            maxLength: LIMITS.name,
          },
          { name: "email", label: "Email", type: "email", required: true },
          {
            name: "phone",
            label: "Phone (optional, kept on this device)",
            type: "tel",
            maxLength: LIMITS.phone,
          },
        ],
      };

    /* -------------------------------------------------------------- *
     * POST /enquiries
     * -------------------------------------------------------------- */
    case "enquiry":
      return {
        title: ctx.companyName ? `Enquire · ${ctx.companyName}` : "Send an enquiry",
        intro: ctx.packageTitle ? `About: ${ctx.packageTitle}` : undefined,
        submitLabel: "Send enquiry",
        success: "Enquiry sent. The company will contact you soon.",
        fields: [
          {
            name: "name",
            label: "Your name",
            type: "text",
            required: true,
            maxLength: LIMITS.name,
          },
          {
            name: "phone",
            label: "Phone / WhatsApp",
            type: "tel",
            required: true,
            maxLength: LIMITS.phone,
          },
          { name: "date", label: "Travel date", type: "date", half: true },
          { name: "pax", label: "Travellers", type: "number", half: true },
          {
            name: "message",
            label: "Message",
            type: "textarea",
            maxLength: LIMITS.message,
          },
        ],
      };

    /* -------------------------------------------------------------- *
     * POST /callbacks
     * -------------------------------------------------------------- */
    case "callback":
      return {
        title: "Request a call back",
        submitLabel: "Request call",
        success: "Call back requested. We will ring you shortly.",
        fields: [
          {
            name: "name",
            label: "Your name",
            type: "text",
            required: true,
            maxLength: LIMITS.name,
          },
          {
            name: "phone",
            label: "Phone",
            type: "tel",
            required: true,
            maxLength: LIMITS.phone,
          },
          {
            name: "slot",
            label: "Best time",
            type: "select",
            // The placeholder's empty value is deliberate: the API wants "" for
            // "no preference". Sending null instead would skip enum validation
            // and store a third empty value.
            options: [
              { value: "", label: "No preference" },
              ...["Morning", "Afternoon", "Evening"].map((v) => ({
                value: v,
                label: v,
              })),
            ],
          },
        ],
      };

    /* -------------------------------------------------------------- *
     * POST /applications
     * -------------------------------------------------------------- */
    case "apply":
      return {
        title: "Become a verified company",
        intro:
          "Tell us about your company. Our verification team will reach out within 3 working days.",
        submitLabel: "Submit application",
        success:
          "Application received. Our team will contact you — there is no status page to check in the meantime.",
        fields: [
          {
            name: "company",
            label: "Company name",
            type: "text",
            required: true,
            maxLength: LIMITS.companyName,
          },
          {
            name: "contact",
            label: "Contact person",
            type: "text",
            required: true,
            maxLength: LIMITS.name,
          },
          { name: "email", label: "Email", type: "email", required: true },
          {
            name: "phone",
            label: "Phone",
            type: "tel",
            required: true,
            maxLength: LIMITS.phone,
          },
          { name: "city", label: "City", type: "text", half: true },
          {
            name: "years",
            label: "Years in business",
            type: "number",
            half: true,
          },
        ],
      };

    /* -------------------------------------------------------------- *
     * POST /reviews — `c` is validated server-side, so the picker is
     * populated from the live company list and submits the short code.
     * -------------------------------------------------------------- */
    case "review":
      return {
        title: "Write a review",
        intro: "Only share experiences from trips you actually took.",
        submitLabel: "Post review",
        // Overridden at submit time by the status the server returns.
        success: "Thanks! Your review has been submitted.",
        fields: [
          {
            name: "companyCode",
            label: "Company",
            type: "select",
            required: true,
            options: options.companyOptions ?? [],
            defaultValue: ctx.companyCode,
          },
          {
            name: "author",
            label: "Your name",
            type: "text",
            required: true,
            maxLength: LIMITS.name,
          },
          {
            name: "rating",
            label: "Rating",
            type: "select",
            required: true,
            options: ["5", "4", "3", "2", "1"].map((v) => ({
              value: v,
              label: `${v} ★`,
            })),
          },
          {
            name: "trip",
            label: "Trip taken",
            type: "text",
            maxLength: LIMITS.trip,
          },
          {
            name: "text",
            label: "Your experience",
            type: "textarea",
            required: true,
            maxLength: LIMITS.reviewText,
          },
        ],
      };

    /* -------------------------------------------------------------- *
     * POST /questions — public the instant it is posted.
     * -------------------------------------------------------------- */
    case "ask":
      return {
        title: ctx.companyName ? `Ask ${ctx.companyName}` : "Ask a question",
        submitLabel: "Post question",
        success: "Question posted. The company usually replies within a day.",
        fields: [
          {
            name: "author",
            label: "Your name",
            type: "text",
            required: true,
            maxLength: LIMITS.name,
          },
          {
            name: "question",
            label: "Your question",
            type: "textarea",
            required: true,
            maxLength: LIMITS.question,
          },
        ],
      };
  }
}
