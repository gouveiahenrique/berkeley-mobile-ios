# iOS Prototype: ASDLC-567 — All Day Event Detail Indicator

## Scope
This prototype covers **only**:
- `screen-event-detail` — the Event Detail Page (`EventDetailView` → `BMDetailHeaderView`) for an All Day event, showing the time row behaviour change

No other screens are included (events list, calendar view, etc.).

## Design System Source
Tokens extracted from the codebase via CodeGraph:

| Token | Value | Source |
|---|---|---|
| Accent color | `#7B9AFC` | `BMColor.ActionButton.background` (119/154/252) |
| Background | `#FAFAFA` / `#414141` dark | `BMColor.modalBackground` |
| Card surface | `#FFFFFF` / `#484747` dark | `BMColor.cardBackground` |
| Primary text | `#2C2C2D` / `#FAFAFA` dark | `BMColor.Calendar.blackText` |
| Secondary text | `#626162` / `#AAAAAA` dark | `BMColor.Calendar.grayedText` |
| Font family | `Apercu` → `system-ui` fallback | `BMFont` (`Apercu-Regular/Bold/Medium/Light`) |
| Corner radius | `10px` / `12px` cards | `RoundedRectangle(cornerRadius:)` usages |
| All Day capsule fill | `rgba(120,120,128,0.5)` | `AllDayEventBannerView` → `Capsule().fill(.gray.opacity(0.5))` |

## How to Run
1. Open `specs/ASDLC-567/prototype/index.html` in Chrome, Firefox, or Safari
2. No installation, no server, no build step required
3. Renders inside an iPhone 15 Pro frame (393×852 px)

## Screens

| Screen ID | Name | Description |
|---|---|---|
| `screen-event-detail` | Event Detail | `BMDetailHeaderView` showing an All Day event; time row toggles between current bug and expected fix |

## Prototype Controls
A toggle above the iPhone frame switches between two states:

| State | Label | Time row shows |
|---|---|---|
| **Current (Bug)** | `12:00 AM shown — bug state` | Plain text `12:00 AM` — misleading for an all-day event |
| **Expected (Fix)** | `All Day capsule shown` | `All Day` capsule/pill badge (grey, `border-radius: 30px`) |

## Navigation Flows
- Toggle **"Current (Bug)"** → time row displays `12:00 AM`  
- Toggle **"Expected (Fix)"** → time row displays the `All Day` capsule/badge

Interactive elements:
- **Learn More** / **Register** buttons → toast "Opening … in Safari…"
- **Back** chevron → toast "Back to Events list"
- **Calendar+ icon** → toast "Add to Calendar?"

## Acceptance Criteria Coverage

| AC | Screen | Status |
|---|---|---|
| Time row shows `12:00 AM` for All Day events (current bug) | `screen-event-detail` (bug state) | Demonstrated |
| Time row shows `All Day` capsule/badge for All Day events | `screen-event-detail` (fix state) | Covered |
| Badge is capsule/pill shaped | `screen-event-detail` (fix state) | Covered — `border-radius: 30px`, matches `AllDayEventBannerView` Capsule style |

## Implementation Notes
The fix maps to `BMDetailHeaderView.timeView` in `EventDetailView.swift` (line 153–158).
When `event.isAllDay == true`, the `EventDetailRow` should render an `AllDay` badge/capsule instead of the time string extracted from `event.dateString`.
The capsule visual is consistent with the existing `AllDayEventBannerView` pattern (`Capsule().fill(.gray.opacity(0.5))`).
