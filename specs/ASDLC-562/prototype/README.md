# iOS Prototype: ASDLC-562 — All Day Event Indicator on Event Detail Page

## Scope

This prototype covers ONLY:
- **Event Detail Page (All Day state)** — the clock row shows an "All Day" capsule/pill badge instead of a time value
- **Event Detail Page (Timed state)** — the clock row shows the real start–end time (unchanged behavior, for comparison)
- **Events List** — minimal entry point showing one all-day and one timed event

## Design System Source

Extracted via CodeGraph from the berkeley-mobile-ios codebase:

| Token | Value | Source |
|---|---|---|
| Accent color | `#779AFC` | `BMColor.ActionButton.background` (Colors+ActionButton.swift) |
| Background | `#FAFAFA` light / `#414141` dark | `BMColor.modalBackground` (Colors.swift) |
| Surface | `#FFFFFF` light / `#484747` dark | `BMColor.cardBackground` (Colors.swift) |
| Primary text | `#2C2C2D` | `BMColor.Calendar.blackText` light (Colors+Calendar.swift) |
| Secondary text | `#626162` | `BMColor.Calendar.grayedText` light (Colors+Calendar.swift) |
| Font family | Apercu → system-ui | `BMFont` (Assets/Fonts.swift) |
| Card radius | 12px | `clipShape(RoundedRectangle(cornerRadius: 12))` in EventDetailView.swift |
| Inner radius | 10px | `clipShape(RoundedRectangle(cornerRadius: 10))` in EventDetailView.swift |
| Event accent | `#7297E6` | `BMColor.eventAcademic` (Colors+Event.swift) |

## How to Run

1. Open `specs/ASDLC-562/prototype/index.html` in Chrome, Firefox, or Safari
2. No installation, no server, no build step required
3. Renders inside an iPhone 15 Pro frame (393×852)

## Screens

| Screen ID | Name | Description |
|---|---|---|
| `screen-events` | Events List | Minimal list with one all-day and one timed event |
| `screen-detail-allday` | Event Detail — All Day | Clock row shows "All Day" capsule (**the fix**) |
| `screen-detail-timed` | Event Detail — Timed | Clock row shows "2:00 PM – 4:30 PM" (unchanged behavior) |

## Navigation Flows

- **Events list**: tap "Fall 2025 Academic Holiday" → `pushScreen('screen-detail-allday')`
- **Events list**: tap "Exhibit | A Storied Campus" → `pushScreen('screen-detail-timed')`
- **Any detail**: tap back chevron → `popScreen()`
- **Demo controls**: "All Day Event" / "Timed Event" tabs jump directly to each detail state

## Interactions Implemented

- Push navigation (slide in from right, outgoing slides to left −30%)
- Pop navigation (reverse)
- Demo tab switcher to compare all-day vs timed states side by side
- Learn More / Register buttons show a toast notification
- Add to Calendar nav bar button (visual only)

## The Change — All Day Capsule

In `EventDetailView.swift`, the `timeView` computed property currently reads:

```swift
@ViewBuilder
private var timeView: some View {
    if let timePart = event.dateString.components(separatedBy: " / ").last {
         EventDetailRow(systemImageName: "clock", text: timePart)
    }
}
```

For all-day events this renders "12:00 AM" which is incorrect. The fix replaces the `text:` value with an "All Day" capsule/badge when `event.isAllDay == true`.

In the prototype, `.all-day-capsule` (styles.css) renders a filled blue pill with "ALL DAY" in bold uppercase white text, placed inline after the clock icon — matching the `EventDetailRow` structure.

## Acceptance Criteria Coverage

| AC | Screen | Status |
|---|---|---|
| All-day events show "All Day" indicator instead of "12:00 AM" | `screen-detail-allday` | Covered — capsule displayed |
| Indicator is capsule/pill-shaped | `screen-detail-allday` | Covered — `border-radius: 20px` pill |
| Timed events continue showing actual time | `screen-detail-timed` | Covered — "2:00 PM – 4:30 PM" shown |
