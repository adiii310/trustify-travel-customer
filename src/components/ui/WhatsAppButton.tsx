import { SITE } from "@/lib/data/site";

export default function WhatsAppButton({
  className = "btn g w",
  message = SITE.whatsappMessage,
  children = "💬 Chat on WhatsApp",
}: {
  className?: string;
  message?: string;
  children?: React.ReactNode;
}) {
  const href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;

  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
