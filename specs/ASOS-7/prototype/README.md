# iOS Prototype: ASOS-7 — Event Detail All Day Indicator

## Scope
This prototype covers ONLY the **Event Detail Page** (`EventDetailView`) as described in ASOS-7:
- The time row in `BMDetailHeaderView` showing an "All Day" capsule/badge instead of a time value when the event is an all-day event.

## Design System Source
Tokens extracted from the Berkeley Mobile codebase via CodeGraph:

| Token | Value | Source |
|---|---|---|
| Accent color | `#7799FC` | `BMColor.ActionButton.background` (Colors+ActionButton.swift) |
| Modal background (light) | `#FAFAFA` | `BMColor.modalBackground` (Colors.swift) |
| Modal background (dark) | `#414141` | `BMColor.modalBackground` dark variant |
| Card background (light) | `#FFFFFF` | `BMColor.cardBackground` (Colors.swift) |
| Card background (dark) | `#484747` | `BMColor.cardBackground` dark variant |
| Primary text (light) | `#2C2C2D` | `BMColor.Calendar.blackText` (Colors+Calendar.swift) |
| Primary text (dark) | `#FAFAFA` | `BMColor.Calendar.blackText` dark variant |
| Secondary text (light) | `#626162` | `BMColor.Calendar.grayedText` (Colors+Calendar.swift) |
| Calendar blue | `#566FB9` | `BMColor.Calendar.dayOfWeekHeader` |
| All Day bg | `rgba(120,120,128,0.2)` | `AllDayEventBannerView` `.gray.opacity(0.5)` |
| Corner radius | `12px` | `CardView.layer.cornerRadius = 12` (CardView.swift) |
| Font family | `Apercu` | `BMFont.regular/bold` (Fonts.swift) |

## How to Run
1. Open `specs/ASOS-7/prototype/index.html` in Chrome, Firefox, or Safari
2. No installation, no server, no build step required
3. Renders inside an iPhone 15 Pro frame (393×852)

## Screens

| Screen ID | Name | Description |
|---|---|---|
| `screen-event-detail` | Event Detail Page | Shows the event header card with date, time/all-day, and location rows, plus description and action buttons |

## Interactions Implemented

- **All Day toggle** — An iOS-style switch at the top of the screen lets you toggle between the two states:
  - **Toggle ON (All Day):** The time row displays the `All Day` capsule/pill badge (matching `AllDayEventBannerView` pattern)
  - **Toggle OFF (Timed):** The time row displays a real time range string (e.g. "9:00 AM – 5:00 PM"), replicating the _current_ (broken) behavior for comparison

## Acceptance Criteria Coverage

| AC | Screen | Status |
|---|---|---|
| When `isAllDay = true`, time row shows "All Day" capsule instead of a time value | `screen-event-detail` (toggle ON) | ✅ Covered |
| Capsule/pill shape for the "All Day" indicator | `screen-event-detail` | ✅ Covered — uses `border-radius: 999px` matching `Capsule()` in SwiftUI |
| Time value shown when event is NOT all-day | `screen-event-detail` (toggle OFF) | ✅ Covered — toggle demonstrates before/after |

## Key Implementation Notes

The fix maps to `EventDetailView.swift:154-157` — the `timeView` computed property inside `BMDetailHeaderView`:

**Current (broken):**
```swift
private var timeView: some View {
    if let timePart = event.dateString.components(separatedBy: " / ").last {
         EventDetailRow(systemImageName: "clock", text: timePart)
    }
}
```

**Fix (expected):**
```swift
private var timeView: some View {
    if event.isAllDay == true {
        EventDetailRow(systemImageName: "clock") {
            // All Day capsule — matches AllDayEventBannerView pattern
        }
    } else if let timePart = event.dateString.components(separatedBy: " / ").last {
        EventDetailRow(systemImageName: "clock", text: timePart)
    }
}
```
The capsule styling mirrors `AllDayEventBannerView` (AllDayEventBannerView.swift:18-19): `Capsule().fill(.gray.opacity(0.5))`.
