# iOS Prototype: ASDLC-511 — All Day Event Indicator on Event Detail Page

## Scope
This prototype covers ONLY:
- **Event Detail Page** when `isAllDay == true` — showing the **bug** (12:00 AM time) and the **fix** (All Day capsule)
- **Event Detail Page** when `isAllDay == false` — reference timed event (unchanged behavior)

It does NOT prototype the Events list, Calendar view, or any other screen.

## Design System Source
- Accent color: `#779AFC` (from `BMColor.ActionButton.background` / `BMColor.barGraphEntryCurrent` via CodeGraph)
- Background: `#FAFAFA` (from `BMColor.modalBackground` light mode)
- Surface: `#FFFFFF` (from `BMColor.cardBackground` light mode)
- Primary text: `#2C2C2D` (from `BMColor.Calendar.blackText` light mode)
- Secondary text: `#626162` (from `BMColor.Calendar.grayedText` light mode)
- All Day capsule bg: `rgba(120,120,128,0.5)` (from `AllDayEventBannerView.swift` — `Capsule().fill(.gray.opacity(0.5))`)
- Font family: Apercu → `-apple-system, SF Pro, system-ui` (from `BMFont` in `berkeley-mobile/Assets/Fonts.swift`)
- Corner radius: `10px` (from `RoundedRectangle(cornerRadius: 10)` in `EventDetailView.swift`)
- Spacing unit: `16px` (from `.padding(.horizontal)` = 16 default, `.padding(.top, 20)` in EventDetailView)

## How to Run
1. Open `specs/ASDLC-511/prototype/index.html` in Chrome, Firefox, or Safari
2. No installation, no server, no build step required
3. Three iPhone 15 Pro frames are rendered side by side

## Screens
| Frame ID    | Name                   | Description |
|-------------|------------------------|-------------|
| `frame-bug`   | All Day Event (Before) | Shows the current bug: `isAllDay = true` but time row displays "12:00 AM" in red |
| `frame-fixed` | All Day Event (After)  | Shows the fix: time row replaced with an "All Day" capsule/pill badge |
| `frame-ref`   | Timed Event (Reference)| Shows normal timed event — time row displays "10:00 AM – 5:00 PM" (unaffected) |

## Navigation Flows
- All three frames are displayed simultaneously for direct visual comparison
- Tap the calendar badge icon (top-right) in any frame to see a simulated toast

## Interactions Implemented
- Side-by-side three-frame comparison (before/after/reference)
- All Day capsule hover highlight (subtle darkening)
- Calendar badge icon tap → toast notification
- Dark mode support via `@media (prefers-color-scheme: dark)`

## Key Code References
- **Bug location:** `berkeley-mobile/Events/EventDetailView.swift:153-158` — `timeView` computed property in `BMDetailHeaderView`
- **Bug cause:** `timeView` always renders `EventDetailRow` with the time portion of `dateString`, regardless of `event.isAllDay`
- **Existing all-day pattern:** `berkeley-mobile/Events/AllDayEventBannerView.swift` — uses `Capsule().fill(.gray.opacity(0.5))` with "All Day" bold text

## Acceptance Criteria Coverage
| AC | Screen | Status |
|----|--------|--------|
| When `isAllDay == true`, the time row must NOT show "12:00 AM" | `frame-bug` (before) | Illustrated |
| When `isAllDay == true`, the time row must show an "All Day" capsule/badge | `frame-fixed` (after) | Covered |
| When `isAllDay == false`, the time row continues to show the event time normally | `frame-ref` (reference) | Covered |
