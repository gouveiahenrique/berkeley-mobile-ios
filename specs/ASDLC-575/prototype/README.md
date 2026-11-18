# iOS Prototype: ASDLC-575 — Event Detail: All Day Indicator

## Scope
This prototype covers **only** the Event Detail Page's time row, demonstrating the fix for ASDLC-575:

| Mode | Behavior |
|------|----------|
| **All Day Event** (fixed) | Clock row shows an "All Day" capsule/pill badge instead of a time value |
| **Timed Event** (reference) | Clock row shows "10:00 AM – 2:00 PM" (unchanged baseline) |

## Design System Source
Extracted from the codebase via CodeGraph:

| Token | Value | Source symbol |
|-------|-------|---------------|
| Accent color | `#5670B9` | `BMColor.Calendar.dayOfWeekHeader` |
| Background (light) | `#FAFAFA` | `BMColor.modalBackground` |
| Surface (light) | `#FFFFFF` | `BMColor.cardBackground` |
| Label (light) | `#2C2C2D` | `BMColor.Calendar.blackText` |
| Muted (light) | `#626162` | `BMColor.Calendar.grayedText` |
| All Day badge fill | `rgba(142,142,147,0.5)` | `AllDayEventBannerView` — `Capsule().fill(.gray.opacity(0.5))` |
| Font family | `Apercu` → system-ui fallback | `BMFont.regular/bold/light` |
| Corner radius | `10px` / `12px` | Observed in `EventDetailView`, `BMDetailHeaderView` |

## How to Run
1. Open `specs/ASDLC-575/prototype/index.html` in Chrome, Firefox, or Safari
2. No installation, no server, no build step required
3. Renders inside an iPhone 15 Pro frame at 393 × 852 px

## Screens

| Screen ID | Name | Description |
|-----------|------|-------------|
| `screen-event-detail` | Event Detail | Displays event metadata with the time row in either All Day or timed mode |

## Navigation Flows
No push/pop navigation — single screen with an in-prototype toggle for comparison.

## Interactions Implemented
- **Mode toggle** — switches the time row between "All Day" badge (fixed behavior) and time text (reference)
- **Learn More / Register buttons** — trigger a toast notification confirming tap
- **Calendar toolbar button** — present in nav bar (tappable, visual only)

## Acceptance Criteria Coverage

| AC | Screen | Status |
|----|--------|--------|
| All Day event shows "All Day" indicator instead of a time value | `screen-event-detail` (All Day mode) | Covered |
| Indicator is capsule/pill shaped | `screen-event-detail` (All Day mode) | Covered — `.allday-badge` class applies `border-radius: 999px` |
| Timed events are unaffected | `screen-event-detail` (Timed mode) | Covered — toggle shows unmodified time display |
