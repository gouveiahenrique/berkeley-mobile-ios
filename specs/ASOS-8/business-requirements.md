# Business Requirements Specification
## ASOS-8: Events Page — Display "All Day" Indicator Instead of Time on Event Detail Page

---

## 1. Executive Summary

The Berkeley Mobile iOS application surfaces campus events to students and community members. Each event has a detail page that shows the event's date, time, and location. When an event spans the entire day (an "all-day" event), the time row on the Event Detail Page incorrectly displays a time value (e.g., "12:00 AM") instead of a meaningful indicator. This creates a misleading user experience. The fix requires the time row to display a capsule/pill-shaped "All Day" badge in place of any time value whenever the event is marked as all-day.

This is a mobile-only (iOS) display correction. No backend or data pipeline changes are required.

---

## 2. Problem Statement

### Current State
The Event Detail Page includes a time row (identified by a clock icon) that displays the event's start time. When an event carries an `isAllDay` flag, the backend API still stores a nominal start time of midnight (e.g., 12:00 AM) as a technical placeholder. The mobile application does not check the all-day flag before rendering the time row, so it presents "12:00 AM" to the user.

There is a secondary all-day detection path in the shared `dateString` computed property that checks whether start time equals 00:00:00 and end time equals 23:59:59 — but this check is not surfaced on the detail page's dedicated time row.

### Desired State
When an event is marked as all-day, the time row on the Event Detail Page must display a visually distinct "All Day" capsule label instead of any time value. When an event has a specific time, the time row continues to display the start time (and end time, if available) as today.

### Impact
- **Students and event attendees**: Eliminate confusion about event start times; users will immediately understand the event spans the full day and no specific attendance time applies.
- **Event organizers and campus staff**: Their intent — an all-day event with no scheduled start time — is accurately communicated to mobile users.
- **App quality**: Removes a factually incorrect data presentation that undermines user trust in the app.

### Urgency
The bug is currently live and visible to all users who open the detail page of any all-day campus event (e.g., academic calendar holidays, enrollment periods). Every view of such an event exposes the incorrect "12:00 AM" label.

---

## 3. Personas & User Stories

### Personas

| Persona | Description | Platform |
|---|---|---|
| Student (general) | UC Berkeley student browsing campus events and adding them to their calendar | Mobile (iOS) |
| Event attendee | Anyone opening a specific event to check timing and logistics | Mobile (iOS) |
| Event organizer / campus staff | Submits all-day events to the campus events system | Upstream data source (out of scope) |

### User Stories

**US-001** — As a student viewing an all-day event on the Event Detail Page, I want the time row to display "All Day" instead of a time value, so that I am not misled about when I need to attend.

**US-002** — As a student viewing a timed event on the Event Detail Page, I want the time row to continue displaying the correct start and end times, so that I know exactly when the event begins and ends.

**US-003** — As a student viewing an all-day event, I want the "All Day" indicator to be visually distinct (capsule/pill shaped), so that I can immediately differentiate it from a regular time display.

---

## 4. Business Rules

**BR-001** — An event is considered "all-day" when its `isAllDay` field is explicitly set to `true` in the data returned from the events data source (Firestore `Events` collection via `BerkeleyEvent.isAllDay`).

**BR-002** — When an event is all-day (`isAllDay == true`), the time row on the Event Detail Page MUST display a capsule/pill-shaped "All Day" label. No time value (start or end) may appear in the time row for that event.

**BR-003** — When an event is not all-day (`isAllDay == false` or `isAllDay == nil`), the time row MUST display the event's start time formatted as before, plus the end time range if an end time is present. This existing behavior must not be changed.

**BR-004** — The "All Day" indicator in the time row is visually styled as a capsule (pill) shape, consistent with the existing `AllDayEventBannerView` capsule pattern already present in the codebase, to maintain design language consistency.

**BR-005** — The determination of all-day status in the time row MUST use the `isAllDay` boolean field from the event model (`BMEventCalendarEntry.isAllDay`) as the authoritative source, rather than inferring all-day status from raw date/time component checks (i.e., do not rely solely on start 00:00:00 / end 23:59:59 heuristics for the detail page display).

**BR-006** — The `isAllDay` field is optional (`Bool?`) in the event model. When its value is `nil` (absent from the data source), the system MUST treat the event as NOT all-day and display the time row normally.

**BR-007** — The clock icon that precedes the time row MUST remain visible when the "All Day" capsule is displayed, maintaining visual consistency with the date and location rows which also use leading icons.

**BR-008** — The Event Row View (list view), the `dateString` computed property, and the All Day Event Banner View are separate components and are NOT modified by this change. Only the time row within the Event Detail Page header is affected.

---

## 5. Acceptance Criteria

All acceptance criteria below apply to the **MOBILE** platform (iOS app).

---

**AC-001** [MOBILE] — All-day event: time row shows "All Day" capsule

```gherkin
Given a campus event with isAllDay = true
When the user opens the Event Detail Page for that event
Then the time row displays a capsule/pill-shaped "All Day" label
And the time row does NOT display any time value (e.g., "12:00 AM" must not appear)
And the clock icon remains visible to the left of the "All Day" capsule
```

---

**AC-002** [MOBILE] — Timed event: time row shows correct time (no regression)

```gherkin
Given a campus event with isAllDay = false (or isAllDay = nil)
When the user opens the Event Detail Page for that event
Then the time row displays the event's start time formatted as before
And if the event has an end time, the end time is also displayed in range format
And no "All Day" capsule or label appears
```

---

**AC-003** [MOBILE] — All-day event with nil isAllDay: treated as timed

```gherkin
Given a campus event where isAllDay is absent (nil) from the data source
When the user opens the Event Detail Page for that event
Then the time row displays the nominal start time value
And no "All Day" capsule or label appears
```

---

**AC-004** [MOBILE] — "All Day" capsule visual style is consistent with design language

```gherkin
Given an all-day event is displayed on the Event Detail Page
When the user views the time row
Then the "All Day" label is enclosed in a capsule/pill shape
And the visual style is consistent with the existing capsule styling used elsewhere in the Events feature
```

---

**AC-005** [MOBILE] — Event list row is unaffected

```gherkin
Given a campus event with isAllDay = true
When the user views the event in the Events list (EventRowView)
Then the list row continues to display the date string as it did before this change
And no regression occurs in list row display
```

---

**AC-006** [MOBILE] — Date row is unaffected by this change

```gherkin
Given any campus event (all-day or timed)
When the user opens the Event Detail Page
Then the date row (calendar icon row) continues to display the event date correctly
And only the time row behavior changes
```

---

## 6. Non-Functional Requirements

**NFR-001 — Performance**: The all-day check is a simple boolean field read on an already-loaded model object. It must not introduce any additional network calls, async work, or perceptible rendering delay. Detail page load time must remain unchanged.

**NFR-002 — Offline behavior**: Event data is loaded from Firestore and the `isAllDay` field is part of the cached/loaded event model. The all-day display logic must function correctly whether the device is online or offline (using previously cached event data).

**NFR-003 — Accessibility**: The "All Day" capsule label must be accessible to screen readers (VoiceOver on iOS). The accessible label must clearly communicate "All Day" to visually impaired users, not just display the capsule visually.

**NFR-004 — Localization**: The "All Day" text string must be defined in a way that supports future localization (i.e., must not be a raw hardcoded string embedded only in layout code if the project uses a localization mechanism). If the project has no current localization mechanism, this is noted as a known limitation but must not block the fix.

**NFR-005 — No data/privacy impact**: This change reads only from data already present in the event model (`isAllDay: Bool?`). No new data fields are collected, stored, or transmitted. No personal data is involved. There are no privacy, consent, or data retention implications.

**NFR-006 — Backward compatibility**: Events that predate the `isAllDay` field (where the field is absent from Firestore) must be handled gracefully per BR-006 (treated as timed, not all-day).

---

## 7. Edge Cases & Special Scenarios

**EC-001 — isAllDay = true but time components are non-midnight**: If a future data entry error results in `isAllDay = true` with a non-midnight start time (e.g., 9:00 AM), the display rule is governed by `isAllDay` (BR-005). The time row MUST still show the "All Day" capsule because the explicit flag overrides any time component interpretation.

**EC-002 — isAllDay = false but time components are 00:00:00 / 23:59:59**: The time components heuristic in `dateString` (BMCalendarEvent protocol) may return "All Day" text in the full date string, but the dedicated time row on the detail page uses the `isAllDay` field (BR-005). The time row MUST display the time value (12:00 AM) rather than the capsule, because `isAllDay` is explicitly false.

**EC-003 — Event with isAllDay = true and no end time**: The "All Day" capsule must be shown regardless of whether an end date/time is present. The end date is irrelevant to the display when `isAllDay` is true.

**EC-004 — Event with isAllDay = true and both start and end times at midnight**: This is the standard backend representation of an all-day event. The "All Day" capsule must be shown (BR-002), and neither the start time nor the end time should be displayed.

**EC-005 — Multiple all-day events viewed in sequence**: Navigating between multiple event detail pages (mixing all-day and timed events) must correctly show the capsule for all-day events and normal time for timed events on each respective page, with no state bleed between events.

---

## 8. Out of Scope

- Changes to the Event Row View (list display) — the `dateString` property and its rendering in `EventRowView` are not modified.
- Changes to the `AllDayEventBannerView` component (the existing banner shown in list/section views).
- Changes to the `BMCalendarEvent.dateString` protocol extension or its all-day heuristic logic.
- Changes to the Firestore data pipeline, backend scraper, or how `isAllDay` is set at the source.
- Android platform (this repository is iOS only).
- Localization of the "All Day" string into languages other than English (noted as NFR-004 consideration).
- Any changes to how events are added to or deleted from the device calendar.
- Changes to the Event Detail Page's description section, buttons section, or toolbar.

---

## 9. Success Metrics

| Metric | Target |
|---|---|
| All-day events on Event Detail Page show "All Day" capsule, not a time value | 100% of all-day events |
| Timed events on Event Detail Page continue to show correct time | 100% of timed events (zero regression) |
| Event list rows unaffected | No visual or functional change in list rows |
| Crash rate on Event Detail Page | No increase from baseline |
| VoiceOver reads "All Day" for the time row of all-day events | 100% compliance |

---

## 10. References

- **Repository**: berkeley-mobile-ios (ASUC OCTO)
- **Affected file — Event Detail View**: `berkeley-mobile/Events/EventDetailView.swift` — `BMDetailHeaderView.timeView` (line 154–158)
- **Event model**: `berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift` — `isAllDay: Bool?` field (line 61)
- **Data source mapping**: `berkeley-mobile/Events/EventDataSource/EventsViewModel.swift` — `BerkeleyEvent.isAllDay` mapped to `BMEventCalendarEntry.isAllDay` (line 67)
- **Existing design pattern reference**: `berkeley-mobile/Events/AllDayEventBannerView.swift` — existing capsule component using the "All Day" label and pill shape
- **Protocol date string**: `berkeley-mobile/Data/ItemProtocols/BMCalendarEvent.swift` — `dateString` computed property with existing all-day heuristic (line 52–55); this is NOT changed but is referenced for context
- **Related issue**: ASOS-8
