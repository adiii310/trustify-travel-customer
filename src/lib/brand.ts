/**
 * The brand name used in the **document title** only.
 *
 * Everything the page renders reads `useSiteSettings()` and shows the
 * admin-configured name. Next resolves `metadata` on the server, where this
 * app has no API access — every call it makes is from the browser — so the
 * `<title>` needs a value that exists at module evaluation.
 *
 * This is not a content fallback: it never reaches the page body, and changing
 * the site name in the admin panel changes every visible occurrence. Update it
 * here too if the company is ever renamed.
 */
export const BRAND = "Trustify Trips";
