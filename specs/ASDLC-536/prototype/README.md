# iOS Prototype: ASDLC-536 — All Day Event Detail Indicator

## Scope
This prototype covers **only**: the Event Detail screen (`EventDetailView`) — specifically the time row behaviour when `isAllDay` is `true`.

It does **not** prototype the Events list, calendar view, navigation drawer, or any other screen.

## Design System Source
- **Accent color**: `#5670B9` — from `BMColor.Calendar.dayOfWeekHeader` (Cal Blue) via CodeGraph
- **Background**: `#FAFAFA` light / `#414141` dark — from `BMColor.modalBackground`
- **Card surface**: `#FFFFFF` light / `#474747` dark — from `BMColor.cardBackground`
- **Primary text**: `#2C2C2D` light / `#FAFAFA` dark — from `BMColor.Calendar.blackText`
- **Secondary text**: `#626162` light / `#AAAAAA` dark — from `BMColor.Calendar.grayedText`
- **Font family**: `Apercu` — from `BMFont` (`Apercu-Regular`, `Apercu-Bold`, `Apercu-Light`)
- **Corner radius**: `12px` — from `Shadowfy` view modifier (`RoundedRectangle(cornerRadius: 12)`)
- **All Day capsule style**: from `AllDayEventBannerView` (`Capsule().fill(.gray.opacity(0.5))`)

## How to Run
1. Open `specs/ASDLC-536/prototype/index.html` in Chrome, Firefox, or Safari
2. No installation, no server, no build step required
3. Renders inside an iPhone 15 Pro frame (393 × 852 pt)

## Screens

| Screen ID            | Name             | Description                                                     |
|----------------------|------------------|-----------------------------------------------------------------|
| `screen-event-detail`| Event Detail     | Event detail page showing the time row for normal vs. all-day events |

## Navigation Flows
- Single screen — no push/pop navigation needed for this issue scope.

## Interactions Implemented

| Interaction              | Description                                                                                       |
|--------------------------|---------------------------------------------------------------------------------------------------|
| **All Day / Timed Toggle** | Blue toggle pill switches between "Timed Event" (shows `12:00 AM – 11:59 PM`) and "All Day Event" (shows the "All Day" capsule badge) |
| **Learn More button**    | Tap feedback simulating "Opening Safari…" for 1.2 s                                              |
| **Register button**      | Tap feedback simulating "Opening Registration…" for 1.2 s                                        |
| **Back chevron**         | Visual tap feedback (no-op — single screen prototype)                                            |

## Acceptance Criteria Coverage

| AC                                                                     | Screen               | Status  |
|------------------------------------------------------------------------|----------------------|---------|
| Time row shows `12:00 AM` on timed events (current state / bug demo)   | `screen-event-detail` | Covered — toggle OFF shows current buggy time text |
| Time row shows "All Day" capsule when `isAllDay == true` (fix)         | `screen-event-detail` | Covered — toggle ON shows the All Day pill badge |
| Capsule is pill/capsule shaped                                          | `screen-event-detail` | Covered — `border-radius: 999px`, matching `AllDayEventBannerView`'s `Capsule()` shape |
| Time row icon (clock) remains visible                                   | `screen-event-detail` | Covered — clock SVG stays; only the text/badge changes |

## Code Reference

The change affects `EventDetailView.swift` (`timeView` computed property, line 154–157):

```swift
// Current (buggy — always shows time even for all-day events):
@ViewBuilder
private var timeView: some View {
    if let timePart = event.dateString.components(separatedBy: " / ").last {
         EventDetailRow(systemImageName: "clock", text: timePart)
    }
}

// Expected fix — check isAllDay first:
@ViewBuilder
private var timeView: some View {
    if event.isAllDay == true {
        // Show "All Day" capsule instead of time
        EventDetailRow(systemImageName: "clock", isCapsule: true, text: "All Day")
    } else if let timePart = event.dateString.components(separatedBy: " / ").last {
        EventDetailRow(systemImageName: "clock", text: timePart)
    }
}
```

The "All Day" capsule visual style is consistent with the existing `AllDayEventBannerView` component in `berkeley-mobile/Events/AllDayEventBannerView.swift`.
