# Sheggar Wheels

A responsive, frontend-only peer-to-peer car-rental demo for Addis Ababa. It includes renter, vehicle-owner, and administrator experiences, with browser storage standing in for a backend.

## Run locally

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To verify a production build, run `npm run build` and then `npm start`. `npm run lint` runs ESLint; the repository currently has lint findings that are tracked separately from the successful production build.

No backend or payment credentials are needed. `/signin` offers seeded demo identities and role buttons. Signup creates a demo renter account.

## Main flows

- Browse `/cars`; search, sort, filter by city/seats/dates, and open approved listings.
- Choose dates and continue through `/checkout` to create a **requested** booking with a simulated held payment. The vehicle owner must approve it before it becomes confirmed.
- Renters and owners can view permitted booking details and use the available lifecycle actions. Eligible completed trips can be reviewed; participants can open a dispute.
- Owners can manage their own vehicles and availability, respond to reviews/disputes, review requests, see earnings/utilization, and export a CSV.
- Admin demo users can moderate listings and accounts, inspect bookings/disputes, publish announcements, and view reports.
- Map tiles use OpenStreetMap. Listing pins and trip movement use seed/demo coordinates; tracking is a simulation, not GPS.

Route inventory and behavior are documented in [STRATEGY.md](./STRATEGY.md). The frontend-only trust boundary and demo limitations are described in [AUTH.md](./AUTH.md) and [BOUNDARY.md](./BOUNDARY.md).
