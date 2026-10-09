"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import CompanyRow from "@/components/cards/CompanyRow";
import FormButton from "@/components/ui/FormButton";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { companiesForDestination, getCompany } from "@/lib/data/companies";
import { getDestination } from "@/lib/data/destinations";
import { getPackage } from "@/lib/data/packages";
import { addDaysISO, inr, longDate, nightsBetween } from "@/lib/format";
import { useApp } from "@/hooks/useApp";
import { useToast } from "@/providers/ToastProvider";
import type { Booking, TripPlan } from "@/lib/types";

export default function TripDetail({ tripId }: { tripId: string }) {
  const { getTrip, removeTrip, updateTrip, ready } = useApp();
  const router = useRouter();
  const toast = useToast();

  if (!ready) {
    return (
      <div className="wrap page">
        <div className="empty">Loading your trip…</div>
      </div>
    );
  }

  const trip = getTrip(tripId);

  if (!trip) {
    return (
      <div className="wrap page">
        <div className="empty">
          We couldn&apos;t find that trip on this device.
          <br />
          <Link className="btn g sm mt-3" href="/trips">
            Back to My Trips
          </Link>
        </div>
      </div>
    );
  }

  const destination = getDestination(trip.destinationId);

  const remove = () => {
    removeTrip(trip.id);
    toast(trip.kind === "booking" ? "Booking removed" : "Plan deleted");
    router.push("/trips");
  };

  return (
    <div className="wrap page">
      <div className="crumb mute">
        <Link href="/">Home</Link> › <Link href="/trips">My Trips</Link> ›{" "}
        {trip.title}
      </div>

      <div className="lh">
        <div>
          <span className={`status ${trip.status}`}>{trip.status}</span>
          <h1 className="page-title mt-2">{trip.title}</h1>
          <p className="page-sub mb-0">
            📍 {destination?.name ?? trip.destinationId} · 👤 {trip.travellers}{" "}
            travellers
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {destination && (
            <Link className="btn wo" href={`/destinations/${destination.id}`}>
              Browse companies
            </Link>
          )}
          <button className="btn wo" onClick={remove}>
            Delete
          </button>
        </div>
      </div>

      {trip.kind === "booking" ? (
        <BookingDetail booking={trip} />
      ) : (
        <PlanDetail
          plan={trip}
          onStatus={(status) => {
            updateTrip(trip.id, { status });
            toast(status === "planned" ? "Marked as planned" : "Moved to drafts");
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function BookingDetail({ booking }: { booking: Booking }) {
  const company = getCompany(booking.companyId);
  const pkg = getPackage(booking.packageId);
  const endDate = pkg
    ? addDaysISO(booking.startDate, pkg.nights)
    : booking.startDate;

  return (
    <div className="book-lay">
      <div>
        <div className="box">
          <h3>Booking details</h3>
          <div className="kv border-t-0">
            Reference<b className="font-mono">{booking.id}</b>
          </div>
          <div className="kv">
            Company
            <b>
              {company ? (
                <Link href={`/companies/${company.id}`}>{company.name}</Link>
              ) : (
                "—"
              )}
            </b>
          </div>
          <div className="kv">
            Package<b>{booking.title}</b>
          </div>
          <div className="kv">
            Dates
            <b>
              {longDate(booking.startDate)} → {longDate(endDate)}
            </b>
          </div>
          <div className="kv">
            Travellers<b>{booking.travellers}</b>
          </div>
          <div className="kv">
            Contact
            <b>
              {booking.contact.name} · {booking.contact.phone}
              <br />
              {booking.contact.email}
            </b>
          </div>
          {booking.notes && (
            <div className="kv">
              Notes<b>{booking.notes}</b>
            </div>
          )}
        </div>

        {pkg && (
          <div className="box">
            <h3>Your itinerary</h3>
            {pkg.itinerary.map((d) => (
              <div className="day" key={d.day}>
                <b>
                  Day {d.day}: {d.title}
                </b>
                <span className="mute">{d.detail}</span>
              </div>
            ))}
          </div>
        )}

        {pkg && (
          <div className="box">
            <h3>Inclusions</h3>
            <ul className="grid list-none gap-1.5 p-0">
              {pkg.inclusions.map((i) => (
                <li key={i}>
                  <span className="ck">✔</span> {i}
                </li>
              ))}
            </ul>
            <h4>Not included</h4>
            <ul className="mute grid list-none gap-1.5 p-0">
              {pkg.exclusions.map((i) => (
                <li key={i}>✕ {i}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <aside>
        <div className="box">
          <h3>Payment</h3>
          <div className="kv border-t-0">
            Per person<b>{inr(booking.pricePerPerson)}</b>
          </div>
          <div className="kv">
            Travellers<b>× {booking.travellers}</b>
          </div>
          <div className="kv">
            Total<b className="price">{inr(booking.total)}</b>
          </div>
          <div className="kv">
            Deposit (25%)<b>{inr(Math.round(booking.total * 0.25))}</b>
          </div>
          <p className="mute mt-3">
            The company collects payment directly. Free cancellation up to 15
            days before departure.
          </p>
        </div>

        <div className="box">
          <h3>Need a change?</h3>
          {company && (
            <FormButton
              kind="enquiry"
              companyId={company.id}
              packageTitle={booking.title}
              className="btn g w"
            >
              💬 Message {company.name}
            </FormButton>
          )}
          <FormButton kind="callback" className="btn wo w">
            📞 Request a call back
          </FormButton>
          <WhatsAppButton
            className="btn wo w"
            message={`Hi Trustify Trips, I need help with booking ${booking.id}.`}
          />
        </div>

        {company && (
          <div className="box">
            <h3>Been on this trip?</h3>
            <p className="mute mb-2">
              Verified reviews help the next traveller pick well.
            </p>
            <FormButton kind="review" companyId={company.id} className="btn g w">
              Write a review
            </FormButton>
          </div>
        )}
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function PlanDetail({
  plan,
  onStatus,
}: {
  plan: TripPlan;
  onStatus: (status: TripPlan["status"]) => void;
}) {
  const destination = getDestination(plan.destinationId);
  const nights = nightsBetween(plan.startDate, plan.endDate);
  const suggestions = companiesForDestination(plan.destinationId)
    .sort((a, b) => b.trustScore - a.trustScore)
    .slice(0, 3);

  return (
    <div className="book-lay">
      <div>
        <div className="box">
          <h3>Plan overview</h3>
          <div className="kv border-t-0">
            Destination<b>{destination?.name ?? plan.destinationId}</b>
          </div>
          <div className="kv">
            Dates
            <b>
              {longDate(plan.startDate)} → {longDate(plan.endDate)}
            </b>
          </div>
          <div className="kv">
            Duration<b>{nights}N / {nights + 1}D</b>
          </div>
          <div className="kv">
            Travellers<b>{plan.travellers}</b>
          </div>
          <div className="kv">
            Budget
            <b>
              {inr(plan.budgetPerPerson)} pp ·{" "}
              {inr(plan.budgetPerPerson * plan.travellers)} total
            </b>
          </div>
          {plan.interests.length > 0 && (
            <div className="kv">
              Interests
              <b className="text-right">
                {plan.interests.map((i) => (
                  <span className="tag" key={i}>
                    {i}
                  </span>
                ))}
              </b>
            </div>
          )}
          {plan.notes && (
            <div className="kv">
              Notes<b>{plan.notes}</b>
            </div>
          )}
        </div>

        {destination && (
          <div className="box">
            <h3>Suggested day plan</h3>
            <p className="mute mb-3">
              A starting point built from {destination.name}&apos;s highlights —
              companies will refine it against your dates.
            </p>
            {Array.from({ length: Math.max(1, nights + 1) }).map((_, i) => {
              const spot =
                i === 0
                  ? `Arrive in ${destination.name}`
                  : i === nights
                    ? "Departure"
                    : destination.highlights[
                        (i - 1) % Math.max(destination.highlights.length, 1)
                      ];
              return (
                <div className="day" key={i}>
                  <b>
                    Day {i + 1}: {spot}
                  </b>
                  <span className="mute">
                    {longDate(addDaysISO(plan.startDate, i))}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="box">
          <h3>Verified companies for this route</h3>
          {suggestions.length ? (
            suggestions.map((c) => (
              <CompanyRow key={c.id} c={c} destinationId={plan.destinationId} />
            ))
          ) : (
            <p className="mute">
              No verified company covers this destination yet.
            </p>
          )}
        </div>
      </div>

      <aside>
        <div className="box">
          <h3>Next steps</h3>
          <div className="stk">
            <span>
              <i className="ck">1.</i> Shortlist 2–3 verified companies
            </span>
            <span>
              <i className="ck">2.</i> Send this plan for quotes
            </span>
            <span>
              <i className="ck">3.</i> Compare inclusions, not just price
            </span>
            <span>
              <i className="ck">4.</i> Book and pay the 25% deposit
            </span>
          </div>
          <FormButton kind="callback" className="btn g w">
            📞 Get expert help
          </FormButton>
          <WhatsAppButton
            className="btn wo w"
            message={`Hi Trustify Trips, I'm planning a ${nights}N trip to ${destination?.name ?? ""} for ${plan.travellers} travellers.`}
          >
            💬 Send plan on WhatsApp
          </WhatsAppButton>
        </div>

        <div className="box">
          <h3>Status</h3>
          <button
            className={`chipb${plan.status === "draft" ? " on" : ""}`}
            onClick={() => onStatus("draft")}
          >
            Draft
          </button>
          <button
            className={`chipb${plan.status === "planned" ? " on" : ""}`}
            onClick={() => onStatus("planned")}
          >
            Planned
          </button>
        </div>

        {destination && (
          <div className="box">
            <h3>Good to know</h3>
            <div className="kv border-t-0">
              Best time<b>{destination.bestTime}</b>
            </div>
            <div className="kv">
              Difficulty<b>{destination.difficulty}</b>
            </div>
            <div className="kv">
              Typical budget<b>{destination.budget}</b>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
