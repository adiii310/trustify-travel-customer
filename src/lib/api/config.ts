/**
 * Static configuration for the Trustify Trips customer API.
 *
 * Everything here mirrors the contract documented in `api.md`. Nothing in this
 * file performs I/O — it is safe to import from server components, client
 * components and build scripts alike.
 */

/**
 * Base URL every request is appended to, with any trailing slash removed so
 * `BASE + '/companies'` can never produce a double slash.
 *
 * Set `NEXT_PUBLIC_API_URL` in `.env.local` when the API is not on
 * `localhost:5000` — see `.env.example`. The `NEXT_PUBLIC_` prefix is required
 * because the browser bundle reads this value.
 */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api"
).replace(/\/+$/, "");

/**
 * Extra headers required by the host the API is served from, not by the API.
 *
 * A free ngrok tunnel answers every browser-looking **GET** with its own HTML
 * interstitial (`ERR_NGROK_6024`) instead of proxying it. That page carries no
 * `Access-Control-Allow-Origin`, so the browser reports a CORS failure and the
 * backend's own — correct — CORS configuration is never reached.
 *
 * Only GET is intercepted: POST/PATCH/DELETE and the `OPTIONS` preflight all
 * pass through untouched, because only a GET can be the navigation the warning
 * page is written for. That asymmetry is what makes this so easy to
 * misdiagnose — the admin panel signs in fine (a POST) and then fails on every
 * list it loads, so the API looks reachable when it is not.
 *
 * `ngrok-skip-browser-warning` (any value) opts out of the interstitial.
 *
 * Scoped to ngrok hostnames so it costs nothing elsewhere: a custom header
 * makes an otherwise-simple `GET` preflight, and that round trip should not be
 * paid on a normal deployment.
 */
export const HOST_HEADERS: Readonly<Record<string, string>> =
  /\.ngrok(-free)?\.(dev|app|io)$/.test(hostOf(API_BASE_URL))
    ? { "ngrok-skip-browser-warning": "true" }
    : {};

/** Hostname of a URL, or `""` if it is relative or unparseable. */
function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

/**
 * The API rejects any request body larger than 100 KB with a 400. We check
 * client-side first so the user gets a useful message instead of a generic
 * validation error.
 */
export const MAX_REQUEST_BYTES = 100 * 1024;

/**
 * All six POST endpoints share a single budget: 20 submissions per IP per 10
 * minutes. Used to render "x submissions left" hints before the wall is hit.
 */
export const SUBMISSION_RATE_LIMIT = {
  max: 20,
  windowSeconds: 600,
} as const;

/**
 * `/reviews` and `/questions` are hard-capped server-side with no paging and
 * no `total`. Shown in the UI so a truncated list is never mistaken for the
 * complete set.
 */
export const LIST_CAP = 500;

/** Abort a request that has not responded in this many milliseconds. */
export const REQUEST_TIMEOUT_MS = 15_000;

/**
 * Poll interval for lists that change at human moderation speed. `api.md`
 * recommends 30s — reads are not rate limited, but anything faster is waste.
 */
export const POLL_INTERVAL_MS = 30_000;
