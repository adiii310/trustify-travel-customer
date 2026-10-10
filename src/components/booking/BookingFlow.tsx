"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { addDaysISO, inr, longDate, todayISO } from "@/lib/format";
import { useRequestBooking } from "@/hooks/api";
import { isApiError } from "@/lib/api/errors";
import { useAccountStore } from "@/store/accountStore";
import type { Company, Destination, Package } from "@/lib/types";

const STEPS = ["Trip details", "Your details", "Review & request"];

type Props = {
  pkg: Package;
  company: Company;
  destination: Destination;
};

export default function BookingFlow({ pkg, company, destination }: Props) {
  const router = useRouter();
  const account = useAccountStore((s) => s.account);
  const request = useRequestBooking();
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    startDate: addDaysISO(todayISO(), 14),
    travellers: 2,
    name: account?.name ?? "",
    email: account?.email ?? "",
    phone: account?.phone ?? "",
    notes: "",
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const total = pkg.price * Math.max(1, form.travellers);
  const dueNow = Math.round(total * 0.25);

  const next = () => {
    setError("");

    if (step === 0) {
      if (!form.startDate) return setError("Pick a start date");
      if (form.startDate < todayISO())
        return setError("Start date cannot be in the past");
      if (form.travellers < 1 || form.travellers > 20)
        return setError("Enter between 1 and 20 travellers");
    }

    if (step === 1) {
      if (!form.name.trim()) return setError("Your name is required");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        return setError("Enter a valid email address");
      if (form.phone.replace(/\D/g, "").length < 7)
        return setError("Enter a valid phone number");
    }

    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  /**
   * Submit the request.
   *
   * This creates a **pending** request, not a booking: no payment is taken and
   * nothing is reserved. The server prices it from the package, so the total
   * shown here is a quote and anything sent in its place would be ignored.
   */
  const confirm = async () => {
    setSubmitError("");
    setFieldErrors({});

    try {
      const booking = await request.mutateAsync({
        pkg: pkg.id,
        pax: form.travellers,
        startDate: form.startDate,
        msg: form.notes.trim(),
        phone: form.phone.trim(),
      });
      router.push(`/account/bookings/${booking.id}?new=1`);
    } catch (cause) {
      setSubmitError(
        cause instanceof Error ? cause.message : "Could not send your request."
      );
      if (isApiError(cause)) setFieldErrors(cause.fieldErrorMap);
    }
  };

  return (
    <div className="book-lay">
      <div>
        <div className="steps-bar">
          {STEPS.map((label, i) => (
            <span
              key={label}
              className={i === step ? "on" : i < step ? "done" : ""}
            >
              {i + 1}. {label}
            </span>
          ))}
        </div>

        {step === 0 && (
          <div className="box">
            <h3>When are you travelling?</h3>
            <div className="grid2">
              <label className="fl">
                Start date *
                <input
                  type="date"
                  name="startDate"
                  min={todayISO()}
                  value={form.startDate}
                  onChange={(e) => set("startDate", e.target.value)}
                />
              </label>
              <label className="fl">
                Travellers *
                <input
                  type="number"
                  name="travellers"
                  min={1}
                  max={20}
                  value={form.travellers}
                  onChange={(e) => set("travellers", Number(e.target.value))}
                />
              </label>
            </div>
            <p className="mute">
              Ends on {longDate(addDaysISO(form.startDate, pkg.nights))} ·{" "}
              {pkg.nights} nights / {pkg.days} days
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="box">
            <h3>Who should the company contact?</h3>
            {!account && (
              <p className="mute mb-2.5">
                You can book as a guest — no account needed. Signing in just
                pre-fills this next time.
              </p>
            )}
            <label className="fl">
              Full name *
              <input
                name="name"
                autoComplete="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </label>
            <div className="grid2">
              <label className="fl">
                Email *
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </label>
              <label className="fl">
                Phone / WhatsApp *
                <input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </label>
            </div>
            <label className="fl">
              Anything the company should know
              <textarea
                name="notes"
                rows={3}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Dietary needs, elderly travellers, preferred pickup point…"
              />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="box">
            <h3>Review your request</h3>
            <div className="kv">
              Package<b>{pkg.title}</b>
            </div>
            <div className="kv">
              Company<b>{company.name}</b>
            </div>
            <div className="kv">
              Destination<b>{destination.name}</b>
            </div>
            <div className="kv">
              Travel dates
              <b>
                {longDate(form.startDate)} →{" "}
                {longDate(addDaysISO(form.startDate, pkg.nights))}
              </b>
            </div>
            <div className="kv">
              Travellers<b>{form.travellers}</b>
            </div>
            <div className="kv">
              Contact
              <b>
                {form.name} · {form.phone}
              </b>
            </div>
            {form.notes && (
              <div className="kv">
                Notes<b>{form.notes}</b>
              </div>
            )}
            {/* Said plainly, and said before the button rather than after it:
                a request is not a booking, and the figure above is a quote. */}
            <p className="mute mt-3">
              <b>This is a request, not a confirmed booking.</b> Nothing is
              reserved and no payment is taken here. Our team will contact you
              on {form.phone || "the number above"} to confirm availability and
              explain how to pay — typically {inr(dueNow)} up front, agreed with
              you first.
            </p>
          </div>
        )}

        {error && <div className="ferr">{error}</div>}
        {submitError && <div className="ferr">{submitError}</div>}
        {Object.entries(fieldErrors).map(([field, message]) => (
          <div className="ferr" key={field}>
            {field}: {message}
          </div>
        ))}

        <div className="flex flex-wrap gap-2.5">
          {step > 0 && (
            <button className="btn wo" onClick={() => setStep((s) => s - 1)}>
              ← Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button className="btn g" onClick={next}>
              Continue →
            </button>
          ) : (
            <button
              className="btn g"
              onClick={() => void confirm()}
              disabled={request.isPending}
            >
              {request.isPending ? "Sending…" : "Send booking request"}
            </button>
          )}
        </div>
      </div>

      <aside>
        <div className="box">
          <h3>Price summary</h3>
          <div className="kv border-t-0">
            Per person<b>{inr(pkg.price)}</b>
          </div>
          <div className="kv">
            Travellers<b>× {Math.max(1, form.travellers)}</b>
          </div>
          <div className="kv">
            Total<b className="price">{inr(total)}</b>
          </div>
          <div className="kv">
            Due now (25%)<b>{inr(dueNow)}</b>
          </div>
        </div>

        <div className="box">
          <h3>What&apos;s included</h3>
          <ul className="grid list-none gap-1.5 p-0">
            {pkg.inclusions.map((i) => (
              <li key={i}>
                <span className="ck">✔</span> {i}
              </li>
            ))}
          </ul>
          <h4>Not included</h4>
          <ul className="grid list-none gap-1.5 p-0">
            {pkg.exclusions.map((i) => (
              <li key={i} className="mute">
                ✕ {i}
              </li>
            ))}
          </ul>
        </div>

        <div className="box">
          <h3>Day by day</h3>
          {pkg.itinerary.map((d) => (
            <div className="day" key={d.day}>
              <b>
                Day {d.day}: {d.title}
              </b>
              <span className="mute">{d.detail}</span>
            </div>
          ))}
          <Link className="btn wo w" href={`/companies/${company.id}?tab=packages`}>
            See other packages
          </Link>
        </div>
      </aside>
    </div>
  );
}
