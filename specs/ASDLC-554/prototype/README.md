# iOS Prototype: ASDLC-554 — All Day Event Detail Indicator

## Scope
This prototype covers ONLY:
- **Event Detail Page** — a single screen shown in two states:
  1. **Before (Bug):** All Day event incorrectly shows "12:00 AM" in the time row
  2. **After (Fix):** All Day event correctly shows an "All Day" capsule/pill label in the time row

## Design System Source
All tokens were extracted from the codebase via CodeGraph.

| Token | Value | Source |
|-------|-------|--------|
| Accent color | `#779AFC` | `BMColor.ActionButton.background` → `Colors+ActionButton.swift` |
| Background (light) | `#FAFAFA` | `BMColor.modalBackground` light → `Colors.swift` |
| Background (dark) | `#414141` | `BMColor.modalBackground` dark → `Colors.swift` |
| Card surface (light) | `#FFFFFF` | `BMColor.cardBackground` light → `Colors.swift` |
| Card surface (dark) | `#484747` | `BMColor.cardBackground` dark → `Colors.swift` |
| Primary text (light) | `#2C2C2D` | `BMColor.Calendar.blackText` light → `Colors+Calendar.swift` |
| Primary text (dark) | `#FAFAFA` | `BMColor.Calendar.blackText` dark → `Colors+Calendar.swift` |
| Secondary text (light) | `#626162` | `BMColor.Calendar.grayedText` light → `Colors+Calendar.swift` |
| Secondary text (dark) | `#AAAAAA` | `BMColor.Calendar.grayedText` dark → `Colors+Calendar.swift` |
| Font family | Apercu (regular/bold/light/medium) | `BMFont` → `Assets/Fonts.swift` |
| Corner radius | 10–12px | `RoundedRectangle(cornerRadius: 10/12)` → `EventDetailView.swift` |

## How to Run
1. Open `specs/ASDLC-554/prototype/index.html` in Chrome, Firefox, or Safari
2. No installation, no server, no build step required
3. Renders inside an iPhone 15 Pro frame (393×852)
4. Use the **Before (Bug) / After (Fix)** toggle above the phone to switch states

## Screens

| Screen ID | Name | Description |
|-----------|------|-------------|
| `screen-before` | Event Detail — Before | All Day event shows "12:00 AM" (current bug) |
| `screen-after` | Event Detail — After | All Day event shows "All Day" capsule (expected fix) |

## Navigation Flows
- Toggle **"Before (Bug)"** → shows `screen-before` (bug state)
- Toggle **"After (Fix)"** → shows `screen-after` (fix state)

## Interactions Implemented
- Before/After state toggle with smooth opacity transition
- Both screens are fully static (no interaction required — detail view)

## Acceptance Criteria Coverage

| AC | Screen | Status |
|----|--------|--------|
| When `isAllDay == true`, the time row must NOT show "12:00 AM" | `screen-before` | Demonstrates current broken behavior |
| When `isAllDay == true`, the time row must show an "All Day" capsule/pill | `screen-after` | Demonstrates expected fixed behavior |

## Key Implementation Notes (for dev reference)

The bug originates in `EventDetailView.swift` (`BMDetailHeaderView.timeView`):

```swift
// Current code — always displays the time string, even for all-day events
private var timeView: some View {
    if let timePart = event.dateString.components(separatedBy: " / ").last {
        EventDetailRow(systemImageName: "clock", text: timePart)
    }
}
```

The `dateString` in `BMCalendarEvent` (`BMCalendarEvent.swift:52`) only returns "All Day" when
`startDate` is midnight AND `end` is 11:59:59. But events with `isAllDay == true` from Firebase may
have different end times, so the "All Day" path is never reached and "12:00 AM" is shown instead.

**Suggested fix:** Check `event.isAllDay == true` directly in `timeView` and show the capsule badge:

```swift
private var timeView: some View {
    if event.isAllDay == true {
        // Show capsule instead of time text
        EventDetailRow(systemImageName: "clock", badge: "All Day")
    } else if let timePart = event.dateString.components(separatedBy: " / ").last {
        EventDetailRow(systemImageName: "clock", text: timePart)
    }
}
```
