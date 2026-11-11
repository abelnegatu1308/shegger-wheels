# FUTURE.md — Production Readiness Roadmap

1. Replace localStorage/sessionStorage domain writes with a backend API and durable database transactions. Enforce booking overlap and state transitions atomically.
2. Add real identity verification, secure server-side sessions, authorization policies, password recovery, rate limits, and audit logs.
3. Integrate a payment provider using server-created intents and verified webhooks; distinguish authorization, capture, refund, and payout.
4. Replace seeded map coordinates and marker stepping with consent-based location sharing, secure real-time transport, and retention controls.
5. Add automated tests for domain rules, cross-role access, persistence failure, and end-to-end renter/owner/admin workflows.
6. Resolve lint findings, verify accessible map alternatives and image optimization, and measure Lighthouse/Web Vitals on a deployed environment before setting performance targets.
7. Add deployment configuration, environment validation, monitoring, privacy/terms content, and operational support processes.
