# iOS Prototype: ASDLC-515 — All Day Event Indicator

## Scope
This prototype covers **only** the Event Detail Page's time row fix:
- When `event.isAllDay == true`, the time row displays an **"All Day" capsule/badge** instead of the incorrect "12:00 AM" text.

The change is inside `BMDetailHeaderView.timeView` in `berkeley-mobile/Events/EventDetailView.swift`.

## Design System Source
| Token | Value | Source (CodeGraph) |
|---|---|---|
| Accent color | `#7297E6` | `BMColor.eventAcademic` = `rgb(114,151,230)` |
| Calendar blue | `#5670B9` | `BMColor.Calendar.dayOfWeekHeader` = `rgb(86,112,185)` |
| Background (light) | `#FAFAFA` | `BMColor.modalBackground` light |
| Background (dark) | `#414141` | `BMColor.modalBackground` dark |
| Surface (light) | `#FFFFFF` | `BMColor.cardBackground` light |
| Surface (dark) | `#484747` | `BMColor.cardBackground` dark |
| Primary text (light) | `#2C2C2D` | `BMColor.Calendar.blackText` light |
| Secondary text (light) | `#626162` | `BMColor.Calendar.grayedText` light |
| Font family | Apercu | `BMFont.regular`/`bold`/`light` in `berkeley-mobile/Assets/Fonts.swift` |
| Corner radius | 10–12px | `RoundedRectangle(cornerRadius: 10/12)` in `EventDetailView` |

## How to Run
1. Open `specs/ASDLC-515/prototype/index.html` in Chrome, Firefox, or Safari
2. No installation, no server, no build step required
3. Renders inside an iPhone 15 Pro frame (393×852, Dynamic Island)

## Screens
| Screen ID | Name | Description |
|---|---|---|
| `screen-event-detail` | Event Detail | Full detail page for an all-day campus event, showing the All Day capsule in the time row |

## Navigation Flows
Single-screen prototype — no push/pop navigation required.

## Interactions Implemented
| Interaction | Description |
|---|---|
| **Fixed state (default)** | Time row shows "All Day" capsule (the fix) |
| **Bug state** | Tap "Bug — 12:00 AM" toggle to reveal the current broken behavior |
| **Comparison toggle** | Segmented control at the bottom switches between Fixed and Bug states |

## Acceptance Criteria Coverage
| Acceptance Criterion | Screen | Status |
|---|---|---|
| All-day events show "All Day" indicator instead of time value | `screen-event-detail` | ✅ Covered |
| The "All Day" indicator is a capsule/pill-shaped label | `screen-event-detail` | ✅ Covered |
| The time row no longer displays "12:00 AM" for all-day events | `screen-event-detail` | ✅ Covered (toggle shows before/after) |

## Implementation Note
The fix in the real codebase is in `BMDetailHeaderView.timeView` (`EventDetailView.swift:154–158`):

```swift
// Current (bug):
if let timePart = event.dateString.components(separatedBy: " / ").last {
    EventDetailRow(systemImageName: "clock", text: timePart)
}

// Fixed:
if event.isAllDay == true {
    // Show All Day capsule
} else if let timePart = event.dateString.components(separatedBy: " / ").last {
    EventDetailRow(systemImageName: "clock", text: timePart)
}
```

The `AllDayEventBannerView` (`berkeley-mobile/Events/AllDayEventBannerView.swift`) provides a reference for the capsule pattern already in the codebase.
