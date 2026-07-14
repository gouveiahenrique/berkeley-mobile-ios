# Business Requirements Specification
## ASOS-9: Events Page — Display "All Day" Indicator on Event Detail Page

---

## 1. Executive Summary

The Berkeley Mobile iOS application provides a campus events feed sourced from Berkeley's events API via Firebase. Events carry an `isAllDay` flag that indicates whether a specific start/end time is meaningless for that event (e.g., academic calendar days, university-wide holidays, all-day exhibits).

The Events list view already handles this distinction correctly: all-day events are rendered as a banner (`AllDayEventBannerView`) rather than a timed row. However, the **Event Detail Page** (`EventDetailView`) does not apply the same logic. When a user taps an all-day event and lands on the detail screen, the time row unconditionally renders a formatted time value derived from the `dateString` property — defaulting to "12:00 AM" because all-day events have a `startDate` set to midnight (00:00:00) and an `endDate` set to 23:59:59.

This creates a user-facing inaccuracy: the detail page implies a specific 12:00 AM start time for events that have no defined time. The fix is to replace the time value in the detail page's time row with an "All Day" capsule/badge whenever the event's all-day status is true.

---

## 2. Problem Statement

### Current State
- The `timeView` component in `EventDetailView` extracts the time segment from `event.dateString` by splitting on `" / "` and taking the last component.
- For all-day events, `dateString` returns a string of the form `"Today / All Day"` or `"MM/DD/YYYY / All Day"`. However, the `timeView` implementation uses `.last` on the split result, which — when `dateString` has the expected format — does return "All Day", but the display treats it as plain text inside a generic `EventDetailRow`, not as a visually distinct indicator.
- Additionally, the `isAllDay` flag on `BMEventCalendarEntry` is already available in the view but is never consulted in `EventDetailView`; the view relies solely on `dateString` parsing, which is fragile and does not communicate the all-day status visually.
- The existing `dateString` logic in `BMCalendarEvent` computes all-day status via time-component matching (midnight start, 23:59:59 end) rather than the authoritative `isAllDay` flag sourced from the backend.

### Desired State
- When an event is marked as all-day (via `isAllDay == true`), the time row on the Event Detail Page displays a visually distinct "All Day" capsule/pill label instead of any time value.
- The capsule matches the existing design language established by `AllDayEventBannerView` (pill-shaped, "All Day" label).
- All-day status determination is driven by the authoritative `isAllDay` field from the event data, not by parsing formatted strings or matching time components.

### Business Impact
- **User trust**: Displaying "12:00 AM" for an all-day academic event (e.g., UC Berkeley enrollment deadlines, holidays) is misleading and erodes confidence in the app's accuracy.
- **Design consistency**: The events list distinguishes all-day events visually; the detail page must be consistent with that treatment.
- **No-timed-constraint clarity**: Students and staff relying on event details to plan their day must not be misled into believing an all-day event starts at midnight.

---

## 3. Personas & User Stories

### Personas

| Persona | Description | Platform |
|---|---|---|
| UC Berkeley Student | Primary consumer of the events feed; uses event details to decide whether to attend | Mobile (iOS) |
| Campus Staff / Faculty | Views events such as enrollment windows, academic deadlines | Mobile (iOS) |
| App Content Team | Publishes event data including the `isAllDay` flag via Firebase | Backend (data source) |

### User Stories

**US-001** — Student viewing an all-day event detail:
> As a Berkeley student, when I tap on an all-day event (e.g., a campus holiday or academic deadline), I want the time row on the detail page to clearly say "All Day" so that I understand no specific time applies to this event.

**US-002** — Student viewing a timed event detail:
> As a Berkeley student, when I tap on an event with specific start and end times, I want the time row to display the formatted time range (e.g., "10:00 AM – 11:30 AM") exactly as before, so that the existing behavior is not regressed.

**US-003** — Student viewing a timed event with no end time:
> As a Berkeley student, when I tap on an event with a start time but no end time, I want the time row to display only the start time (e.g., "3:00 PM") as currently shown.

---

## 4. Business Rules

**BR-001 — Authoritative All-Day Source**
The `isAllDay` boolean field on the event data object is the authoritative source for determining whether an event is all-day. This field is populated directly from the backend data (Firebase/Berkeley Events API). Time-component heuristics (e.g., checking if start time is 00:00:00 and end time is 23:59:59) must NOT be used as the primary signal; they may be used as a fallback only when `isAllDay` is absent (nil).

**BR-002 — All-Day Time Row Display**
When `isAllDay` is `true`, the time row on the Event Detail Page must display a capsule/pill-shaped badge containing the text "All Day". No numeric time value (start or end) is shown in this row.

**BR-003 — Timed Event Time Row Display (No Regression)**
When `isAllDay` is `false` or `nil`, the time row must display the formatted time string as it does today (start time, and if an end time exists, "start time – end time"). No visual change is introduced for timed events.

**BR-004 — Nil / Missing isAllDay Field**
When `isAllDay` is `nil` (absent from the data source), the system must fall back to the existing `dateString`-based display, treating the event as timed. The "All Day" capsule must not be shown unless `isAllDay` is explicitly `true`.

**BR-005 — Visual Consistency**
The "All Day" capsule displayed on the Event Detail Page must be visually consistent in shape (pill/capsule) and label text ("All Day") with the `AllDayEventBannerView` used on the Events list page. The exact color, font weight, and sizing may be adapted to the detail page context (smaller, inline) but the pill shape and "All Day" label are required.

**BR-006 — Date Row Unaffected**
The date row (showing the event date such as "Today" or "MM/DD/YYYY") must continue to display correctly for all events regardless of all-day status. Only the time row is modified by this feature.

**BR-007 — Timed Events with "All Day" Text in dateString Must Not Trigger Capsule**
The "All Day" capsule is triggered exclusively by the `isAllDay` flag, not by detecting the string "All Day" in `dateString`. This prevents any future formatting changes to `dateString` from inadvertently changing UI behavior.

**BR-008 — Time Row Visibility for All-Day Events**
The time row must still be visible (not hidden) for all-day events; it must show the "All Day" capsule. Hiding the time row entirely is out of scope and would reduce information density without user benefit.

---

## 5. Acceptance Criteria

### AC-001 — All-Day Event Shows Capsule, Not Time [MOBILE]
```gherkin
Given a user has opened an event where isAllDay is true
When the Event Detail Page loads
Then the time row displays a pill-shaped "All Day" label
And no start time or end time value is shown in that row
And the date row correctly shows the event date (e.g., "Today" or "MM/DD/YYYY")
```

### AC-002 — Timed Event with End Time Shows Time Range (No Regression) [MOBILE]
```gherkin
Given a user has opened an event where isAllDay is false
And the event has both a startDate and an endDate
When the Event Detail Page loads
Then the time row displays the formatted time range (e.g., "10:00 AM – 11:30 AM")
And no "All Day" capsule appears in the time row
```

### AC-003 — Timed Event Without End Time Shows Start Time Only (No Regression) [MOBILE]
```gherkin
Given a user has opened an event where isAllDay is false
And the event has a startDate but no endDate
When the Event Detail Page loads
Then the time row displays only the formatted start time (e.g., "3:00 PM")
And no "All Day" capsule appears in the time row
```

### AC-004 — isAllDay Nil Treated as Timed Event [MOBILE]
```gherkin
Given a user has opened an event where isAllDay is nil
When the Event Detail Page loads
Then the time row displays the time value from dateString
And no "All Day" capsule appears
```

### AC-005 — All-Day Capsule is Visually Distinct (Pill Shape) [MOBILE]
```gherkin
Given the Event Detail Page is showing an all-day event
When the user views the time row
Then the "All Day" label is enclosed in a pill/capsule-shaped container
And the capsule is visually distinguishable from a plain text row
```

### AC-006 — Events List Row Behavior Unchanged [MOBILE]
```gherkin
Given the Events list page is showing a mix of all-day and timed events
When the user scrolls the list
Then all-day events continue to render as AllDayEventBannerView rows
And timed events continue to render as EventRowView rows
And no visual regression is introduced on the list page
```

### AC-007 — All-Day Event Can Still Be Added to Calendar [MOBILE]
```gherkin
Given a user is viewing the Event Detail Page for an all-day event
When the user taps the calendar toolbar button
Then the add/remove calendar flow proceeds exactly as before
And the all-day status is correctly propagated when saving to the system calendar
```

---

## 6. Non-Functional Requirements

**NFR-001 — Performance**
The all-day flag check is a simple boolean evaluation on an already-loaded model object. It must add no perceptible latency to the Event Detail Page render time.

**NFR-002 — Accessibility**
The "All Day" capsule must be accessible to VoiceOver users. It must have a meaningful accessibility label (e.g., "All Day event") so that screen reader users are clearly informed that no specific time applies.

**NFR-003 — No Network Dependency**
The all-day determination is performed entirely from already-fetched event data. No additional network call is required to render the indicator.

**NFR-004 — Localization Readiness**
The "All Day" label text must be defined in a way that supports future localization (i.e., the string is not hardcoded in a way that blocks translation). The Portuguese/Brazilian-Portuguese locale is not currently required but must not be structurally blocked.

**NFR-005 — Data Integrity**
The `isAllDay` flag is sourced from Firebase (the `BerkeleyEvent.isAllDay` field). No client-side mutation or inference should override an explicit `true` value from the backend.

---

## 7. Edge Cases & Special Scenarios

**EC-001 — All-Day Event with startDate Not at Midnight**
Some events may have `isAllDay = true` but a `startDate` that is not exactly 00:00:00 (e.g., due to data inconsistency). The display must honor `isAllDay = true` and show the capsule, regardless of the actual time components.

**EC-002 — Timed Event with Midnight Start Time**
An event with `isAllDay = false` (or nil) and a startDate of 00:00:00 must NOT show the "All Day" capsule. It should display "12:00 AM" as before, since the time is meaningful for that event.

**EC-003 — Event Where dateString Returns "All Day" but isAllDay is False/Nil**
If the heuristic in `dateString` (start = midnight, end = 23:59:59) triggers the "All Day" string but `isAllDay` is false or nil, the time row behavior is governed by `isAllDay`, not by `dateString`. Implementation must not rely on `dateString` parsing to decide the capsule.

**EC-004 — Event with No End Date and isAllDay True**
An event where `isAllDay = true` and `end = nil` is still a valid all-day event. The capsule must display and no end time is shown.

**EC-005 — Rapid Navigation Between All-Day and Timed Events**
When a user navigates quickly between multiple events of different types (all-day vs timed), the time row must render the correct indicator for each event without state bleed from prior detail pages.

---

## 8. Out of Scope

- Changes to the Events list page (`EventsView`, `AllDayEventBannerView`, `EventRowView`) — these are already correct.
- Changes to the `dateString` computed property in `BMCalendarEvent` — this is used in other contexts and its modification is not required for this fix.
- Changes to the calendar add/delete flow or any calendar-related business logic.
- Changes to the backend Firebase data schema or the `BerkeleyEvent` Codable model.
- Localization/translation of the "All Day" string into languages other than English.
- Any changes to push notification behavior for all-day events.
- Changes to how all-day events appear in the system iOS Calendar once added by the user.
- Changes to the Today feed or any view outside of `EventDetailView` / `BMDetailHeaderView`.

---

## 9. Success Metrics

| Metric | Target |
|---|---|
| All-day events on detail page show capsule, not time | 100% of events where `isAllDay == true` |
| Timed events on detail page unaffected | 0 regressions on timed event time display |
| Accessibility label present on capsule | VoiceOver reads a meaningful descriptor |
| User-reported confusion about all-day event times | Eliminated (qualitative, post-release) |

---

## 10. References

- Related view: `berkeley-mobile/Events/EventDetailView.swift` — `BMDetailHeaderView.timeView`
- Event model: `berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift` — `isAllDay: Bool?`
- Protocol & dateString: `berkeley-mobile/Data/ItemProtocols/BMCalendarEvent.swift`
- Existing all-day list UI: `berkeley-mobile/Events/AllDayEventBannerView.swift`
- Data service / isAllDay source: `berkeley-mobile/Events/EventDataSource/EventsViewModel.swift` — `BerkeleyEvent.isAllDay`
- Events list rendering: `berkeley-mobile/Events/EventsView.swift` — `isAllDay == true` branch
- Repository: https://github.com/gouveiahenrique/berkeley-mobile-ios
