# iOS Prototype: ASDLC-520 — Events: All Day Indicator on Event Detail Page

## Scope

This prototype covers **only** the screens explicitly required by the issue:

| Screen | Description |
|--------|-------------|
| Events List | Contextual entry point; shows events with All Day badges in rows |
| Event Detail | The Event Detail page with the time row fix — "All Day" capsule replaces "12:00 AM" |

The before/after toggle outside the iPhone frame demonstrates the bug vs. the expected fix in the same screen.

## Design System Source (extracted via CodeGraph)

| Token | Value | Source |
|-------|-------|--------|
| Accent | `#779AFC` | `BMColor.ActionButton.background` (rgb 119,154,252) |
| Background (light) | `#FAFAFA` | `BMColor.modalBackground` light |
| Background (dark) | `#414141` | `BMColor.modalBackground` dark |
| Surface (light) | `#FFFFFF` | `BMColor.cardBackground` light |
| Surface (dark) | `#484747` | `BMColor.cardBackground` dark |
| Primary text (light) | `#2C2C2D` | `BMColor.Calendar.blackText` light |
| Primary text (dark) | `#FAFAFA` | `BMColor.Calendar.blackText` dark |
| Muted text (light) | `#626162` | `BMColor.Calendar.grayedText` light |
| Muted text (dark) | `#AAAAAA` | `BMColor.Calendar.grayedText` dark |
| Selected/today | `#FB9B8E` | `BMColor.selectedButtonBackground` |
| Calendar header | `#5670B9` | `BMColor.Calendar.dayOfWeekHeader` |
| Card radius | `10–12px` | `RoundedRectangle(cornerRadius: 10/12)` in `EventDetailView` |
| Font family | Apercu → system-ui | `BMFont.regular/bold/light` in `Fonts.swift` |

## How to Run

1. Open `specs/ASDLC-520/prototype/index.html` in Chrome, Firefox, or Safari
2. No installation, no terminal, no server required
3. Renders inside an iPhone 15 Pro frame (393 × 852)

## Navigation Flows

- Events List → tap any event row → `pushScreen('screen-event-detail')` → Event Detail slides in
- Event Detail → tap "‹ Events" back button → `popScreen()` → returns to list

## Interactions Implemented

- Push/pop navigation between Events List and Event Detail
- "Expected (Fix)" / "Current (Bug)" toggle outside the frame changes the time-row content:
  - **Expected**: `<span class="allday-capsule">All Day</span>` — gray capsule/pill (matches `AllDayEventBannerView` styling)
  - **Current (Bug)**: plain text `12:00 AM`
- All Day badge (`allday-badge-small`) shown in event list rows for all-day events
- All Day banner (`allday-banner`) shown at the top of the events list (matching `AllDayEventBannerView`)
- Calendar add toolbar button (visual only)

## Acceptance Criteria Coverage

| AC | Screen | Status |
|----|--------|--------|
| All-day events must NOT show a time value (e.g. 12:00 AM) in the time row | screen-event-detail | Covered — time text hidden when `isAllDay` |
| Time row must display an "All Day" capsule/pill-shaped label instead | screen-event-detail | Covered — `.allday-capsule` element shown |
| Current (buggy) behavior demonstrable for comparison | screen-event-detail | Covered via "Current (Bug)" toggle |

## Implementation Notes for Engineers

The fix in Swift targets `BMDetailHeaderView.timeView` in `EventDetailView.swift`.

**Current `timeView`** (always shows time text):
```swift
@ViewBuilder
private var timeView: some View {
    if let timePart = event.dateString.components(separatedBy: " / ").last {
        EventDetailRow(systemImageName: "clock", text: timePart)
    }
}
```

**Fixed `timeView`** (shows capsule when all-day):
```swift
@ViewBuilder
private var timeView: some View {
    HStack {
        Image(systemName: "clock")
            .font(.system(size: 16))
        if event.isAllDay == true {
            Capsule()
                .fill(.gray.opacity(0.22))
                .frame(height: 22)
                .overlay(
                    Text("All Day")
                        .font(Font(BMFont.bold(12)))
                        .foregroundStyle(.primary)
                        .padding(.horizontal, 8)
                )
                .fixedSize()
        } else if let timePart = event.dateString.components(separatedBy: " / ").last {
            Text(timePart)
                .font(Font(BMFont.regular(12)))
        }
    }
}
```

The `isAllDay` field already exists on `BMEventCalendarEntry` (set from `BerkeleyEvent.isAllDay` in `EventsDataService.fetchEventsGroupedByDate()`), so no data-model changes are needed.
