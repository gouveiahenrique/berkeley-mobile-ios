# iOS Prototype: ASDLC-532 — Event Detail All Day Indicator

## Scope
This prototype covers **only** the screen and interaction described in the issue:
- **Event Detail Page** — `screen-event-detail` — one screen with two demo states

## Design System Source
Tokens extracted from the codebase via CodeGraph:

| Token | Value | Source |
|-------|-------|--------|
| Accent color | `#779AFC` | `BMColor.ActionButton.background` (Colors+ActionButton.swift) |
| Background | `#FAFAFA` | `BMColor.modalBackground` light (Colors.swift) |
| Surface/Card | `#FFFFFF` | `BMColor.cardBackground` light (Colors.swift) |
| Primary text | `#2C2C2D` | `BMColor.Calendar.blackText` light (Colors+Calendar.swift) |
| Secondary text | `#626162` | `BMColor.Calendar.grayedText` light (Colors+Calendar.swift) |
| Salmon accent | `#FB9B8E` | `BMColor.selectedButtonBackground` (Colors.swift) |
| Font family | `Apercu` | `BMFont` (Assets/Fonts.swift) |
| Card radius | `12px` | `RoundedRectangle(cornerRadius: 12)` (EventDetailView.swift) |
| Image radius | `10px` | `RoundedRectangle(cornerRadius: 10)` (BMDetailHeaderView) |

## How to Run
1. Open `specs/ASDLC-532/prototype/index.html` in Chrome, Firefox, or Safari
2. No installation, no server, no build step required
3. Renders inside an iPhone 15 Pro frame (393×852)

## Screens

| Screen ID | Name | Description |
|-----------|------|-------------|
| `screen-event-detail` | Event Detail | Event detail page showing date, time row, location, description, and action buttons |

## Demo Controls
Use the **Event Type** toggle above the phone frame to switch between:

| Mode | Time Row Content | Description |
|------|-----------------|-------------|
| **Regular Event** | `10:00 AM - 3:00 PM` | Current (pre-fix) behavior — shows time string |
| **All Day Event** | `All Day` capsule badge | Expected (post-fix) behavior — shows pill label |

## Navigation Flows
- **Event Type toggle** → switches time row content between time text and "All Day" badge
- **Calendar icon** (nav bar top-right) → toast: "Added to Calendar"
- **Learn More** / **Register** → toast: "[Button] tapped"

## Interactions Implemented
- Toggle between regular and all-day event states
- "All Day" capsule badge in time row (replaces time text)
- Tab bar tap feedback (active state switch)
- Navigation bar calendar action (toast)
- Action button taps (toast)

## Acceptance Criteria Coverage

| AC | Screen | Implementation |
|----|--------|----------------|
| All Day event shows "All Day" indicator instead of "12:00 AM" in the time row | `screen-event-detail` → All Day mode | Capsule badge replaces time text when mode = allday |
| Indicator is capsule/pill-shaped | Same | `.allday-badge` uses `border-radius: 50px` + inline-flex |
| Regular events still show time correctly | `screen-event-detail` → Regular mode | `#time-text` shown, badge hidden |

## Key Code Reference
The fix corresponds to `EventDetailView.swift:154-158`:
```swift
@ViewBuilder
private var timeView: some View {
    if let timePart = event.dateString.components(separatedBy: " / ").last {
        // When timePart == "All Day", render capsule badge instead of EventDetailRow text
        EventDetailRow(systemImageName: "clock", text: timePart)
    }
}
```
The `dateString` property in `BMCalendarEvent.swift:52-55` already produces "All Day" for events where `startDate` is midnight and `end` is 11:59:59 PM. The UI layer just needs to detect this and swap the text label for the capsule badge.
