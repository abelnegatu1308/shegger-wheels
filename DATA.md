# DATA.md — Demo Data and Browser Storage

## Persistence

The app has no database or API. Seeded records are initialized in `localStorage` and persist in the current browser profile. The active demo identity and temporary checkout draft use `sessionStorage`.

| Key | Storage | Type | Contents |
| --- | --- | --- | --- |
| `sw_users_v1` | localStorage | `User[]` | Demo renter/owner/admin profiles and account status |
| `sw_cars_v1` | localStorage | `Car[]` | Vehicle details, availability, owner, and moderation state |
| `sw_bookings_v1` | localStorage | `Booking[]` | Request, payment-demo, and trip lifecycle data |
| `sw_reviews_v1` | localStorage | `Review[]` | Eligible renter reviews and owner replies |
| `sw_disputes_v1` | localStorage | `Dispute[]` | Dispute reason, responses, and resolution |
| `sw_announcements_v1` | localStorage | `Announcement[]` | Admin-authored platform notices |
| `sw_session_v1` | sessionStorage | `SessionState` | Current demo user and selected role |
| `sw_checkout_draft_v1` | sessionStorage | `CheckoutDraft` | Temporary selected vehicle/date/price summary |

`readStorage`/`readSession` handle unavailable or malformed JSON by reporting the read failure and returning a caller-provided fallback. Collection access additionally rejects non-array or malformed collection values. Writes return success/failure; callers should show errors rather than assume persistence succeeded. `resetDemoData()` restores the seeded demo data.

## Domain constraints

- New bookings are requests and do not imply owner approval or a real payment.
- Dates use ISO `YYYY-MM-DD` strings and end-exclusive intervals.
- Requested, confirmed, in-progress, and disputed trips block overlapping dates; approval rechecks conflicts.
- Reviews require an eligible completed booking and are limited to one per booking.
- Demo map coordinates are seeded values; tracking steps are simulated.

This data model is intentionally browser-local and unsuitable for concurrent users or production records.
