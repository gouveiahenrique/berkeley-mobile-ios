# iOS Prototype: ASDLC-572 — All Day Indicator on Event Detail Page

## Scope

This prototype covers **only** the Event Detail page time-row change:

- **Screen 1 (`screen-allday`)** — Event Detail for an All Day event: clock icon + "All Day" capsule replacing any clock time
- **Screen 2 (`screen-timed`)** — Event Detail for a timed event: clock icon + "2:00 PM - 3:30 PM" (behavior unchanged)

Nothing else from the Events feature is prototyped.

## Design System Source

Extracted from the codebase via CodeGraph:

| Token | Value | Source |
|---|---|---|
| Accent color | `#81A4FF` | `BMColor.mapAnnotationColor` |
| Calendar accent | `#5670B9` | `BMColor.Calendar.dayOfWeekHeader` |
| Background | `#FAFAFA` / `#1C1C1E` dark | `BMColor.modalBackground` |
| Card surface | `#FFFFFF` / `#2C2C2E` dark | `BMColor.cardBackground` |
| Primary text | `#2C2C2D` / `#FAFAFA` dark | `BMColor.Calendar.blackText` |
| Secondary text | `#626162` / `#AAAAAA` dark | `BMColor.Calendar.grayedText` |
| All Day capsule bg | `rgba(120,120,128,0.3)` | `AllDayEventBannerView` `.gray.opacity(0.5)` |
| Button color | `#FB9B8E` | `BMColor.selectedButtonBackground` |
| Font family | Apercu (→ system-ui) | `BMFont` (`Apercu-Regular/Bold/Light`) |
| Corner radius | 10–12 px | `RoundedRectangle(cornerRadius: 10/12)` |

## How to Run

1. Open `specs/ASDLC-572/prototype/index.html` in Chrome, Firefox, or Safari
2. No installation, no server, no build step required
3. Renders inside an iPhone 15 Pro frame (393×852)
4. Use the **"All Day Event / Timed Event"** toggle above the frame to switch states

## Screens

| Screen ID | Name | Description |
|---|---|---|
| `screen-allday` | Event Detail — All Day | Shows clock icon + "All Day" capsule in time row |
| `screen-timed` | Event Detail — Timed | Shows clock icon + "2:00 PM – 3:30 PM" in time row |

## Navigation Flows

- Demo toggle → "All Day Event" → activates `screen-allday`
- Demo toggle → "Timed Event" → activates `screen-timed`

## Interactions Implemented

- Demo toggle switches between All Day and Timed event detail views
- Both screens fully rendered with status bar, navigation bar, header card (frosted glass overlay + gradient image placeholder), description card, and action buttons
- Clock icon always present in the time row (BR-004 compliance)
- Dark mode supported via `@media (prefers-color-scheme: dark)`

## Acceptance Criteria Coverage

| AC Scenario | Screen | Status |
|---|---|---|
| All Day event shows "All Day" capsule, no clock time | `screen-allday` | Covered |
| Timed event shows "2:00 PM - 3:30 PM", no capsule | `screen-timed` | Covered |
| Clock icon visible beside capsule (BR-004) | `screen-allday` | Covered |
| Clock icon visible beside time text | `screen-timed` | Covered |
| "All Day" text readable in light appearance | `screen-allday` | Covered (CSS light mode) |
| "All Day" text readable in dark appearance | `screen-allday` | Covered (`prefers-color-scheme: dark`) |
| Date row and location row unchanged | Both | Covered |
| "12:00 AM" not shown anywhere for All Day event | `screen-allday` | Covered |
