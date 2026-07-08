# Business Requirements Specification
## TDLOKI-124 — Events Page: Display "All Day" Indicator Instead of Time on Event Detail Page

**Status**: Draft  
**Date**: 2026-07-08  
**Platform**: Mobile (iOS)  
**Repository**: berkeley-mobile-ios  

---

## 1. Executive Summary

The Berkeley Mobile iOS app includes an Events feature that displays campus-wide events to students and staff. Each event can be created as either a timed event (with specific start and end times) or an all-day event (spanning an entire calendar day with no specific hour/minute).

On the Event Detail Page, the time row currently displays a formatted time string extracted from the event's `dateString` property. For all-day events, this parsing produces a misleading value (e.g., "12:00 AM") instead of clearly communicating that the event has no fixed time. The fix requires the Event Detail Page to detect the all-day condition and render an "All Day" capsule/pill label in place of the time text.

---

## 2. Problem Statement

### Current State
- The Event Detail Page header (`BMDetailHeaderView`) splits the `dateString` property on " / " to extract separate date and time parts.
- The `dateString` property in the `BMCalendarEvent` protocol correctly returns "All Day" as the time portion when an event meets the all-day criteria (midnight start, 11:59:59 PM end).
- However, the `isAllDay` flag on `BMEventCalendarEntry` is an independent optional boolean that is populated from the data source and may not always align with the `dateString` computation.
- In cases where `isAllDay` is set but the time portion of `dateString` falls back to "12:00 AM" (e.g., when the date component check does not match), the time row renders "12:00 AM", misleading users into thinking the event has a specific start time.

### Desired State
- When an event is marked as all-day (via `isAllDay == true`), the time row on the Event Detail Page must display an "All Day" capsule/pill-shaped badge instead of any time string.
- The capsule label must be visually distinct from the plain-text time row to clearly communicate the all-day nature of the event.
- Non-all-day events must continue to display their formatted time range unchanged.

### Impact
- **Students and staff**: Receive accurate scheduling information and avoid confusion about event timing.
- **Event organizers**: Their all-day events (academic deadlines, campus-wide holidays, enrollment periods) are communicated correctly.
- **App quality**: Eliminates a data presentation bug that degrades trust in the app's event information.

### Urgency
Displaying an incorrect time (12:00 AM) for all-day events is a factual misrepresentation. Users relying on the app for scheduling may misinterpret all-day events as occurring at midnight. This should be corrected before next release.

---

## 3. Personas & User Stories

### Primary Persona: Berkeley Student / Staff Member (Mobile App User)
A UC Berkeley student or staff member uses the Berkeley Mobile iOS app to browse upcoming campus events. They navigate to an event they are interested in and open the Event Detail Page to confirm timing and location before adding it to their calendar.

**User Story**:  
As a Berkeley Mobile app user, when I open an Event Detail Page for an all-day event, I want the time row to clearly show "All Day" so that I am not misled into thinking the event starts at 12:00 AM.

### Secondary Persona: Event List Browser
A user scrolling through the Events list page already sees all-day events presented via the `AllDayEventBannerView` (capsule strip) rather than as a standard `EventRowView`. This user expects consistent visual language when they tap through to the detail view.

**User Story**:  
As a user who saw an all-day event banner in the Events list, when I tap into the Event Detail Page, I want the time area to visually match my expectation of "All Day" — not show an ambiguous clock time.

---

## 4. Scope Definition

### In Scope
- Modifying the time row on the Event Detail Page (`BMDetailHeaderView`) to display an "All Day" capsule/pill label when `isAllDay == true`.
- The capsule style must be consistent with the existing `AllDayEventBannerView` design language already used in the Events list.
- All-day detection must be based on the `isAllDay` property of `BMEventCalendarEntry`.

### Out of Scope
- Changes to the Events list page (`EventsView`) or the `AllDayEventBannerView` on the list.
- Changes to how `isAllDay` is sourced or populated from the backend data source.
- Changes to the `dateString` computation logic in `BMCalendarEvent`.
- Changes to the `EventRowView` row presentation.
- Any backend API changes.
- Android platform (this is an iOS-only repository).
- Adding the all-day indicator to the calendar add/edit flow.

### Dependencies
- `BMEventCalendarEntry.isAllDay: Bool?` must be correctly populated from the data source for the event being viewed. This is a pre-existing field.
- The `AllDayEventBannerView` component exists and establishes the visual pattern; the detail page must use a consistent capsule presentation.

---

## 5. Business Rules

**BR-001**: When an event's `isAllDay` property is `true`, the Event Detail Page time row MUST display an "All Day" capsule/pill badge. No clock time (start or end) may be shown in the time row for all-day events.

**BR-002**: When an event's `isAllDay` property is `false`, `nil`, or absent, the Event Detail Page time row MUST display the formatted time string derived from `dateString` as it does today. No regression is permitted for timed events.

**BR-003**: The "All Day" indicator displayed on the Event Detail Page MUST be visually styled as a capsule or pill shape, consistent with the existing `AllDayEventBannerView` visual language used on the Events list page.

**BR-004**: The all-day detection on the Event Detail Page MUST rely on the `isAllDay` boolean property of `BMEventCalendarEntry`, not on string parsing of `dateString`. The `dateString` approach is unreliable because the "All Day" text within it is produced by a date-component heuristic that may not always match the `isAllDay` flag.

**BR-005**: The date row (showing calendar date) on the Event Detail Page is not affected by this change and MUST continue to display correctly for both all-day and timed events.

**BR-006**: The clock icon (`systemName: "clock"`) displayed alongside the time row MUST remain visible when the "All Day" capsule is shown, maintaining visual row consistency within `BMDetailHeaderView`.

**BR-007**: If `isAllDay` is `nil` (data not provided), the system MUST fall back to timed event behavior (display time from `dateString`), treating nil as non-all-day.

---

## 6. Acceptance Criteria

All acceptance criteria are tagged [MOBILE] as this is a mobile-only (iOS) change.

---

### AC-001 — All-Day Event Shows Capsule Badge Instead of Time [MOBILE]

**Given** a user opens the Event Detail Page for an event where `isAllDay` is `true`  
**When** the detail header renders the time row  
**Then** the time row displays a capsule/pill-shaped "All Day" label  
**And** no formatted clock time (e.g., "12:00 AM", "9:00 AM - 5:00 PM") is visible in the time row  
**And** the clock icon is still visible adjacent to the capsule label  

---

### AC-002 — Timed Event Continues to Show Formatted Time [MOBILE]

**Given** a user opens the Event Detail Page for an event where `isAllDay` is `false` or `nil`  
**When** the detail header renders the time row  
**Then** the time row displays the formatted time string from `dateString` (e.g., "9:00 AM - 5:00 PM" or "9:00 AM")  
**And** no "All Day" label or capsule is shown  

---

### AC-003 — All-Day Event Date Row Is Unaffected [MOBILE]

**Given** a user opens the Event Detail Page for an event where `isAllDay` is `true`  
**When** the detail header renders  
**Then** the date row continues to display the correct calendar date (e.g., "Today", "Tomorrow", or "MM/DD/YYYY")  
**And** the date row is visually unchanged  

---

### AC-004 — Nil isAllDay Treated as Timed Event [MOBILE]

**Given** a user opens the Event Detail Page for an event where `isAllDay` is `nil`  
**When** the detail header renders the time row  
**Then** the behavior is identical to a timed event: the formatted time from `dateString` is shown  
**And** no "All Day" capsule is shown  

---

### AC-005 — "All Day" Capsule Visual Style [MOBILE]

**Given** an all-day event is displayed on the Event Detail Page  
**When** the user views the time row  
**Then** the "All Day" indicator is rendered as a capsule/pill-shaped element (rounded ends)  
**And** the visual styling is recognizably consistent with the "All Day" capsule language used on the Events list page  

---

### AC-006 — All-Day Event with No End Date [MOBILE]

**Given** a user opens the Event Detail Page for an all-day event where the `end` date is `nil`  
**And** `isAllDay` is `true`  
**When** the detail header renders the time row  
**Then** the time row still displays the "All Day" capsule label (the missing end date does not break the all-day indicator)  

---

### AC-007 — Timed Event with Both Start and End Time [MOBILE]

**Given** a user opens the Event Detail Page for an event with `isAllDay` as `false` or `nil`  
**And** the event has a non-nil `end` date  
**When** the detail header renders the time row  
**Then** the time row displays a range string (e.g., "9:00 AM - 5:00 PM")  
**And** no "All Day" indicator is shown  

---

## 7. Non-Functional Requirements

**NFR-001 — Performance**: The all-day check is a boolean property read; it must not introduce any perceptible delay in rendering the Event Detail Page. Page load time must not regress from the current baseline.

**NFR-002 — Accessibility**: The "All Day" capsule element must be accessible to VoiceOver. The accessibility label for the time row when displaying the capsule must read "All Day" so screen reader users receive the same information as sighted users.

**NFR-003 — Visual Consistency**: The capsule styling must align with the existing design system patterns used in `AllDayEventBannerView` to maintain a cohesive user experience across the Events feature. No new colors or font weights outside the current `BMFont`/`BMColor` system may be introduced without design approval.

**NFR-004 — No Regression**: Timed event display on the Event Detail Page must be pixel-identical to the current behavior. No visual or functional regressions are acceptable for non-all-day events.

**NFR-005 — Platform**: This change applies exclusively to the iOS mobile application. It has no backend or Android scope.

---

## 8. Edge Cases & Special Scenarios

**EC-001 — `isAllDay = true` but `dateString` time part is a valid time (not "All Day")**: This is the primary bug scenario. The fix must use `isAllDay` as the authoritative signal, not the string content of `dateString`. The capsule MUST be shown when `isAllDay == true` regardless of what `dateString` returns.

**EC-002 — Event with `isAllDay = true` and `startDate` not at midnight**: If the data source provides an all-day event where `startDate` is not exactly midnight (a data quality issue), `isAllDay == true` still governs display behavior. The capsule is shown; time parsing is bypassed.

**EC-003 — Event with `dateString` returning "… / All Day" but `isAllDay = false` or `nil`**: In this case, `isAllDay` is the authoritative flag. If `isAllDay` is not `true`, the standard time string from `dateString` is used. The "All Day" text within `dateString` would be rendered as a plain string — this is an existing data inconsistency that is out of scope to resolve here.

**EC-004 — Very long event name or location not affecting time row**: The capsule label in the time row must not overflow or truncate the layout when the event name or other fields are lengthy. The capsule must be constrained to the time row's designated visual area.

---

## 9. Out of Scope

- Backend API changes, data source changes, or server-side event flag handling.
- Changes to the Events list page or `AllDayEventBannerView`.
- Changes to `BMCalendarEvent.dateString` computation logic.
- Calendar add/edit flow UI changes.
- Android platform.
- Push notification content for all-day events.
- Localization of the "All Day" string (future concern; the existing `AllDayEventBannerView` uses the same hardcoded string pattern).

---

## 10. Success Metrics

- **Bug resolution**: Zero occurrences of "12:00 AM" displayed on the Event Detail Page time row for events where `isAllDay == true`.
- **Visual consistency**: The "All Day" capsule on the detail page is visually consistent with the list page capsule, as verified by design review.
- **No regression**: All timed event Event Detail Pages continue to display formatted time strings correctly.
- **Accessibility**: VoiceOver reads "All Day" for the time row on all-day events.

---

## 11. References

- Related component — `AllDayEventBannerView`: `berkeley-mobile/Events/AllDayEventBannerView.swift` (existing capsule pattern)
- Affected view — `EventDetailView` / `BMDetailHeaderView`: `berkeley-mobile/Events/EventDetailView.swift`, lines 154–158 (`timeView` computed property)
- Data model — `BMEventCalendarEntry.isAllDay`: `berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift`, line 61
- Protocol default — `BMCalendarEvent.dateString`: `berkeley-mobile/Data/ItemProtocols/BMCalendarEvent.swift`, lines 38–65
- Events list all-day rendering: `berkeley-mobile/Events/EventsView.swift`, lines 25–26
- Issue tracker: TDLOKI-124
