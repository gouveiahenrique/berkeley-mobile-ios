# iOS Prototype: ASDLC-499 — All Day Indicator on Event Detail Page

## Scope
This prototype covers **only** the Event Detail screen time row, demonstrating:
1. **Expected (Fixed)** — all-day event shows an "All Day" capsule/pill badge
2. **Timed Event** — regular event continues showing start–end time (no change)
3. **Current (Bug)** — accessible via `setMode('wrong')` in the browser console to see the broken 12:00 AM display

## Design System Source
| Token | Value | Source |
|---|---|---|
| Accent color | `#779AFC` | `BMColor.ActionButton.background` / `barGraphEntryCurrent` |
| Calendar blue | `#5670B9` | `BMColor.Calendar.dayOfWeekHeader` |
| Background | `#FAFAFA` light / `#414141` dark | `BMColor.modalBackground` |
| Card surface | `#FFFFFF` light / `#484747` dark | `BMColor.cardBackground` |
| Font family | Apercu → system-ui fallback | `BMFont` struct |
| Corner radius | `12px` | `CardView.layoutSubviews` |
| Capsule radius | `100px` | `AllDayEventBannerView` (Capsule shape) |

## How to Run
1. Open `specs/ASDLC-499/prototype/index.html` in Chrome, Firefox, or Safari
2. No installation, no server, no build step required
3. Renders inside an iPhone 15 Pro frame (393×852)

## Screens
| Screen ID | Name | Description |
|---|---|---|
| `screen-event-detail` | Event Detail | BMDetailHeaderView card with time row toggled by event type |

## Navigation Flows
No push/pop navigation — single screen prototype focused on the time-row component change.

## Interactions Implemented
- **"All Day Event" toggle** — shows the All Day capsule pill in the time row
- **"Timed Event" toggle** — shows "10:00 AM – 4:00 PM" text for comparison
- **`setMode('wrong')` (console)** — demonstrates the buggy 12:00 AM state

## Acceptance Criteria Coverage
| AC | Screen | Status |
|---|---|---|
| All-day event time row shows "All Day" capsule instead of 12:00 AM | Event Detail (All Day mode) | Covered |
| Timed events are unaffected | Event Detail (Timed mode) | Covered |
| Capsule/pill shape used for "All Day" label | All Day capsule component | Covered |
