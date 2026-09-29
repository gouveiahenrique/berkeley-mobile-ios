# iOS Prototype: ASDLC-553 — All Day Event Indicator on Event Detail Page

## Scope
This prototype covers **only** the screen described in the issue:
- **Event Detail View** — showing the time row for an all-day event

## Design System Source (via CodeGraph)
| Token | Value | Source |
|---|---|---|
| Accent color | `#779AFC` | `BMColor.ActionButton.background` |
| Page background (light) | `#FAFAFA` | `BMColor.modalBackground` |
| Card background (light) | `#FFFFFF` | `BMColor.cardBackground` |
| Card background (dark) | `#484747` | `BMColor.cardBackground` |
| Event academic color | `#7297E6` | `BMColor.eventAcademic` |
| Font family | Apercu → system-ui | `berkeley-mobile/Assets/Fonts.swift` |
| Corner radius | 12px | `CardView.layoutSubviews` |
| All-day capsule fill | gray.opacity(0.5) | `AllDayEventBannerView` |

## How to Run
1. Open `specs/ASDLC-553/prototype/index.html` in Chrome, Firefox, or Safari
2. **No installation, no server, no build step required**
3. The prototype renders inside an iPhone 15 Pro frame (393×852px)

## Screens
| Screen ID | Name | Description |
|---|---|---|
| `screen-event-detail` | Event Detail | Shows an all-day event with the "All Day" capsule in the time row |

## Interactions Implemented
- **Toggle bar** — switch between the Fixed view ("All Day" capsule) and the Bug view ("12:00 AM" text) to compare before/after behavior
- **"Learn More" / "Register" buttons** — tap shows a toast confirming the Safari redirect intent
- **Calendar button** (top-right nav) — tap shows a toast confirming "Add to Calendar" intent
- **Back button** — tap shows a toast indicating navigation back to the Events list

## Acceptance Criteria Coverage
| Acceptance Criterion | Screen | Status |
|---|---|---|
| Time row shows "All Day" indicator when `isAllDay` is true | `screen-event-detail` | Covered |
| "All Day" indicator is a capsule/pill-shaped label | `screen-event-detail` | Covered |
| Time value (e.g., 12:00 AM) is NOT shown for all-day events | Toggle → Bug state shows the current broken behavior for comparison | Covered |

## Key Design Decisions
- The "All Day" capsule uses `--app-accent` (`#779AFC`) background with white text — more prominent than the gray fill in `AllDayEventBannerView`, appropriate as an inline badge within the `EventDetailRow`
- The toggle bar lets reviewers compare the fixed state vs. the current bug to validate the acceptance criteria in one view
- All icons are inline SVG in iOS outlined style — no external dependencies
