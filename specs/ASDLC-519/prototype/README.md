# iOS Prototype: ASDLC-519 — Event Detail: All Day Indicator

## Scope
This prototype covers **only** the screens required by ASDLC-519:
1. Events list (entry point showing both all-day and timed events)
2. Event Detail for an **All Day** event — showing the "All Day" capsule fix
3. Event Detail for a **timed** event — normal time display (comparison)

## Design System Source
Extracted via CodeGraph from `berkeley-mobile/Assets/`:

| Token | Value | Source |
|---|---|---|
| Accent color | `#FB9B8E` | `BMColor.selectedButtonBackground` |
| Calendar blue | `#566FB9` | `BMColor.Calendar.dayOfWeekHeader` |
| Background | `#FAFAFA` / `#000` (dark) | `BMColor.modalBackground` |
| Surface | `#FFFFFF` / `#484747` (dark) | `BMColor.cardBackground` |
| Primary text | `#2C2C2D` / `#FAFAFA` (dark) | `BMColor.Calendar.blackText` |
| Secondary text | `#626162` / `#AAAAAA` (dark) | `BMColor.Calendar.grayedText` |
| All Day fill | `rgba(120,120,128,0.35)` | `AllDayEventBannerView` (`.gray.opacity(0.5)`) |
| Font family | Apercu → `system-ui` | `BMFont` (Apercu-Regular/Bold/Light) |
| Corner radius | 10–12px | `clipShape(RoundedRectangle(cornerRadius:10/12))` |

## How to Run
1. Open `specs/ASDLC-519/prototype/index.html` in Chrome, Firefox, or Safari
2. No installation, no server, no build step required
3. Renders inside an iPhone 15 Pro frame (393×852)

## Screens

| Screen ID | Name | Description |
|---|---|---|
| `screen-events` | Events List | Events grouped by date; All Day banners + timed event cards |
| `screen-detail-allday` | Event Detail (All Day) | Shows "All Day" capsule in the time row — **expected behavior** |
| `screen-detail-timed` | Event Detail (Timed) | Shows normal time string — comparison / reference |

## Navigation Flows
- Events List → tap All Day banner → `pushScreen('screen-detail-allday')`
- Events List → tap timed event card → `pushScreen('screen-detail-timed')`
- Either detail screen → tap "Events" back button → `popScreen()`

## Interactions Implemented
- Push/pop navigation (slide-from-right, 320ms cubic-bezier)
- Tap feedback on list rows (opacity transition)
- Dark mode via `@media (prefers-color-scheme: dark)`
- Action button tap feedback

## The Bug and Fix (ASDLC-519)

**Root cause:** `EventDetailView.swift` `timeView` reads from `event.dateString`, which is computed in `BMCalendarEvent` extension and returns `"All Day"` only when `startDate` is exactly midnight and `end` is exactly 23:59:59. When `event.isAllDay == true` but the time components don't match that heuristic, the time part falls through and displays `"12:00 AM"`.

**Fix:** Check `event.isAllDay == true` before reading `dateString` — if true, render the "All Day" capsule; otherwise render the `EventDetailRow` with the time string from `dateString`.

```swift
// EventDetailView.swift — timeView
@ViewBuilder
private var timeView: some View {
    if event.isAllDay == true {
        EventDetailRow(systemImageName: "clock") {
            Capsule()
                .fill(.gray.opacity(0.5))
                .frame(height: 26)
                .overlay(Text("All Day").font(Font(BMFont.bold(13))))
        }
    } else if let timePart = event.dateString.components(separatedBy: " / ").last {
        EventDetailRow(systemImageName: "clock", text: timePart)
    }
}
```

## Acceptance Criteria Coverage

| AC | Screen | Status |
|---|---|---|
| All Day event shows "All Day" capsule in time row | `screen-detail-allday` | Covered |
| Timed event continues to show time string in time row | `screen-detail-timed` | Covered |
| "All Day" uses capsule/pill shape | `screen-detail-allday` (`.allday-capsule`) | Covered |
