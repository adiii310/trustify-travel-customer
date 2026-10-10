/**
 * What is left in this file is **not** content.
 *
 * Site identity, the homepage badges, the verification steps, the resources
 * FAQ and the planner's interest chips all moved into the API and are edited
 * in the admin panel — nothing the customer site shows is hard-coded here any
 * more. These two are filter *mechanics*: numeric buckets the UI groups
 * results into, whose labels are descriptions of the numbers beside them.
 */

/**
 * The site's own routes. Code, not content: every entry has to correspond to a
 * page that exists, so an admin cannot usefully edit this without also shipping
 * the page behind it.
 */
export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/destinations", label: "Destinations" },
  { href: "/companies", label: "Verified Companies" },
  { href: "/compare", label: "Compare" },
  { href: "/trips", label: "My Trips" },
  { href: "/account/bookings", label: "My Bookings" },
  { href: "/reviews", label: "Reviews" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
];

export const BUDGET_RANGES = [
  { label: "Under ₹8,000", min: 0, max: 8000 },
  { label: "₹8,000 - ₹12,000", min: 8000, max: 12000 },
  { label: "₹12,000 - ₹18,000", min: 12000, max: 18000 },
  { label: "₹18,000 - ₹40,000", min: 18000, max: 40000 },
  { label: "₹40,000 & above", min: 40000, max: Number.MAX_SAFE_INTEGER },
];

export const DURATIONS = [
  { label: "2N / 3D", nights: [2] },
  { label: "3N / 4D", nights: [3] },
  { label: "4N / 5D", nights: [4] },
  { label: "5N / 6D & above", nights: [5, 6, 7, 8] },
];
