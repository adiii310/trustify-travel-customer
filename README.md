# Trustify Trips — Customer App

Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 implementation of the
`Trustify Trips – Travel. Verified.html` mock, extended into a working booking
and trip-planning app, wired to the customer API documented in [`api.md`](api.md).

**TanStack Query** owns server state, **Zustand** owns device state, and the
two never overlap.

Everything works **with or without a login**. Signing in is optional and only
attaches a name/email to data that is already being kept locally.

```bash
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at your API
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint
```

The API must allow this origin. Add `http://localhost:3000` to the backend's
`CORS_ORIGINS` and restart it, or every request fails in the browser before it
reaches the server — see [`.env.example`](.env.example).

---

## Routes

| Route | Rendering | What it does |
|---|---|---|
| `/` | Static | Hero + search, trust badges, popular destinations, verification steps, top-rated companies |
| `/destinations` | Dynamic (`?q=`) | Searchable destination grid |
| `/destinations/[slug]` | SSG (10 pages) | Destination hero, at-a-glance stats, filterable + sortable company list, helper sidebar |
| `/companies` | Dynamic (`?q=`, `?sort=`) | Full company ranking |
| `/companies/[slug]` | SSG (8 pages) | Company profile. Tabs are a `?tab=` param so every tab is linkable and server-rendered |
| `/compare` | Static shell | Side-by-side comparison of 2–3 companies, best value per row highlighted |
| `/book/[packageId]` | SSG (90 pages) | 3-step booking: trip details → contact → review & confirm |
| `/trips` | Static shell | Bookings, trip plans and saved companies |
| `/trips/new` | Static shell | Trip planner — destination, dates, budget, interests → matched companies |
| `/trips/[id]` | Client | Booking voucher or plan detail with a generated day plan |
| `/reviews` | Static shell | All traveller reviews, filterable by company and rating |
| `/resources` | Static | Travel guides |
| `/about` | Static | The 8-stage verification process and 9 trust parameters |
| `/become-verified` | Static | Company verification application |
| `/not-found`, `/error` | — | 404 and error boundaries |

Company tabs: `?tab=overview | reviews | packages | destinations | photos | documents | policies | qa`.

---

## Architecture

```
src/
  app/                  App Router pages, layout, globals.css
  components/
    cards/              DestinationCard, CompanyCard, CompanyRow, CompareButton
    companies/          CompanyDirectory (live ranking, URL-driven filters)
    company/            Tabs, TrustRadar (pure SVG), Reviews, Q&A
    destination/        DestinationDirectory, DestinationResults
    home/               HeroSearch, PopularDestinations, TopCompanies
    booking/            BookingFlow (3-step wizard)
    trips/              TripsDashboard, TripPlanner, TripDetail
    compare/            CompareTable
    reviews/            AllReviews
    ui/                 Modal, FormButton, QuerySearch, WhatsAppButton

  lib/
    api/                ── THE API LAYER ──────────────────────────────
      config.ts         Base URL, request/rate limits, timeouts
      types.ts          Wire types — a 1:1 mirror of api.md
      errors.ts         ApiError + the user-facing message mapping
      client.ts         The only module that calls fetch
      endpoints.ts      One typed function per endpoint
      mappers.ts        Wire shape → domain model
    query/
      keys.ts           Hierarchical query-key factory
      queryClient.ts    QueryClient defaults (staleness, retry policy)
    data/               Static catalogue: packages + editorial enrichment
    types.ts            Domain model
    forms.ts            Declarative config for every dialog form
    tabs.ts             Company tab keys (shared server ↔ client)
    format.ts           ₹ formatting, dates, slugs, ids
    storage.ts          SSR-safe localStorage wrapper (theme only)

  hooks/
    api/                ── SERVER STATE (TanStack Query) ──────────────
      useCompanies.ts   useCompanies, useCompany, useCompanyCode
      useDestinations.ts
      useReviews.ts     useReviews, useCompanyReviews
      useQuestions.ts   useQuestions, useCompanyQuestions
      useHealth.ts
      useSubmissions.ts All six POST endpoints, as mutations
    useApp.ts           Facade over the stores (toasts + a `ready` flag)

  store/                ── DEVICE STATE (Zustand) ─────────────────────
    accountStore.ts     Captured traveller identity (persisted)
    savedStore.ts       Saved companies (persisted)
    compareStore.ts     Compare tray, max 3 (persisted)
    tripsStore.ts       Bookings + plans (persisted)
    rateLimitStore.ts   Submission budget from RateLimit-* headers (memory)
    useHydrated.ts      Hydration gate for persisted state

  providers/            Theme, Query, Toast, Dialog (modals + submissions)
  styles/               tokens.css, components.css, pages.css
```

### Server vs client

Pages are server components by default. Only the pieces that need state are
`"use client"` — filters, tabs, the booking wizard, the planner and the
providers. `generateStaticParams` prerenders every destination, company and
package page.

> Note: values shared between a server page and a client component must live
> in a non-`"use client"` module (see `src/lib/tabs.ts`). A server component
> importing a value from a client module receives a reference proxy, not the
> value.

### State: two kinds, never mixed

| | Server state | Device state |
|---|---|---|
| Owned by | The API | This browser |
| Tool | TanStack Query | Zustand |
| Lives in | `src/hooks/api` | `src/store` |
| Examples | companies, destinations, reviews, questions | saved companies, compare tray, trips, captured identity |
| Persisted | In the query cache, for the tab's lifetime | `localStorage`, under `tt.*` keys |

The rule that keeps this honest: **server data is never copied into a Zustand
store.** The moment it is, there are two sources of truth and one of them is
stale. Components read it through a query hook every time; TanStack handles the
caching.

`useApp()` (`src/hooks/useApp.ts`) is a thin convenience facade over the stores.
It exists for two reasons only — turning a store's return value into a toast,
and exposing one `ready` flag — and holds no server data. New code can use the
stores directly.

#### Hydration

Zustand's `persist` reads `localStorage` synchronously when the store module is
first evaluated in the browser, so by the time React hydrates the store already
holds the visitor's data — while the server-rendered HTML was built from empty
defaults. `useHydrated()` bridges that: it is `false` on the server and on the
first client render, `true` from the first effect onwards. Gate any render of
persisted state on it.

### The API layer

Everything flows one way, and each arrow is one module:

```
component → hooks/api → lib/api/endpoints → lib/api/client → fetch
                              ↓
                       lib/api/mappers  (wire shape → domain model)
```

- **`lib/api/types.ts`** mirrors `api.md` exactly, terse field names and all
  (`k`, `c`, `n`, `r`, `t`, `q`, `a`, `d`, `ts`). A backend change surfaces here
  as a compile error instead of an `undefined` three layers down.
- **`lib/api/client.ts`** is the only place `fetch` is called. It unwraps the
  `{ success, statusCode, message, data }` envelope, converts every failure —
  network, HTTP, malformed — into a single `ApiError`, and broadcasts the
  `RateLimit-*` headers.
- **`lib/api/mappers.ts`** converts wire shapes to the domain model, resolving
  each value as `live API → static catalogue → neutral default`.

#### Why a static catalogue still exists

The public API serves less than the UI renders. These are **not** available
from any endpoint, so `src/lib/data` remains the source for them:

| Missing from the API | Where it comes from |
|---|---|
| Packages, itineraries, inclusions | `lib/data/packages.ts` (the booking flow is local) |
| Trust-score breakdown (9 parameters) | Static profile, else a flat spread at the headline score |
| Company "about" copy, documents, policies | Static profile, else a generated summary + platform defaults |
| Which destinations a company covers | Static profile — the API has no company↔destination relation |
| Destination highlights | Static profile |
| `best` / `diff` / `dur` / `budget` on a destination | The API when present (often absent), else the static profile |

Every **figure** — trust score, rating, price, review count, company count — is
always the live one. The catalogue only fills in editorial content the API has
no field for.

#### Errors

One type, caught once:

```ts
catch (cause) {
  if (isApiError(cause)) {
    cause.rateLimited   // 429 — the shared submission budget is spent
    cause.isValidation  // 400 — cause.fieldErrorMap highlights the inputs
    cause.isServer      // 5xx — message is generic by design
    cause.kind          // "network" | "http" | "malformed"
  }
  toast(toUserMessage(cause));
}
```

Retries are policy, not per-call: 4xx is never retried (a 400 fails identically,
a 429 only gets worse), and **mutations are never retried at all** — each one
writes a record and spends one of the twenty submissions allowed per IP per
10 minutes.

### Forms and submissions

`DialogProvider` drives all six modal forms (login, enquiry, callback, apply,
review, ask) from the declarative config in `lib/forms.ts`, and is the single
place any submission is made. It handles, once, what would otherwise be
repeated six times:

- the submit button is disabled in flight, so a double click cannot spend two
  submissions;
- a 400's field errors are translated from API names (`t`, `n`, `q`) to form
  field names and shown under the right input;
- a 429 gets its own copy, because "try again" is the wrong advice;
- the remaining budget is shown once it drops to 5, read from the
  `RateLimit-*` headers of the last response;
- a review's success message is chosen from the `status` the server returns —
  `"approved"` or `"pending"` is a server setting, never an assumption.

Company identity is the subtlety worth knowing: pages work in **slugs**
(`/companies/holiday-heaven`), the API works in **short codes** (`"H"`).
`FormButton` resolves one to the other from the live company list before the
dialog opens, because that code is what attributes an enquiry and what a review
or question is filed under.

### Styling

Tailwind v4, configured entirely in CSS (`src/app/globals.css`) — no
`tailwind.config.js`.

- `styles/tokens.css` → design tokens and base element styles, imported into
  Tailwind's `base` layer so they land after preflight.
- `styles/components.css` + `styles/pages.css` → the design system ported from
  the mock (gradients, clip-path hero art, cards, tables), imported into the
  `components` layer so any Tailwind utility overrides them inline.
- `@theme` maps the brand palette onto Tailwind utilities: `bg-navy`,
  `text-gold`, `border-line`, `text-mute`, `bg-card`. The semantic colours
  point at the runtime CSS variables, so they follow the active theme.

### Theming

Three states — `light`, `dark`, `system` (default) — resolved as:

1. `[data-theme="light"|"dark"]` on `<html>` when the user has chosen;
2. `prefers-color-scheme` otherwise.

`themeInitScript` runs in `<head>` before first paint so there is no flash. The
toggle always switches to the opposite of what is currently on screen, then
hands control back to the OS, so one tap always produces a visible change. A
matching `dark:` variant is defined in `globals.css` for utility-level
overrides.

---

## What is wired, and what is not

| API endpoint | Used by |
|---|---|
| `GET /companies` | Homepage ranking, `/companies` directory, compare table, review picker, every slug↔code lookup |
| `GET /destinations` | Homepage grid, `/destinations` directory |
| `GET /reviews?c=` | Company profile → Reviews tab |
| `GET /reviews` | `/reviews` — all traveller reviews |
| `GET /questions?c=` | Company profile → Q&A tab |
| `POST /enquiries` | "Send an enquiry" on a company or package |
| `POST /callbacks` | "Request a call back" |
| `POST /applications` | `/become-verified` |
| `POST /questions` | "Ask a question" on a company profile |
| `POST /reviews` | "Write a review", anywhere |
| `POST /members` | Login / Join |
| `GET /health` | `useHealth()` — available, not yet shown in the UI |

Deliberately still local, because the public API has no endpoint for them:

- **Bookings and trip plans** (`/book/*`, `/trips/*`). There is no booking
  endpoint and no "my trips" read, so these live in `tripsStore`. The UI never
  presents a trip as confirmed by the company.
- **Packages and itineraries** (`lib/data/packages.ts`).
- **Company profile pages** are still prerendered from the static slug list.
  `generateStaticParams` runs at build time, when the API may not be reachable;
  the page shell is static while its reviews and Q&A tabs are live.

### Limits worth knowing

- `POST /members` is **identity capture, not authentication**. It returns no
  token, grants no access, and always responds 201 — a sign-up and a sign-in are
  indistinguishable. Nothing in the app may gate access on it.
- Reviews and questions are **capped at 500** with no paging and no total. Both
  list views say so when they hit the cap rather than implying it is everything.
- There is **no by-id endpoint, and no search, filter or sort** beyond `?c=`.
  All of it happens in the browser, which is why the directory pages are client
  components reading `?q=` / `?sort=` from the URL.
- Review `c` codes are validated server-side; question `c` codes are **not** —
  a wrong code silently creates an orphan. Codes always come from the live
  company list, never from user input.
