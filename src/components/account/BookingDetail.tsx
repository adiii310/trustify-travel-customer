"use client";

import Link from "next/link";

import { StatusPill, PaymentPill } from "@/components/account/BookingStatusPill";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { PanelSkeleton, Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";
import { useMyBooking } from "@/hooks/api";
import { isApiError } from "@/lib/api/errors";
import { inr, longDate } from "@/lib/format";
import { useAccountStore } from "@/store/accountStore";

/**
 * One booking in full.
 *
 * Everything shown here comes from the customer projection, which the server
 * builds by naming what goes in — so the team's internal notes and the audit
 * trail are not merely hidden by this component, they never arrive.
 */
export default function BookingDetail({ bookingId }: { bookingId: string }) {
  const token = useAccountStore((s) => s.token);
  const { data: b, isPending, isError, error } = useMyBooking(bookingId);

  if (!token) {
    return (
      <div className="wrap page">
        <h1 className="page-title">Sign in to see this booking</h1>
        <Link
          className="btn g"
          href={`/account/login?next=${encodeURIComponent(`/account/bookings/${bookingId}`)}`}
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="wrap page">
        <SkeletonGroup label="Loading your booking" className="grid gap-4">
          <Skeleton w={280} h={30} />
          <PanelSkeleton lines={6} />
        </SkeletonGroup>
      </div>
    );
  }

  if (isError) {
    // A booking that is not this traveller's is a 404, not a 403 — the server
    // will not confirm that someone else's booking exists.
    const missing = isApiError(error) && error.status === 404;
    return (
      <div className="wrap page">
        <h1 className="page-title">
          {missing ? "Booking not found" : "Could not load this booking"}
        </h1>
        <p className="page-sub">
          {missing
            ? "We could not find that booking on your account."
            : error.message}
        </p>
        <Link className="btn y" href="/account/bookings">
          Back to My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="wrap page">
      <div className="crumb mute">
        <Link href="/">Home</Link> ›{" "}
        <Link href="/account/bookings">My Bookings</Link> › {b.reference}
      </div>

      <h1 className="page-title">{b.snapshot.title}</h1>
      <p className="page-sub">
        Booking reference <b className="font-mono">{b.reference}</b> · requested{" "}
        {longDate(new Date(b.createdAt).toISOString())}
      </p>

      <div className="chips mb-4">
        <StatusPill status={b.status} />
        <PaymentPill status={b.paymentStatus} />
      </div>

      {b.status === "pending" ? (
        <div className="box">
          <h3>What happens next</h3>
          <p className="mute">
            Your request has reached our team. We will call or email you to
            confirm the details and explain how to pay. <b>This is not a
            confirmed booking yet</b> — nothing is reserved until we confirm it
            with you.
          </p>
        </div>
      ) : null}

      {b.update ? (
        <div className="box">
          <h3>Update from our team</h3>
          <p className="mute">{b.update}</p>
        </div>
      ) : null}

      <div className="box">
        <h3>Your trip</h3>
        <div className="kv border-t-0">
          Destination<b>{b.snapshot.destinationName}</b>
        </div>
        <div className="kv">
          Operator<b>{b.snapshot.companyName}</b>
        </div>
        <div className="kv">
          Duration
          <b>
            {b.snapshot.days} days / {b.snapshot.nights} nights
          </b>
        </div>
        <div className="kv">
          Travel date<b>{b.startDate ? longDate(b.startDate) : "To be agreed"}</b>
        </div>
        <div className="kv">
          Travellers<b>{b.travellers}</b>
        </div>
        {b.requirements ? (
          <div className="kv">
            Your requirements<b>{b.requirements}</b>
          </div>
        ) : null}
      </div>

      <div className="box">
        <h3>Pricing</h3>
        <p className="mute mb-2.5">
          These are the figures from when you booked. They do not change if the
          package is re-priced later.
        </p>
        <div className="kv border-t-0">
          Price per person<b>{inr(b.snapshot.price)}</b>
        </div>
        <div className="kv">
          Travellers<b>× {b.travellers}</b>
        </div>
        <div className="kv">
          Quoted total<b>{inr(b.amount)}</b>
        </div>
        {b.advance > 0 ? (
          <div className="kv">
            Advance requested<b>{inr(b.advance)}</b>
          </div>
        ) : null}
        <div className="kv">
          Received<b>{inr(b.paid)}</b>
        </div>
        <div className="kv">
          Balance<b>{inr(b.balance)}</b>
        </div>
        <p className="mute mt-3">
          Payment is arranged directly with our team — we never take card
          details on this site.
        </p>
      </div>

      <div className="box">
        <h3>Need to change something?</h3>
        Talk to our team and quote <b className="font-mono">{b.reference}</b>.
        <WhatsAppButton
          message={`Hi Trustify Trips, I would like to talk about booking ${b.reference}.`}
        />
      </div>
    </div>
  );
}
