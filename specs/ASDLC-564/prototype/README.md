# iOS Prototype: ASDLC-564 — All Day Indicator on Event Detail Page

## Scope
This prototype covers **only** the screens required by the issue:
1. **Events List** — campus-wide events list, showing the All Day pill badge inline
2. **Event Detail Page** — the main screen; time row displays an "All Day" capsule/badge when `isAllDay = true`, instead of showing "12:00 AM"

## Design System Source
Tokens extracted from the Berkeley Mobile iOS codebase via CodeGraph:

| Token | Value | Source |
|---|---|---|
| Accent color | `#779AFC` | `BMColor.ActionButton.background` — rgb(119,154,252) |
| Background | `#FAFAFA` / `#000000` dark | `BMColor.modalBackground` |
| Surface | `#FFFFFF` / `#484747` dark | `BMColor.cardBackground` |
| Primary text | `#2C2C2D` / `#FAFAFA` dark | `BMColor.Calendar.blackText` |
| Secondary text | `#626162` / `#AAAAAA` dark | `BMColor.Calendar.grayedText` |
| Corner radius | `12px` | `CardView.layer.cornerRadius` |
| Font family | Apercu → system-ui fallback | `BMFont` (Apercu-Regular/Bold/Light) |
| Event: Academic | `#7297E6` | `BMColor.eventAcademic` |
| Event: Holiday | `#F3B659` | `BMColor.eventHoliday` |

## How to Run
1. Open `specs/ASDLC-564/prototype/index.html` in Chrome, Firefox, or Safari
2. **No installation, no server, no build step required**
3. Renders inside an iPhone 15 Pro frame (393×852)

## Screens

| Screen ID | Name | Description |
|---|---|---|
| `screen-events` | Events List | Campus Wide tab; 4 events, 2 all-day show the pill badge |
| `screen-detail` | Event Detail Page | BMDetailHeaderView replica; time row shows All Day badge or time |

## Navigation Flows

- **Events → Detail**: Tap any event row → detail slides in from right (NavigationStack push)
- **Detail → Events**: Tap "Events" back button → detail slides back out (pop)
- **Add to Calendar**: Tap calendar icon in nav bar → shows toast confirmation
- **Learn More / Register**: Tap action button → shows toast

## Interactions Implemented
- NavigationStack push/pop with iOS-style slide-and-parallax transition
- All Day badge renders in time row when `isAllDay === true`
- Time string renders when `isAllDay === false` (comparison: Career Fair, Colloquium)
- Small All Day pill also shown in the events list row for all-day events
- Calendar add/remove button in navigation bar
- Action buttons (Learn More, Register) with toast feedback
- Dark mode via `prefers-color-scheme: dark`

## Acceptance Criteria Coverage

| Acceptance Criterion | Screen | Status |
|---|---|---|
| All-day event shows "All Day" in time row instead of "12:00 AM" | `screen-detail` (Cal Day, César Chávez Day) | Covered |
| "All Day" is displayed as a capsule/pill-shaped label | `screen-detail` — `.all-day-badge` class | Covered |
| Timed events continue to show their start–end time | `screen-detail` (Career Fair, Physics Colloquium) | Covered |
| Visual distinction is clear between all-day and timed events | Both screens — badge vs. plain time text | Covered |

## Key CSS Component

The All Day badge is implemented as `.all-day-badge` in `styles.css`:

```css
.all-day-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(119, 154, 252, 0.18);  /* app accent dim */
  color: #779AFC;                          /* app accent */
  border: 1px solid rgba(119, 154, 252, 0.35);
  border-radius: 100px;   /* capsule / pill shape */
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 600;
}
```

This mirrors the `eventDefault` / `ActionButton.background` color palette from BMColor and uses a capsule border-radius to match iOS's standard pill-badge pattern (used in SwiftUI as `.clipShape(.capsule)`).
