# iOS Prototype: ASDLC-514 — All Day Indicator on Event Detail Page

## Scope
This prototype covers **only** the screens and interactions described in ASDLC-514:

| # | Screen | Description |
|---|--------|-------------|
| 1 | Events List | Entry point; two real events — one All Day, one timed |
| 2 | Event Detail — All Day | **THE FIX**: time row shows "All Day" capsule instead of "12:00 AM" |
| 3 | Event Detail — Timed | Baseline / unchanged behavior; shows "2:00 PM – 5:00 PM" |

## Design System Source (extracted via CodeGraph)

| Token | Value | Source |
|-------|-------|--------|
| Accent color | `#FB9B8E` | `BMColor.selectedButtonBackground` (Colors.swift) |
| Calendar blue | `#5670B9` | `BMColor.Calendar.dayOfWeekHeader` (Colors+Calendar.swift) |
| Background (light) | `#FAFAFA` | `BMColor.modalBackground` light (Colors.swift) |
| Background (dark)  | `#414141` | `BMColor.modalBackground` dark (Colors.swift) |
| Surface (light) | `#FFFFFF` | `BMColor.cardBackground` light (Colors.swift) |
| Surface (dark) | `#484747` | `BMColor.cardBackground` dark (Colors.swift) |
| Primary text (light) | `#2C2C2D` | `BMColor.Calendar.blackText` light |
| Secondary text (light) | `#626162` | `BMColor.Calendar.grayedText` light |
| All Day fill | `rgba(120,120,128,0.5)` | `AllDayEventBannerView` — `.fill(.gray.opacity(0.5))` |
| Font family | Apercu | `BMFont` (Assets/Fonts.swift) — `Apercu-Regular/Bold/Light/Medium` |
| Card radius | `12px` | `RoundedRectangle(cornerRadius: 12)` in EventDetailView |
| Thumbnail radius | `10px` | `RoundedRectangle(cornerRadius: 10)` in BMDetailHeaderView |

## How to Run
1. Open `specs/ASDLC-514/prototype/index.html` in Chrome, Firefox, or Safari
2. No installation, no server, no build step required
3. Renders inside an iPhone 15 Pro frame (393 × 852 px)

## Navigation Flows

```
Events List
  ├── tap "Memorial Day" → Event Detail (All Day)   [screen-detail-allday]
  │       back button / swipe right → Events List
  └── tap "Berkeley Graduate Forum" → Event Detail (Timed)  [screen-detail-timed]
          back button / swipe right → Events List
```

## Interactions Implemented
- Push navigation (slide right-to-left, 300ms cubic-bezier)
- Pop navigation via back button and left-edge swipe gesture
- Active press states on event cards and buttons

## Key Implementation: The All Day Fix

In `EventDetailView.swift`, the `timeView` computed property:

```swift
// BEFORE (bug): always shows timePart, which is "12:00 AM" for all-day events
@ViewBuilder
private var timeView: some View {
    if let timePart = event.dateString.components(separatedBy: " / ").last {
        EventDetailRow(systemImageName: "clock", text: timePart)
    }
}

// AFTER (fix): checks isAllDay flag and shows capsule badge instead
@ViewBuilder
private var timeView: some View {
    if event.isAllDay == true {
        HStack(spacing: 6) {
            Image(systemName: "clock").font(.system(size: 16))
            AllDayTimeBadge()   // new: capsule with "All Day" label
        }
    } else if let timePart = event.dateString.components(separatedBy: " / ").last {
        EventDetailRow(systemImageName: "clock", text: timePart)
    }
}
```

The prototype's `.allday-time-badge` CSS class mirrors the `AllDayEventBannerView` capsule
style (`Capsule().fill(.gray.opacity(0.5))`), scaled down appropriately for the inline row context.

## Acceptance Criteria Coverage

| AC | Screen | Status |
|----|--------|--------|
| AC1: All Day event shows "All Day" capsule in time row | screen-detail-allday | Covered |
| AC2: Time row does NOT show "12:00 AM" for All Day events | screen-detail-allday | Covered |
| AC3: Clock icon still visible alongside capsule (BR-006) | screen-detail-allday | Covered |
| AC4: Timed event continues to show start–end time | screen-detail-timed | Covered |
| AC5: Capsule style visually consistent with list view AllDayEventBannerView | both detail screens | Covered |
| AC6: isAllDay flag is authoritative (not midnight heuristic) | implemented in JS/logic | Covered |

## Business Rules Coverage

| Rule | Coverage |
|------|----------|
| BR-001: No clock time shown for All Day events | screen-detail-allday has no time text |
| BR-002: "All Day" capsule shown when isAllDay == true | .allday-time-badge on screen-detail-allday |
| BR-003: Capsule style matches list view | same gray opacity fill, same border-radius |
| BR-004: Timed events unchanged | screen-detail-timed shows "2:00 PM – 5:00 PM" |
| BR-005: Based on isAllDay flag, not time heuristic | prototype models flag-based conditional |
| BR-006: Clock icon visible alongside "All Day" badge | clock SVG + badge in same detail-row |
