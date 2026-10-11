"use client";

import { useSiteSettings } from "@/hooks/api";

/**
 * Chat link, built from the WhatsApp number an admin configured.
 *
 * Renders **nothing** until the number loads, and nothing at all when it is
 * blank. A WhatsApp button that opens `wa.me/` with no number is worse than no
 * button: it looks like a working contact route and is a dead end.
 */
export default function WhatsAppButton({
  className = "btn g w",
  message,
  children = "💬 Chat on WhatsApp",
}: {
  className?: string;
  /** Overrides the admin-configured default message for this one button. */
  message?: string;
  children?: React.ReactNode;
}) {
  const { data: settings } = useSiteSettings();

  const number = settings?.whatsapp;
  if (!number) return null;

  const text = message ?? settings.whatsappMessage;
  const href = `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
