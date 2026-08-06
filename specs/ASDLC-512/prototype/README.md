# iOS Prototype: ASDLC-512 — Event Detail: All Day Indicator

## Scope

This prototype covers **one screen only**: the Event Detail page (`EventDetailView`) — specifically the time row inside `BMDetailHeaderView`.

Two variants are toggled via buttons above the iPhone frame:
- **All Day Event** — the **fixed** behaviour: an "All Day" capsule/pill badge replaces the time value.
- **Timed Event (current bug)** — the **current buggy** behaviour: "12:00 AM" is shown even though the event is marked as All Day.

## Design System Source

| Token | Value | Source |
|---|---|---|
| Accent color | `#FB9B8E` | `BMColor.selectedButtonBackground` (CodeGraph) |
| Card background | `#FFFFFF` light / `#484747` dark | `BMColor.cardBackground` (CodeGraph) |
| Modal background | `#FAFAFA` light / `#414141` dark | `BMColor.modalBackground` (CodeGraph) |
| Font family | `Apercu` → `system-ui` fallback | `BMFont` in `Assets/Fonts.swift` (CodeGraph) |
| Corner radius | `12px` | `CardView.layer.cornerRadius` (CodeGraph) |
| All Day capsule bg | `rgba(120,120,128,0.28)` | Matches `AllDayEventBannerView` fill: `.gray.opacity(0.5)` (CodeGraph) |
| All Day font | Bold 15px / 12px | `BMFont.bold(15)` in `AllDayEventBannerView` (CodeGraph) |

## How to Run

1. Open `specs/ASDLC-512/prototype/index.html` in Chrome, Firefox, or Safari
2. No installation, no server, no build step required
3. Renders inside an iPhone 15 Pro frame (393×852, Dynamic Island)

## Screens

| Screen ID | Name | Description |
|---|---|---|
| `screen-allday` | Event Detail — Fixed | Shows "All Day" capsule badge in the time row |
| `screen-timed` | Event Detail — Bug state | Shows "12:00 AM" incorrectly for an all-day event |

## Navigation Flows

- Top toggle → "All Day Event" → `showVariant('allday')` → `screen-allday` (fixed)
- Top toggle → "Timed Event (current bug)" → `showVariant('timed')` → `screen-timed` (bug)

## Key UI Detail: All Day Capsule

Matching the app's `AllDayEventBannerView` pattern and the issue's suggestion:

```
EventDetailRow (clock icon)  +  <span class="all-day-badge">All Day</span>
```

The badge is a pill-shaped element using `border-radius: 100px`, filled with `rgba(120,120,128,0.28)` (gray tint), bold "All Day" text — consistent with how `AllDayEventBannerView` uses a `Capsule().fill(.gray.opacity(0.5))` in the real codebase.

## Acceptance Criteria Coverage

| AC | Screen | Status |
|---|---|---|
| All Day events show "All Day" indicator instead of time | `screen-allday` | Covered — capsule badge in time row |
| Regular events continue showing time normally | `screen-timed` | Illustrated (alongside bug annotation) |
| Indicator uses capsule/pill shape | `screen-allday` | Covered — `.all-day-badge` CSS class |
| "12:00 AM" no longer appears for All Day events | `screen-allday` | Covered — time text replaced entirely |
