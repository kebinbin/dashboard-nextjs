# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

This is the Next.js App Router Course starter (invoice dashboard) — a Next.js app using the App Router, React Server Components, Server Actions, Tailwind, and PostgreSQL. It talks to Postgres directly via the `postgres` client using `process.env.POSTGRES_URL` (SSL required). A `.env` at the repo root is expected to supply `POSTGRES_URL` and `AUTH_SECRET`.

## Commands

- `npm run dev` — start dev server with Turbopack
- `npm run build` — production build
- `npm run start` — run built app
- `npm run lint` — ESLint (flat config wrapping `eslint-config-next` via `FlatCompat`)
- No test runner is configured.
- Seed / reset schema: hit `GET /seed` once the dev server is running (see `app/seed/route.ts`). It creates the `users`, `customers`, `invoices`, and `revenue` tables (with `uuid-ossp`) and inserts placeholder data idempotently.

Path alias `@/*` maps to the repo root (see `tsconfig.json`).

## Architecture

### Routing (App Router)

- `app/page.tsx` — public landing page.
- `app/login/page.tsx` — sign-in page (renders `app/ui/login-form.tsx`; the form is not wired to an action yet).
- `app/dashboard/layout.tsx` — authenticated shell (sidebar nav).
- `app/dashboard/(overview)/page.tsx` — dashboard home (route group hides `(overview)` from the URL, so the path is `/dashboard`).
- `app/dashboard/invoices/{page.tsx, create/page.tsx, [id]/edit/page.tsx, error.tsx}` — invoice CRUD; `error.tsx` is the route-level error boundary.
- `app/dashboard/customers/page.tsx` — customers page (placeholder for now).
- `app/seed/route.ts` — Route Handler (dev-only utility). `app/query/route.ts` is fully commented out.

### Data layer

Two files, split by read vs. write. Each server module (`data.ts`, `actions.ts`, `auth.ts`, `seed/route.ts`) creates its own client with `postgres(process.env.POSTGRES_URL!, { ssl: "require" })`; match that pattern in new server modules.

- `app/lib/data.ts` — read queries (`fetchRevenue`, `fetchLatestInvoices`, `fetchCardData`, `fetchFilteredInvoices`, `fetchInvoicesPages`, `fetchInvoiceById`, `fetchCustomers`, `fetchFilteredCustomers`). Called from Server Components. `fetchRevenue` has an intentional 3s delay to demo streaming/Suspense.
- `app/lib/actions.ts` — Server Actions (`"use server"`): `createInvoice`, `updateInvoice`, `deleteInvoice`. Forms in `app/ui/invoices/{create,edit}-form.tsx` bind these with `useActionState`; return type `State` carries Zod field errors + a message. Actions call `revalidatePath('/dashboard/invoices')` and `redirect(...)` on success.
- `app/lib/definitions.ts` — DB row + view-model TypeScript types (money stored in cents as `INT`; formatters in `app/lib/utils.ts` convert to display strings).
- `app/lib/placeholder-data.ts` — seed data for `/seed`.

Note: `deleteInvoice` currently throws an intentional error at the top of the function to demonstrate the `error.tsx` boundary — do not "fix" it without checking with the user.

### Auth (NextAuth v5 beta, Credentials provider)

Three files, split so the edge-safe config can be imported by the proxy without pulling in `bcrypt`/`postgres`:

- `auth.config.ts` — edge-safe: pages + `authorized` callback that gates `/dashboard/*` and bounces logged-in users to `/dashboard`. `providers: []` here.
- `auth.ts` — Node-only: spreads `authConfig`, adds the `Credentials` provider (looks up user by email, `bcrypt.compare`s password), and exports `auth`, `signIn`, `signOut` (not used anywhere yet).
- `proxy.ts` — the request-time gate. Exports `NextAuth(authConfig).auth` as default, with a `matcher` that excludes `api`, `_next/static`, `_next/image`, and `*.png`. Note: this repo uses `proxy.ts` rather than the more common `middleware.ts` — keep the filename and default export shape when editing.

Passwords in seed data are hashed at seed time (`app/seed/route.ts`).

### UI conventions

- `app/ui/**` holds all shared components; `app/ui/skeletons.tsx` provides route-level loading skeletons used with `<Suspense>` in the dashboard pages.
- `app/ui/search.tsx` uses `use-debounce` + `useRouter`/`useSearchParams` to push `?query=` into the URL — server components then read `searchParams` and call the data-layer filter functions. Pagination works the same way (`?page=`).
- `clsx` is used for conditional class names; forms use `@tailwindcss/forms`.
- Fonts are loaded via `next/font` in `app/ui/fonts.ts` and applied in `app/layout.tsx`.

## Current state (course in progress)

- Login and sign-out are NOT wired yet: the forms in `app/ui/login-form.tsx` and `app/ui/dashboard/sidenav.tsx` have no actions.
- `app/dashboard/customers/page.tsx` is a placeholder; `fetchFilteredCustomers` is unused.
- `app/query/route.ts` is fully commented out.

## Conventions

- Data reads go in `app/lib/data.ts` (called from Server Components); mutations go in `app/lib/actions.ts` as Server Actions. No API routes for app data.
- Validate all Server Action input with Zod before touching the DB.
- Money is stored in cents (INT); convert only for display via `formatCurrency`.
- Styling: Tailwind utility classes + `clsx` only. No CSS modules or inline styles.
- Icon-only buttons need an `aria-label` or `<span className="sr-only">`.
- Never hardcode connection strings, secrets or URLs. Use `process.env`.
- Don't commit local artifacts: `.playwright-mcp/`, screenshots, `tmp-*` files.
