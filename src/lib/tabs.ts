/**
 * Shared between the server page and the client tab bar, so it must NOT live
 * in a "use client" module — a server component importing a value from one
 * receives a client reference proxy, not the array itself.
 */
export const COMPANY_TABS = [
  { key: "overview", label: "Overview" },
  { key: "reviews", label: "Reviews" },
  { key: "packages", label: "Packages" },
  { key: "destinations", label: "Destinations" },
  { key: "photos", label: "Photos" },
  { key: "documents", label: "Documents" },
  { key: "policies", label: "Policies" },
  { key: "qa", label: "Q&A" },
] as const;

export type TabKey = (typeof COMPANY_TABS)[number]["key"];

export const isTabKey = (v: string | undefined): v is TabKey =>
  !!v && COMPANY_TABS.some((t) => t.key === v);
