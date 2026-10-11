"use client";

import Link from "next/link";
import { useState } from "react";

import { PanelSkeleton, SkeletonGroup } from "@/components/ui/Skeleton";
import { StatusPill, PaymentPill } from "@/components/account/BookingStatusPill";
import { useMyBookings } from "@/hooks/api";
import { inr, longDate } from "@/lib/format";
import { BOOKING_STATUS_LABELS, type BookingStatus } from "@/lib/types";
import { useAccountStore } from "@/store/accountStore";

/** The statuses worth offering as a filter — the rest are rare enough to scan. */
const FILTERS: (BookingStatus | "")[] = [
  "",
  "pending",
  "awaiting_payment",
  "confirmed",
  "completed",
  "cancelled",
];

/**
 * Every booking on the signed-in traveller's account.
 *
 * The API returns only their own — the member comes from the token, never from
 * a parameter — so there is nothing to filter for ownership here.
 */
export default function MyBookings() {
  const [status, setStatus] = useState<BookingStatus | "">("");
  const token = useAccountStore((s) => s.token);
  const { data, isPending, isError, error } = useMyBookings(status || undefined);

  if (!token) {
    return (
      <div className="empty">
        <Link className="btn g sm" href="/account/login?next=/account/bookings">
          Sign in to see your bookings
        </Link>
      </div>
    );
  }

  if (isPending) {
    return (
      <SkeletonGroup label="Loading your bookings" className="grid gap-3">
        <PanelSkeleton lines={4} />
        <PanelSkeleton lines={4} />
      </SkeletonGroup>
    );
  }

  if (isError) return <div className="empty">{error.message}</div>;

  return (
    <>
      <div className="chips mb-4">
        {FILTERS.map((f) => (
          <button
            key={f || "all"}
            type="button"
            className={`chipb${status === f ? " on" : ""}`}
            onClick={() => setStatus(f)}
          >
            {f ? BOOKING_STATUS_LABELS[f] : "All"}
          </button>
        ))}
      </div>

      {data.length ? (
        <div className="grid gap-3">
          {data.map((b) => (
            <article className="box m-0" key={b.id}>
              <div className="lh">
                <div>
                  <h3 className="m-0">{b.snapshot.title}</h3>
                  <small className="mute">
                    📍 {b.snapshot.destinationName} · {b.snapshot.companyName}
                  </small>
                </div>
                <span className="font-mono text-[13px]">{b.reference}</span>
              </div>

              <div className="chips my-3">
                <StatusPill status={b.status} />
                <PaymentPill status={b.paymentStatus} />
              </div>

              <div className="kv border-t-0">
                Travel date<b>{b.startDate ? longDate(b.startDate) : "To be agreed"}</b>
              </div>
              <div className="kv">
                Travellers<b>{b.travellers}</b>
              </div>
              <div className="kv">
                Duration
                <b>
                  {b.snapshot.days}D / {b.snapshot.nights}N
                </b>
              </div>
              <div className="kv">
                Quoted total<b>{inr(b.amount)}</b>
              </div>
              {b.paid > 0 ? (
                <div className="kv">
                  Paid so far
                  <b>
                    {inr(b.paid)}
                    {b.balance > 0 ? ` · ${inr(b.balance)} due` : ""}
                  </b>
                </div>
              ) : null}
              <div className="kv">
                Requested<b>{longDate(new Date(b.createdAt).toISOString())}</b>
              </div>

              {b.update ? (
                <p className="mute mt-3">
                  <b>Update from our team:</b> {b.update}
                </p>
              ) : null}

              <Link className="btn wo w mt-3" href={`/account/bookings/${b.id}`}>
                View full details
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">
          {status
            ? `No bookings with that status yet.`
            : "You have not requested any bookings yet."}
          <br />
          <Link className="btn g sm mt-3" href="/destinations">
            Browse destinations
          </Link>
        </div>
      )}
    </>
  );
}
