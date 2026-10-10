"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { Skeleton } from "@/components/ui/Skeleton";
import {
  useDestinationDetail,
  useDestinations,
  usePackages,
  useSiteContent,
} from "@/hooks/api";
import { addDaysISO, inr, newId, nightsBetween, todayISO } from "@/lib/format";
import { useApp } from "@/hooks/useApp";
import { useToast } from "@/providers/ToastProvider";
import { companyCode, type TripPlan } from "@/lib/types";

export default function TripPlanner() {
  const router = useRouter();
  const toast = useToast();
  const { addTrip, account } = useApp();
  const params = useSearchParams();

  const { data: destinations, isPending: destinationsPending } = useDestinations();
  const { data: content } = useSiteContent();

  const [form, setForm] = useState({
    // Empty until a destination is picked: there is no list to default into
    // before the API answers, and defaulting to a guess would quietly file the
    // plan against the wrong place.
    destinationId: params.get("destination") ?? "",
    title: "",
    startDate: addDaysISO(todayISO(), 21),
    endDate: addDaysISO(todayISO(), 25),
    travellers: 2,
    budgetPerPerson: 15000,
    notes: "",
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState("");

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const destination = (destinations ?? []).find((d) => d.id === form.destinationId);
  const nights = nightsBetween(form.startDate, form.endDate);

  // The companies covering the chosen destination, and what they actually
  // charge for it — both live. The shortlist is empty until one is picked.
  const { data: detail } = useDestinationDetail(form.destinationId || undefined);
  const { data: packages } = usePackages({
    destinationSlug: form.destinationId || undefined,
    enabled: Boolean(form.destinationId),
  });

  const matches = useMemo(() => {
    const cheapestFor = new Map<string, number>();
    // The server sorts cheapest first, so the first price seen per company wins.
    for (const p of packages ?? []) {
      const key = p.companyCode.toUpperCase();
      if (!cheapestFor.has(key)) cheapestFor.set(key, p.price);
    }

    return (detail?.companies ?? [])
      .map((c) => ({
        company: c,
        price: cheapestFor.get(companyCode(c).toUpperCase()) ?? c.fromPrice,
      }))
      .filter((m) => !form.budgetPerPerson || m.price <= form.budgetPerPerson * 1.15)
      .sort((a, b) => b.company.trustScore - a.company.trustScore)
      .slice(0, 3);
  }, [detail, packages, form.budgetPerPerson]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!destination) return setError("Pick a destination");
    if (form.startDate < todayISO())
      return setError("Start date cannot be in the past");
    if (nights < 1) return setError("End date must be after the start date");
    if (form.travellers < 1 || form.travellers > 30)
      return setError("Enter between 1 and 30 travellers");

    const plan: TripPlan = {
      id: newId("plan"),
      kind: "plan",
      title: form.title.trim() || `${destination.name} trip`,
      destinationId: form.destinationId,
      startDate: form.startDate,
      endDate: form.endDate,
      travellers: form.travellers,
      budgetPerPerson: form.budgetPerPerson,
      interests,
      notes: form.notes.trim(),
      status: "planned",
      createdAt: Date.now(),
    };

    addTrip(plan);
    toast("Trip plan saved to My Trips.");
    router.push(`/trips/${plan.id}`);
  };

  return (
    <form className="book-lay" onSubmit={submit}>
      <div>
        <div className="box">
          <h3>Trip basics</h3>

          <label className="fl">
            Trip name
            <input
              name="title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder={
                destination ? `${destination.name} trip` : "My next trip"
              }
            />
          </label>

          <label className="fl">
            Destination *
            <select
              name="destinationId"
              value={form.destinationId}
              onChange={(e) => set("destinationId", e.target.value)}
            >
              <option value="">
                {destinationsPending ? "Loading destinations…" : "Choose a destination"}
              </option>
              {(destinations ?? []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.region}
                </option>
              ))}
            </select>
          </label>

          <div className="grid2">
            <label className="fl">
              Start date *
              <input
                type="date"
                name="startDate"
                min={todayISO()}
                value={form.startDate}
                onChange={(e) => {
                  set("startDate", e.target.value);
                  if (e.target.value >= form.endDate)
                    set("endDate", addDaysISO(e.target.value, 3));
                }}
              />
            </label>
            <label className="fl">
              End date *
              <input
                type="date"
                name="endDate"
                min={form.startDate}
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
              />
            </label>
          </div>

          <div className="grid2">
            <label className="fl">
              Travellers *
              <input
                type="number"
                name="travellers"
                min={1}
                max={30}
                value={form.travellers}
                onChange={(e) => set("travellers", Number(e.target.value))}
              />
            </label>
            <label className="fl">
              Budget per person (₹)
              <input
                type="number"
                name="budgetPerPerson"
                min={0}
                step={1000}
                value={form.budgetPerPerson}
                onChange={(e) => set("budgetPerPerson", Number(e.target.value))}
              />
            </label>
          </div>
        </div>

        <div className="box">
          <h3>What are you into?</h3>
          <p className="mute mb-3">
            We use this to shortlist companies and suggest a day plan.
          </p>
          <div className="interests">
            {content
              ? content.interests.map(({ id, title }) => (
                  <button
                    type="button"
                    key={id}
                    className={`chipb${interests.includes(title) ? " on" : ""}`}
                    onClick={() =>
                      setInterests((prev) =>
                        prev.includes(title)
                          ? prev.filter((x) => x !== title)
                          : [...prev, title]
                      )
                    }
                  >
                    {title}
                  </button>
                ))
              : Array.from({ length: 8 }, (_, i) => (
                  <Skeleton key={i} w={88} h={30} rounded={999} />
                ))}
          </div>

          <label className="fl mt-3">
            Notes for the companies
            <textarea
              name="notes"
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Travelling with parents, prefer homestays, need a Delhi pickup…"
            />
          </label>
        </div>

        {error && <div className="ferr">{error}</div>}

        <button className="btn g" type="submit">
          Save trip plan
        </button>
        {!account && (
          <p className="mute mt-2 text-[12px]">
            Saved on this device. No account needed.
          </p>
        )}
      </div>

      <aside>
        <div className="box">
          <h3>Trip summary</h3>
          <div className="kv border-t-0">
            Destination<b>{destination?.name ?? "—"}</b>
          </div>
          <div className="kv">
            Duration
            <b>
              {nights > 0 ? `${nights}N / ${nights + 1}D` : "Set your dates"}
            </b>
          </div>
          <div className="kv">
            Travellers<b>{form.travellers}</b>
          </div>
          <div className="kv">
            Estimated total
            <b>{inr(form.budgetPerPerson * Math.max(1, form.travellers))}</b>
          </div>
          {destination && (
            <p className="mute mt-3">
              Best time to visit {destination.name}: {destination.bestTime}.
              Typical trip length {destination.duration}.
            </p>
          )}
        </div>

        <div className="box">
          <h3>Verified companies that fit</h3>
          {matches.length ? (
            matches.map((m) => (
              <div className="kv" key={m.company.id}>
                <span>
                  <b className="block">{m.company.name}</b>
                  <span className="mute">🛡 {m.company.trustScore}/100</span>
                </span>
                <b>{m.price ? `from ${inr(m.price)}` : "On request"}</b>
              </div>
            ))
          ) : (
            <p className="mute">
              No verified company fits that budget yet. Try raising it or
              picking another destination.
            </p>
          )}
        </div>
      </aside>
    </form>
  );
}
