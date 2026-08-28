# iOS Prototype: ASDLC-516 — All Day Event Indicator

## Scope
This prototype covers **only**: the Event Detail Page time row, showing the "All Day" capsule badge replacing the misleading "12:00 AM" time value for all-day events.

## Design System Source
- Accent / calendar blue: `#5670B9` (from `BMColor.Calendar.dayOfWeekHeader` via CodeGraph)
- Background light: `#FAFAFA` / dark: `#000000` (from `BMColor.modalBackground`)
- Surface light: `#FFFFFF` / dark: `#1C1C1E` (from `BMColor.cardBackground`)
- Primary text light: `#2C2C2D` / dark: `#FAFAFA` (from `BMColor.Calendar.blackText`)
- Secondary text: `#626162` / `#AAAAAA` (from `BMColor.Calendar.grayedText`)
- All Day badge bg: `rgba(120,120,128,0.18)` (mirroring `AllDayEventBannerView` `.gray.opacity(0.5)` on white)
- Font family: `Apercu` (from `BMFont`, fallback `system-ui`)
- Corner radius: `10–12px` (from `clipShape(RoundedRectangle(cornerRadius:10/12))` in `BMDetailHeaderView`)

## How to Run
1. Open `specs/ASDLC-516/prototype/index.html` in Chrome, Firefox, or Safari
2. No installation, no server, no build step required
3. Renders inside an iPhone 15 Pro frame (393×852)

## Screens
| Screen ID            | Name              | Description                                        |
|----------------------|-------------------|----------------------------------------------------|
| screen-event-detail  | Event Detail Page | All-day event with "All Day" capsule in time row   |

## Navigation Flows
- No navigation required — single-screen fix

## Toggle
Use the **toggle bar** below the phone frame to switch between:
- **Fix: All Day** — shows the "All Day" capsule badge (correct expected behavior)
- **Bug: 12:00 AM** — shows the misleading time text (current broken behavior)

## Interactions Implemented
- Toggle between buggy and fixed states of the time row
- "All Day" capsule (gray pill, bold label) replacing clock time for all-day events
- Matches `AllDayEventBannerView` capsule style + `EventDetailRow` layout from codebase

## Acceptance Criteria Coverage
| AC                                                               | Screen               | Status  |
|------------------------------------------------------------------|----------------------|---------|
| Time row shows "All Day" capsule for all-day events              | screen-event-detail  | Covered |
| Time row no longer shows "12:00 AM" for all-day events           | screen-event-detail  | Covered (toggle to "Bug" to compare) |
| Capsule/pill-shaped label used for the All Day indicator         | screen-event-detail  | Covered |
