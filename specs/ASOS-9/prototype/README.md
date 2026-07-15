# iOS Prototype: ASOS-9 — Event Detail All-Day Indicator

## Scope
This prototype covers **only** the Event Detail page and the specific change to the time row
when an event has `isAllDay = true`.

Screens built:
1. **Buggy state** — time row shows `12:00 AM` (current incorrect behaviour)
2. **Fixed state** — time row shows an `All Day` capsule/pill (expected behaviour)
3. **Interactive phone** — toggle between the two states to see the change in context

## Design System Source
Tokens extracted from the codebase via CodeGraph:

| Token           | Value       | Source symbol                                |
|----------------|-------------|----------------------------------------------|
| Accent color    | `#779AFC`   | `BMColor.ActionButton.background`            |
| Calendar accent | `#5670B9`   | `BMColor.Calendar.dayOfWeekHeader`           |
| Background      | `#FAFAFA`   | `BMColor.modalBackground` (light)            |
| Surface         | `#FFFFFF`   | `BMColor.cardBackground` (light)             |
| Label           | `#2C2C2D`   | `BMColor.Calendar.blackText` (light)         |
| Muted           | `#626162`   | `BMColor.Calendar.grayedText` (light)        |
| Corner radius   | `12px`      | `CardView.layoutSubviews` (`layer.cornerRadius = 12`) |
| Font family     | Apercu → system-ui | `BMFont` (`Apercu-Regular`, `Apercu-Bold`)  |
| Capsule pattern | `Capsule().fill(.gray.opacity(0.5))` | `AllDayEventBannerView` (existing component) |

## How to Run
1. Open `specs/ASOS-9/prototype/index.html` in Chrome, Firefox, or Safari
2. No installation, no server, no build step required
3. Three iPhone 15 Pro frames are shown side-by-side

## Screens

| Screen ID               | Name              | Description                                              |
|------------------------|-------------------|----------------------------------------------------------|
| `screen-buggy`          | Buggy state       | Time row shows "12:00 AM" — incorrect for All Day events |
| `screen-fixed`          | Fixed state       | Time row shows "All Day" capsule — correct behaviour     |
| `screen-interactive-bug`| Interactive phone | Toggle between buggy/fixed with an in-frame segmented control |

## Navigation Flows
- Phone 3 toggle: tap **Buggy** → shows `12:00 AM` in the time row
- Phone 3 toggle: tap **Fixed** → shows the `All Day` capsule pill with a spring animation

## Interactions Implemented
- Static side-by-side comparison (phones 1 & 2)
- Animated toggle between bug and fix states (phone 3)
- All Day capsule animates in with a spring scale (0.85 → 1.0)

## Acceptance Criteria Coverage

| AC                                                              | Screen              | Status  |
|-----------------------------------------------------------------|---------------------|---------|
| All-day event shows a time value (current wrong behaviour)      | `screen-buggy`      | Shown   |
| All-day event shows "All Day" capsule/badge instead of time     | `screen-fixed`      | Covered |
| Capsule/pill shape as suggested in the issue                    | `screen-fixed`      | Covered |
| Interactive toggle between both states for review               | `screen-interactive-bug` | Covered |

## Code Location
The fix should be applied in:

- **`berkeley-mobile/Events/EventDetailView.swift` — `timeView` computed property (line 154–158)**

  Current (buggy):
  ```swift
  private var timeView: some View {
      if let timePart = event.dateString.components(separatedBy: " / ").last {
           EventDetailRow(systemImageName: "clock", text: timePart)
      }
  }
  ```

  The `dateString` extension on `BMCalendarEvent` does return `"All Day"` correctly when
  `startDate` is midnight and `end` is 11:59:59 PM — but the `isAllDay` flag from the API
  is not consulted by `timeView`. If an event comes from the API with `isAllDay = true` but
  with a non-midnight `startDate`, the `dateString` extension will return a time string,
  not `"All Day"`.

  Fix approach: check `event.isAllDay` in `timeView` and render a capsule label instead of `EventDetailRow`:
  ```swift
  @ViewBuilder
  private var timeView: some View {
      if event.isAllDay == true {
          EventDetailRow(systemImageName: "clock") {
              Text("All Day")
                  .font(Font(BMFont.bold(12)))
                  .padding(.horizontal, 8)
                  .padding(.vertical, 3)
                  .background(Color.gray.opacity(0.2))
                  .clipShape(Capsule())
          }
      } else if let timePart = event.dateString.components(separatedBy: " / ").last {
          EventDetailRow(systemImageName: "clock", text: timePart)
      }
  }
  ```
  This mirrors the existing `AllDayEventBannerView` capsule pattern already in the codebase.
