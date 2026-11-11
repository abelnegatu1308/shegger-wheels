# STRATEGY.md — Sheggar Wheels Rendering and Product Strategy

## Architecture

The Next.js App Router statically renders route shells where possible. Interactive pages are client components because demo identity and domain data live in browser storage. Dynamic route parameters are read by server page wrappers and streamed through `Suspense` boundaries where needed. Browser-only features (Leaflet and localStorage/sessionStorage) are loaded or accessed on the client.

## Route inventory

| Route | Purpose |
| --- | --- |
| `/` | Public landing page and featured approved vehicles |
| `/cars`, `/cars/[id]` | Searchable/filterable catalog and listing detail |
| `/signin`, `/signup` | Demo role selection and renter registration |
| `/dashboard`, `/bookings`, `/bookings/[id]` | Renter overview, booking list, receipt/status/actions |
| `/bookings/[id]/review` | Eligible renter review submission |
| `/bookings/[id]/track` | Participant-only simulated in-progress trip map |
| `/checkout` | Validated request creation and simulated held payment |
| `/owner`, `/owner/cars`, `/owner/cars/new` | Owner hub, fleet, and pending listing submission |
| `/owner/cars/[id]/edit`, `/owner/cars/[id]/availability` | Owner-owned vehicle editing and availability |
| `/owner/cars/[id]/bookings`, `/owner/disputes`, `/owner/reviews` | Owner request lifecycle, dispute response, and review replies |
| `/owner/earnings` | Earnings, utilization, chart, and CSV report |
| `/admin` | Moderation dashboard |
| `/admin/listings`, `/admin/users`, `/admin/users/[id]` | Listing and account review |
| `/admin/bookings`, `/admin/disputes`, `/admin/disputes/[id]` | Booking and dispute administration |
| `/admin/announcements`, `/admin/reports` | Platform notices and aggregate reports |
| `/robots.txt`, `/sitemap.xml` | Search-engine crawl metadata |

## Booking lifecycle

Checkout validates the selected listing, renter, dates, availability, calculated total, and booking overlap before creating a `requested` booking. A mock payment is marked held; it is not a real charge. The owner can approve or decline. Confirmed trips can start and complete through guarded transitions. A renter may cancel only in permitted states. Reviews and disputes have eligibility and participant checks. Date ranges are end-exclusive.

## Product boundaries

This app is a local frontend demo, not a marketplace backend. Browser state can be changed by the browser user and does not provide authoritative access control, payment processing, notifications, or live vehicle telemetry. See [AUTH.md](./AUTH.md), [DATA.md](./DATA.md), and [FUTURE.md](./FUTURE.md).
