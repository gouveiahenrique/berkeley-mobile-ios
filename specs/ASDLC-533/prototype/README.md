# iOS Prototype: ASDLC-533 — All Day Event Indicator

## Scope
This prototype covers ONLY: the Event Detail Page (`EventDetailView` / `BMDetailHeaderView`) time-row fix described in the issue — replacing the misleading time value with an "All Day" capsule badge when `isAllDay == true`.

## Design System Source
| Token | Value | Source (via CodeGraph) |
|---|---|---|
| Accent color | `#FB9B8E` | `BMColor.selectedButtonBackground` |
| Background (light) | `#FAFAFA` | `BMColor.modalBackground` |
| Background (dark) | `#414141` | `BMColor.modalBackground` dark variant |
| Surface (light) | `#FFFFFF` | `BMColor.cardBackground` |
| Surface (dark) | `#484747` | `BMColor.cardBackground` dark variant |
| Primary text (light) | `#2C2C2D` | `BMColor.Calendar.blackText` |
| Secondary text | `#626262` | `BMColor.Calendar.grayedText` |
| Cal blue / action | `#5670B9` | `BMColor.Calendar.dayOfWeekHeader` |
| Font family | `Apercu` | `BMFont` struct in `Assets/Fonts.swift` |
| Corner radius | `12px` | `RoundedRectangle(cornerRadius: 12)` in `EventDetailView.swift:133` |

## How to Run
1. Open `specs/ASDLC-533/prototype/index.html` in Chrome, Firefox, or Safari
2. No installation, no server, no build step required
3. Renders inside an iPhone 15 Pro frame (393×852, Dynamic Island)

## Screens
| Screen ID | Name | Description |
|---|---|---|
| `screen-event-detail` | Event Detail (single screen) | `BMDetailHeaderView` with togglable time row |

## Navigation Flows
No push/pop navigation — single-screen prototype. The nav bar back button (`< Events`) shows the navigation context but does not navigate.

## Interactions Implemented
| Interaction | Element | Effect |
|---|---|---|
| Toggle "All Day Event" | Segmented control | Time row shows "All Day" capsule badge; badge animates in with a spring pop |
| Toggle "Timed Event" | Segmented control | Time row shows "10:00 AM – 4:00 PM" text string |
| Tap "Learn More" | Action button | Visual press feedback (opacity) |

## Key UI Element: All Day Badge
The "All Day" indicator is rendered as a **capsule pill badge**, matching the `AllDayEventBannerView` style already in the codebase (`berkeley-mobile/Events/AllDayEventBannerView.swift`):
- Shape: `Capsule()` — full pill, `border-radius: 100px`
- Fill: `gray.opacity(0.35)` — `rgba(128, 128, 128, 0.35)`
- Label: "All Day" in `BMFont.bold(13)` — 13px, weight 700
- Height: ~26px

This replaces the `EventDetailRow(systemImageName: "clock", text: timePart)` in `BMDetailHeaderView.timeView` when `event.isAllDay == true`.

## Acceptance Criteria Coverage
| Acceptance Criterion | Screen | Status |
|---|---|---|
| Time row shows "12:00 AM" for all-day events (BUG) | — | Demonstrated via "Timed Event" toggle (contrast only) |
| Time row shows "All Day" capsule/pill badge for all-day events (FIX) | `screen-event-detail` (All Day mode) | ✅ Covered |
| No specific start/end time displayed for all-day events | `screen-event-detail` (All Day mode) | ✅ Covered — only badge shown, no time string |

## Implementation Note
In the Swift codebase, the fix corresponds to updating `BMDetailHeaderView.timeView` in `berkeley-mobile/Events/EventDetailView.swift` (around line 153–158):

```swift
// Before (bug):
@ViewBuilder
private var timeView: some View {
    if let timePart = event.dateString.components(separatedBy: " / ").last {
        EventDetailRow(systemImageName: "clock", text: timePart)
    }
}

// After (fix):
@ViewBuilder
private var timeView: some View {
    if event.isAllDay == true {
        // Show AllDay capsule badge instead of time
        HStack {
            Image(systemName: "clock").font(.system(size: 16))
            Capsule()
                .fill(.gray.opacity(0.5))
                .frame(height: 26)
                .overlay(
                    Text("All Day")
                        .font(Font(BMFont.bold(13)))
                        .padding(.horizontal, 10)
                )
                .fixedSize()
        }
    } else if let timePart = event.dateString.components(separatedBy: " / ").last {
        EventDetailRow(systemImageName: "clock", text: timePart)
    }
}
```
