# iOS Prototype: ASDLC-517 — All Day Event Indicator

## Scope
This prototype covers ONLY: the **Event Detail Page** with an All Day capsule/pill badge
in the time row — replacing the misleading "12:00 AM" shown for all-day events.

## Design System Source
- Accent color: `#7F99F5` (from `BMColor` → `StudyPact.enabledButton` via CodeGraph)
- Calendar blue: `#6B81C9` (from `BMColor.Calendar.dayOfWeekHeader` displayP3 → sRGB)
- Background: `#FAFAFA` light / `#414141` dark (`BMColor.modalBackground`)
- Card surface: `#FFFFFF` light / `#484747` dark (`BMColor.cardBackground`)
- Primary text: `#2C2C2D` / `#FAFAFA` (`BMColor.Calendar.blackText`)
- Font family: `Apercu` with `-apple-system` fallback (from `BMFont` → `Apercu-Regular/Bold`)
- Corner radius: `12px` card (`BMDetailHeaderView.clipShape`), `10px` images
- All Day capsule: `rgba(120,120,128,0.5)` height `30px` (from `AllDayEventBannerView`)

## How to Run
1. Open `specs/ASDLC-517/prototype/index.html` in Chrome, Firefox, or Safari
2. No installation, no server, no build step required
3. Renders inside an iPhone 15 Pro frame (393×852)

## Screens
| Screen ID            | Name         | Description                                           |
|----------------------|--------------|-------------------------------------------------------|
| screen-event-detail  | Event Detail | Detail view for an all-day event with correct badge   |

## Navigation Flows
- No push/pop — single screen prototype

## Interactions Implemented
- **After Fix toggle** — shows the "All Day" capsule badge in the time row (expected behavior)
- **Before / Bug toggle** — shows "12:00 AM" in the time row (current broken behavior)
- **Learn More / Register buttons** — trigger toast feedback
- **Dark mode** — via `@media (prefers-color-scheme: dark)` using codebase-extracted dark tokens

## Acceptance Criteria Coverage
| AC                                             | Screen              | Status  |
|------------------------------------------------|---------------------|---------|
| Time row shows "All Day" for all-day events    | screen-event-detail | Covered |
| "All Day" displayed as a capsule/pill label    | screen-event-detail | Covered |
| Time row no longer shows "12:00 AM"            | screen-event-detail | Covered |

## Key Implementation Detail
In `EventDetailView.swift`, the `timeView` computed property in `BMDetailHeaderView` currently
reads from `event.dateString` unconditionally. The fix should check `event.isAllDay` and, when
true, render an `AllDayEventBannerView`-style capsule (matching the existing `AllDayEventBannerView`
pattern: `Capsule().fill(.gray.opacity(0.5)).frame(height: 30)`) instead of `EventDetailRow`.
