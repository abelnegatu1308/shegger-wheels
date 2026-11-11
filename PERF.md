# PERF.md — Performance and Accessibility Notes

## Implemented

- Next.js App Router static/partial prerendering is used where browser data is not required at render time.
- Leaflet is dynamically imported from a client wrapper instead of being included in the initial server-rendered page.
- Interactive catalog filtering uses URL-backed state so searches can be shared and revisited.
- Reduced-motion preferences are respected for motion effects; focus-visible styles and responsive layouts support keyboard and smaller-screen use.
- Car images have a placeholder fallback. Some existing views still use ordinary `<img>` elements and can be migrated to `next/image` after image-host sizing and optimization requirements are decided.

## Validation

`npm run build` is the production build/type-check gate. `npm run lint` currently reports existing React effect, anchor, unused-import, and typing lint findings; see the command output for the current count. No Lighthouse score or real-device performance measurement has been recorded, so no score is claimed here.
