# iOS Prototype: ASDLC-510 — All Day Event Indicator on Event Detail Page

## Scope
This prototype covers ONLY:
1. **Events List** — context screen showing all-day and timed events with correct row indicators
2. **Timed Event Detail** — event detail page with clock icon + time string (reference / correct behavior)
3. **All Day Event Detail** — event detail page with clock icon + "All Day" pill (the AC screen, with before/after toggle)

## Design System Source
- Accent color: `#FB9B8E` (from `BMColor.selectedButtonBackground` via CodeGraph)
- Calendar header: `#5670B9` (from `BMColor.Calendar.dayOfWeekHeader` via CodeGraph)
- Modal background: `#FAFAFA` light / `#414141` dark (from `BMColor.modalBackground` via CodeGraph)
- Card background: `#FFFFFF` light / `#474747` dark (from `BMColor.cardBackground` via CodeGraph)
- Font family: `Apercu` → system-ui fallback (from `BMFont` struct via CodeGraph)
- Corner radius: `10px` / `12px` (from `clipShape(RoundedRectangle(cornerRadius:))` usage in `EventDetailView` via CodeGraph)
- "All Day" pill style: capsule, `gray.opacity(0.5)` fill, `BMFont.bold(15)` label — matched from `AllDayEventBannerView.swift` via CodeGraph

## How to Run
1. Open `specs/ASDLC-510/prototype/index.html` in Chrome, Firefox, or Safari
2. No installation, no server, no build step required
3. Renders inside an iPhone 15 Pro frame (393×852, Dynamic Island)

## Screens

| Screen ID               | Name                     | Description                                                            |
|-------------------------|--------------------------|------------------------------------------------------------------------|
| `screen-events-list`    | Events List              | List of today's events; all-day events show a small "All Day" badge    |
| `screen-detail-timed`   | Timed Event Detail       | Detail page for a regular timed event — clock icon + "2:00 PM – 4:00 PM" |
| `screen-detail-allday`  | All Day Event Detail     | Detail page for an all-day event — clock icon + "All Day" pill (AC)    |

## Navigation Flows
- Events List → tap any all-day event row → `pushScreen('screen-detail-allday')`
- Events List → tap any timed event row → `pushScreen('screen-detail-timed')`
- Detail screen → tap "Events" back button → `popScreen()`

## Interactions Implemented
- Push/pop navigation stack (slide right in / slide right out, 300ms ease)
- "After Fix / Before Fix" comparison toggle on the All Day detail screen
  - **After Fix** (default): clock icon + "All Day" capsule pill — correct expected behavior
  - **Before Fix**: clock icon + "12:00 AM" text — the current bug being fixed

## Acceptance Criteria Coverage

| AC | Screen | Status |
|----|--------|--------|
| All-day events must NOT display a time value (e.g. "12:00 AM") in the time row | `screen-detail-allday` | Covered — "Before Fix" toggle shows the bug |
| The time row should show an "All Day" capsule/badge for all-day events | `screen-detail-allday` | Covered — default state shows the pill |
| Timed events continue to show their time string correctly | `screen-detail-timed` | Covered — reference screen unchanged |
