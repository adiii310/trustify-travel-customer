# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # next dev — http://localhost:3000
npm run build      # production build (runs generateStaticParams, so the API may be unreachable)
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint (eslint flat config, next/core-web-vitals + next/typescript)
```

There is no test runner in this project — no test framework is installed and no test files exist. `npm run typecheck && npm run lint` is the full verification loop.

Imports use the `@/*` → `./src/*` alias.

## Environment

Copy `.env.example` → `.env.local`. The only variable is `NEXT_PUBLIC_API_URL` (default `http://localhost:5000/api`, including the `/api` suffix). It is `NEXT_PUBLIC_` because every call is made from the browser — changing it needs a dev restart or a rebuild.

Requests fail in the browser before reaching the server unless the **backend** lists this origin in its own `CORS_ORIGINS`. A CORS rejection surfaces only as a console error and reaches `catch` as `ApiError { status: 0, kind: "network" }` — never as a real status code.

## The contract: `api.md`

`api.md` is the authoritative spec for the customer API and `src/lib/api/types.ts` mirrors it 1:1, terse field names and all (`k`, `c`, `n`, `r`, `t`, `q`, `a`, `d`, `ts`). When the backend changes, update `types.ts` first — a mismatch should appear as a compile error, not an `undefined` three layers down. `README.md` documents the app in depth; read it before a non-trivial change.

## Architecture

### Two kinds of state, never mixed

| | Server state | Device state |
|---|---|---|
| Tool | TanStack Query | Zustand (`persist`, `tt.*` keys) |
| Lives in | `src/hooks/api/` | `src/store/` |
| Holds | companies, destinations, reviews, questions | saved companies, compare tray, trips, captured identity, rate-limit budget |

**Server data is never copied into a Zustand store.** Components read it through a query hook every time. `useApp()` is a thin facade over the stores (toasts + a `ready` flag) and holds no server data; new code can use the stores directly.

Zustand's `persist` reads `localStorage` synchronously at module evaluation, so the store is already populated when React hydrates while the server HTML was built from empty defaults. Gate any render of persisted state on `useHydrated()`.

### The API layer — one direction, one module per arrow

```
component → hooks/api → lib/api/endpoints → lib/api/client → fetch
                              ↓
                       lib/api/mappers  (wire shape → domain model)
```

- `lib/api/client.ts` is the **only** module that calls `fetch`. It unwraps the `{ success, statusCode, message, data }` envelope, converts every failure into a single `ApiError` (`kind: "network" | "http" | "malformed"`), rejects bodies over 100 KB before spending a round trip, and broadcasts `RateLimit-*` headers via `onRateLimit` (it cannot import the Zustand store without dragging React into a server-safe module).
- `lib/api/endpoints.ts` is the only module that knows URL paths, and returns raw wire payloads.
- `lib/api/mappers.ts` resolves each value as **live API → static catalogue → neutral default**. Every *figure* (trust score, rating, price, review count) is always the live one; the catalogue only fills editorial content the API has no field for.
- Query keys come from the `queryKeys` factory in `lib/query/keys.ts` — hierarchical, so `queryKeys.reviews.all()` invalidates every per-company list too.
- Retry is policy, not per-call (`lib/query/queryClient.ts`): 4xx is never retried, **mutations are never retried at all** — each one writes a record and spends one of 20 submissions per IP per 10 minutes.

### Why a static catalogue still exists

`src/lib/data/` is not legacy fixture data. The public API does not serve packages/itineraries, the 9-parameter trust-score breakdown, company "about" copy, documents, policies, company↔destination relations, or destination highlights. Mappers fall back to it; do not delete it when wiring an endpoint.

### Forms and submissions

`DialogProvider` drives all six modal forms (login, enquiry, callback, apply, review, ask) from the declarative config in `lib/forms.ts` and is the **single place any submission is made**. Adding a form means adding config, not a new component. It centralises: disabling the button in flight (a double click must not spend two submissions), translating a 400's API field names to form field names via `API_FIELD_TO_FORM_FIELD`, dedicated 429 copy, the remaining-budget hint, and choosing a review's success message from the server's returned `status`.

**Slug vs short code** is the recurring subtlety: pages work in slugs (`/companies/holiday-heaven`), the API works in short codes (`"H"`). `FormButton` resolves slug → code from the live company list before opening a dialog. Codes always come from the live list, never from user input — review `c` codes are validated server-side, question `c` codes are **not**, so a wrong one silently creates an orphan.

### Server vs client components

Pages are server components by default; only filters, tabs, the booking wizard, the planner and the providers are `"use client"`. `generateStaticParams` prerenders destinations, companies and packages.

Values shared between a server page and a client component must live in a non-`"use client"` module (see `src/lib/tabs.ts`) — a server component importing a value from a client module gets a reference proxy, not the value.

The API has no by-id, search, filter or sort beyond `?c=`, which is why directory pages are client components reading `?q=` / `?sort=` from the URL. Company tabs are a `?tab=` search param so every tab is linkable and server-rendered.

### Styling

Tailwind v4 configured entirely in CSS (`src/app/globals.css`) — there is no `tailwind.config.js`. `styles/tokens.css` goes into the `base` layer (after preflight); `styles/components.css` and `styles/pages.css` carry the design system ported from the mock and go into the `components` layer so Tailwind utilities override them. `@theme` maps brand colours (`bg-navy`, `text-gold`, `border-line`, `text-mute`, `bg-card`) onto runtime CSS variables so they follow the active theme.

Theme is `light` / `dark` / `system` (default), resolved from `[data-theme]` on `<html>` then `prefers-color-scheme`; `themeInitScript` runs in `<head>` before first paint.

## Constraints to respect

- `POST /members` is **identity capture, not authentication** — no token, no access, always 201, sign-up and sign-in indistinguishable. Nothing may gate access on it. The whole app must work logged out.
- Bookings and trip plans (`/book/*`, `/trips/*`) are **local only** — there is no booking endpoint and no "my trips" read. They live in `tripsStore`, and the UI must never present a trip as confirmed by the company.
- `/reviews` and `/questions` are capped at 500 server-side with no paging and no total. List views must say so when they hit `LIST_CAP` rather than implying completeness.
- All six POST endpoints share one budget of 20 per IP per 10 minutes.

`Trustify Trips – Travel. Verified.html` at the repo root is the original design mock the app was ported from, kept for reference and excluded from lint.
