# BOUNDARY.md — Server and Client Component Boundaries

Sheggar Wheels is a frontend-only Next.js App Router application.

- `lib/storage.ts` accesses browser storage only after checking for `window`. Pages that need local demo data are client components; they load data after mount and use storage events to refresh shared UI.
- Dynamic server page wrappers resolve route params and pass the resulting IDs into client components. `Suspense` provides a streaming fallback for runtime route data.
- `MapPanel` is a client wrapper that dynamically loads Leaflet; the map depends on browser DOM APIs and OpenStreetMap tiles.
- The static shell, metadata, robots, and sitemap remain server-renderable. `NEXT_PUBLIC_SITE_URL` may be set to the canonical deployment origin; without it, local defaults are used.

Browser checks are for demonstration UX only. They do not create a trusted authorization boundary: a production version must move identity, permissions, data validation, and lifecycle writes behind authenticated server APIs.
