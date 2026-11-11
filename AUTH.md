# AUTH.md — Demo Authentication and Authorization Boundaries

## Demo identity

`/signin` lists active seeded demo users and allows selecting one of their available roles. `signInAsDemo()` stores the chosen user and role in `sessionStorage`; signup creates a renter demo profile. This flow does not verify passwords and is not production authentication.

The storage/domain helpers in `lib/storage.ts` recheck the active user, role, record participation, and/or ownership when performing booking lifecycle, review, dispute, and owner-response actions. Pages also hide or refuse actions for unauthorized users. `safeReturnPath()` permits only safe internal navigation paths to reduce open-redirect risk.

## Manual negative checks

1. Sign out, then open a protected booking/owner route or submit a checkout action. The demo should require sign-in and reject the write.
2. Sign in as a different renter or owner and try a booking or vehicle belonging to another user. The page/action should deny access.
3. Open `/signin?next=https://example.com` (also try protocol-relative or backslash paths). The post-sign-in destination should remain internal.
4. Try approving a booking against dates already occupied by another active booking. The transition should fail rather than overlap.

## Security statement

These are client-side demo guardrails only. Users control browser storage and can bypass them. Production use requires server-enforced authorization, secure sessions, validated APIs, rate limits, audit logging, and payment-provider verification. No real payment is taken by this application.
