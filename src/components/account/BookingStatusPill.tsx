import {
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  type BookingStatus,
  type PaymentStatus,
} from "@/lib/types";

/**
 * Status chips, in the traveller's language rather than the workflow's.
 *
 * `rejected` reads as "Not available" and `pending` as "Request received":
 * the internal vocabulary is about the admin queue, and a customer reading
 * "rejected" about their own holiday deserves better wording.
 */
export function StatusPill({ status }: { status: BookingStatus }) {
  const tone =
    status === "confirmed" || status === "completed"
      ? "ok"
      : status === "cancelled" || status === "rejected"
        ? "off"
        : "wait";

  return <span className={`bpill ${tone}`}>{BOOKING_STATUS_LABELS[status]}</span>;
}

export function PaymentPill({ status }: { status: PaymentStatus }) {
  const tone = status === "paid" ? "ok" : status === "refunded" ? "off" : "wait";
  return <span className={`bpill ${tone}`}>{PAYMENT_STATUS_LABELS[status]}</span>;
}
