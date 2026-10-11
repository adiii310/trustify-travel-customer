export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

export const num = (n: number) => n.toLocaleString("en-IN");

export const stars = (n: number) => "★".repeat(Math.max(0, Math.round(n)));

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const monthYear = (iso?: string) => {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
};

export const longDate = (iso?: string) => {
  if (!iso) return "Dates not set";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const nightsBetween = (start: string, end: string) => {
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b <= a) return 0;
  return Math.round((b - a) / 86_400_000);
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const addDaysISO = (iso: string, days: number) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

/** Short, readable, collision-resistant enough for local records. */
export const newId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/** Join conditional class names, dropping anything falsy. */
export const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(" ");

/**
 * Turn a hosted file URL into one that downloads rather than displays.
 *
 * Uploaded files live on Cloudinary, whose `fl_attachment` delivery flag goes
 * in the transformation segment right after `/upload/`. The alternative — a
 * plain `<a download>` — is ignored by every browser for a cross-origin href,
 * so the flag is the only thing that actually makes "Download" download.
 *
 * Anything that is not a Cloudinary delivery URL (an admin may paste any
 * https address) is returned untouched rather than mangled.
 */
export const attachmentUrl = (url: string): string => {
  if (!url.includes("/upload/")) return url;
  if (url.includes("/upload/fl_attachment")) return url;
  return url.replace("/upload/", "/upload/fl_attachment/");
};
