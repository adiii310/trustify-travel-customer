"use client";

import Link from "next/link";
import { useState } from "react";

import { useCompanies, useCompany } from "@/hooks/api";
import { useDestinations } from "@/hooks/api";
import { inr, longDate } from "@/lib/format";
import { useApp } from "@/hooks/useApp";
import type { Trip } from "@/lib/types";

type Filter = "all" | "booking" | "plan";

export default function TripsDashboard() {
  const { trips, saved, toggleSaved, ready } = useApp();
  const [filter, setFilter] = useState<Filter>("all");

  // Saved companies are stored as slugs; their names come from the live list so
  // a renamed company is not shown under its old name.
  const { data: companies } = useCompanies();
  const getCompany = (id: string) => companies?.find((c) => c.id === id);


  if (!ready) return <div className="empty">Loading your trips…</div>;

  const list = trips.filter((t) => filter === "all" || t.kind === filter);

  return (
    <>
      <div className="mb-3.5">
        {(
          [
            ["all", `All (${trips.length})`],
            ["booking", `Bookings (${trips.filter((t) => t.kind === "booking").length})`],
            ["plan", `Plans (${trips.filter((t) => t.kind === "plan").length})`],
          ] as [Filter, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            className={`chipb${filter === key ? " on" : ""}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {list.length ? (
        <div className="trip-grid">
          {list.map((t) => (
            <TripCard trip={t} key={t.id} />
          ))}
        </div>
      ) : (
        <div className="empty">
          {trips.length
            ? "Nothing in this tab yet."
            : "No trips yet. Book a verified package or build your own itinerary."}
          <br />
          <Link className="btn g sm mt-3" href="/trips/new">
            Plan a trip
          </Link>
        </div>
      )}

      <h2 className="mt-8 mb-3">Saved companies</h2>
      {saved.length ? (
        <div className="trip-grid">
          {saved.map((id) => {
            const c = getCompany(id);
            if (!c) return null;
            return (
              <div className="trip-card" key={id}>
                <div
                  className="flex items-center gap-3"
                >
                  <div className="av">{c.initial}</div>
                  <div>
                    <h3>{c.name}</h3>
                    <span>
                      🛡 {c.trustScore}/100 · {c.city}
                    </span>
                  </div>
                </div>
                <div className="acts mt-auto">
                  <Link className="btn g" href={`/companies/${c.id}`}>
                    View
                  </Link>
                  <button className="btn o2" onClick={() => toggleSaved(c.id)}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          No saved companies yet. Tap “♡ Save Company” on any company page.
        </div>
      )}
    </>
  );
}

function TripCard({ trip }: { trip: Trip }) {
  const isBooking = trip.kind === "booking";
  // Reads the same cached company list as the dashboard above — no extra fetch.
  const { data: company } = useCompany(isBooking ? trip.companyId : undefined);
  const { data: destinations } = useDestinations();

  // The slug is shown until the list loads, and kept if the destination has
  // since been removed — it is at least the value the trip was really saved
  // against.
  const destinationName =
    destinations?.find((d) => d.id === trip.destinationId)?.name ??
    trip.destinationId;

  return (
    <div className="trip-card">
      <div className="flex justify-between gap-2">
        <span className={`status ${trip.status}`}>{trip.status}</span>
        <span>{isBooking ? "Booking" : "Plan"}</span>
      </div>

      <h3>{trip.title}</h3>

      <span>📍 {destinationName}</span>
      <span>
        🗓{" "}
        {isBooking
          ? longDate(trip.startDate)
          : `${longDate(trip.startDate)} → ${longDate(trip.endDate)}`}
      </span>
      <span>👤 {trip.travellers} travellers</span>
      {isBooking ? (
        <span>
          🏢 {company?.name ?? "Company"} · <b>{inr(trip.total)}</b> total
        </span>
      ) : (
        <span>💰 Budget {inr(trip.budgetPerPerson)} per person</span>
      )}

      <Link className="btn g w mt-auto" href={`/trips/${trip.id}`}>
        {isBooking ? "View booking" : "Open plan"}
      </Link>
    </div>
  );
}
