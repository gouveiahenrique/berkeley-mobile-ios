# Business Requirements Specification
## TDLOKI-222 — Events Page: Display "All Day" Indicator Instead of Time on Event Detail Page

**Version**: 1.0  
**Date**: 2026-07-14  
**Status**: Draft  
**Workflow**: workflow-asos-ado  
**Repository**: berkeley-mobile-ios  

---

## 1. Executive Summary

The Berkeley Mobile iOS application includes an Events feature that displays campus events with a dedicated Event Detail Page. When an event is designated as an All Day event, the time row on the Event Detail Page currently renders a misleading time value (e.g., "12:00 AM") instead of a meaningful indicator. This defect creates a confusing user experience because all-day events have no specific start or end time, yet the UI presents one.

This specification defines the required behavior change: the time row must display an "All Day" capsule/pill-shaped label whenever an event is marked as all-day, replacing the erroneous time value entirely.

This is a mobile-only UI defect fix with no backend or data-layer changes required. The `isAllDay` flag and the logic for determining all-day status from event date components already exist in the codebase.

---

## 2. Problem Statement

### Current State
- When a user opens the Event Detail Page for an all-day event, the time row in the event header card displays "12:00 AM" (the default midnight timestamp associated with all-day event storage conventions).
- The existing `dateString` computed property on the `BMCalendarEvent` protocol correctly detects all-day events and returns an "All Day" string in the combined date/time field. However, `EventDetailView` splits this string on " / " and uses only the last component as the time value. When the time portion is "All Day" (as returned by the protocol logic), this should work — but there is evidence that when `isAllDay` is set on the event model and the time components do not exactly match the sentinel values (start at 00:00:00, end at 23:59:59), the fallback time "12:00 AM" is shown instead.
- There is also no visual distinction for the "All Day" state in the time row — it renders the same `EventDetailRow` text component used for regular times, with no capsule or badge styling.

### Desired State
- When an event is an all-day event, the time row displays a visually distinct "All Day" capsule/pill label instead of a time string.
- The capsule must be clearly legible and recognizable as a status badge, consistent with the existing `AllDayEventBannerView` capsule styling already used elsewhere in the Events feature.
- Timed events are unaffected and continue to display their formatted time range as before.

### Impact
- **Users affected**: All Berkeley Mobile app users who view all-day event details (e.g., holidays, enrollment deadlines, academic calendar events).
- **Cost of inaction**: Users see misleading time information (12:00 AM), which erodes trust in the app's data accuracy and may cause confusion about whether an event requires attendance at a specific time.

---

## 3. Personas & User Stories

### Primary Persona: Berkeley Mobile App User (Student, Faculty, Staff)
A person using the Berkeley Mobile iOS app to browse and track campus events, deadlines, and academic calendar items. They rely on the Event Detail Page to understand when and where an event occurs and whether they need to be present at a specific time.

**User Story**:  
> As a Berkeley Mobile user, when I open the detail page for an all-day event (such as a campus holiday or enrollment deadline), I want to see an "All Day" indicator in the time row instead of a misleading time like "12:00 AM", so that I can immediately understand the event spans the entire day and requires no specific arrival time.

### Secondary Persona: Event Content Manager (ASUC OCTO)
An administrator who creates and publishes events to the Berkeley events feed. They mark events as all-day in the source system and expect the app to faithfully represent that designation.

**User Story**:  
> As an event content manager, when I publish an all-day event, I want the mobile app to display an "All Day" badge on the detail page so that the event's all-day nature is accurately communicated to app users.

---

## 4. Scope

### In Scope
- Modifying the time row display in the Event Detail Page (`EventDetailView` / `BMDetailHeaderView`) to render an "All Day" capsule label for all-day events.
- Determining all-day status using the existing `isAllDay` flag on the event model OR the existing date-component sentinel logic (start at 00:00:00, end at 23:59:59) — whichever is more reliably populated from the data source.
- Consistent styling of the "All Day" capsule with the existing `AllDayEventBannerView` visual language (capsule shape, muted/gray fill).

### Out of Scope
- Changes to the backend API or event data model.
- Changes to how all-day events are created, edited, or stored.
- Changes to the event list view (`EventRowView`, `EventsView`).
- Changes to the `AllDayEventBannerView` used in the calendar/list context.
- Changes to the date row (the row showing the event date).
- Android platform (this is an iOS-specific repository).
- Localization of the "All Day" label (future concern; English only for this issue).

### Dependencies
- The `isAllDay` Boolean field must be reliably set on `BMEventCalendarEntry` instances returned from the data source. If `isAllDay` is `nil` or inconsistently populated, the system falls back to evaluating whether start time is 00:00:00 and end time is 23:59:59.
- No backend changes are required; this is a display-layer fix.

---

## 5. Business Rules

**BR-001**: When an event's `isAllDay` property is `true`, the time row on the Event Detail Page **must** display an "All Day" capsule label. No time string (start time, end time, or range) is displayed in this row.

**BR-002**: When an event's `isAllDay` property is `false` or `nil`, the system **must** evaluate whether the event qualifies as all-day based on date-component sentinel values: start time equals 00:00:00 and end time equals 23:59:59. If both conditions are met, the event is treated as all-day and BR-001 applies.

**BR-003**: When an event does not meet the all-day criteria (BR-001 or BR-002), the time row **must** display the formatted time range using the event's start time and, if present, end time (e.g., "10:00 AM - 11:30 AM"). If only start time is present, display start time only.

**BR-004**: The "All Day" label **must** be rendered as a capsule/pill-shaped visual element (not plain text) to visually distinguish it from a regular time string.

**BR-005**: The capsule styling **must** be visually consistent with the existing "All Day" capsule component used in the Events feature (muted/gray semi-transparent fill, rounded pill shape). The exact dimensions may be adapted to fit within the detail header card layout.

**BR-006**: The clock icon (system image "clock") **must** remain visible in the time row regardless of whether the event is all-day or timed, to maintain visual consistency in the header layout.

**BR-007**: The time row **must** always appear in the header card when either a time value or an all-day state exists. The row must not be hidden for all-day events.

**BR-008**: If `isAllDay` is `nil` and the date-component sentinel values are also not satisfied (i.e., the event has an indeterminate all-day status), the system **must** fall back to displaying the start time as a regular timed event (BR-003 behavior).

---

## 6. Acceptance Criteria

### Scenario 1: All-Day Event via `isAllDay` Flag [MOBILE]

```gherkin
Given a user opens the Event Detail Page for an event
And the event's isAllDay property is true
When the event header card is displayed
Then the time row shows the clock icon
And the time row shows an "All Day" capsule/pill label
And the time row does NOT show any time string (e.g., "12:00 AM", "All Day" as plain text)
```

### Scenario 2: All-Day Event via Sentinel Date Components (isAllDay nil or false) [MOBILE]

```gherkin
Given a user opens the Event Detail Page for an event
And the event's isAllDay property is nil or false
And the event's start time components are hour=0, minute=0, second=0
And the event's end time components are hour=23, minute=59, second=59
When the event header card is displayed
Then the time row shows the clock icon
And the time row shows an "All Day" capsule/pill label
And the time row does NOT show any time string
```

### Scenario 3: Timed Event [MOBILE]

```gherkin
Given a user opens the Event Detail Page for an event
And the event is NOT an all-day event
And the event has a start time of "10:00 AM" and end time of "11:30 AM"
When the event header card is displayed
Then the time row shows the clock icon
And the time row shows the text "10:00 AM - 11:30 AM"
And the time row does NOT show an "All Day" capsule
```

### Scenario 4: Timed Event with No End Time [MOBILE]

```gherkin
Given a user opens the Event Detail Page for an event
And the event is NOT an all-day event
And the event has a start time of "2:00 PM" and no end time
When the event header card is displayed
Then the time row shows the clock icon
And the time row shows the text "2:00 PM"
And no end time is displayed
And the time row does NOT show an "All Day" capsule
```

### Scenario 5: Capsule Visual Appearance [MOBILE]

```gherkin
Given an all-day event detail page is displayed
When the user views the time row
Then the "All Day" label is rendered inside a capsule-shaped container
And the capsule has a muted/gray semi-transparent background fill
And the label text reads exactly "All Day"
And the capsule is legible against both light and dark mode backgrounds
```

### Scenario 6: Regression — Previously Correct Timed Events Unaffected [MOBILE]

```gherkin
Given a user views the Event Detail Page for multiple events of different types
When any timed event (non-all-day) is viewed
Then the time row displays only the formatted time range
And no "All Day" capsule appears for timed events
And the date row is unaffected for all event types
And the location row is unaffected for all event types
```

---

## 7. Non-Functional Requirements

### 7.1 Performance
- The all-day determination logic (flag check or date-component evaluation) **must** complete synchronously with no perceptible latency; it is a local computation on already-loaded event data.
- The Event Detail Page **must** render within the existing performance envelope — no new network calls or async operations are introduced by this change.

### 7.2 Accessibility
- The "All Day" capsule **must** be accessible to VoiceOver users. The accessibility label for the time row when showing the capsule **must** read "All Day" (not describe the visual shape).
- Color contrast of the capsule label text against the capsule background **must** meet WCAG AA minimum contrast ratio (4.5:1).

### 7.3 Visual Consistency
- The capsule appearance **must** adapt to system light/dark mode without hardcoded colors.
- The capsule **must** not overflow or clip within the event header card on standard iOS device sizes (iPhone SE through iPhone Pro Max).

### 7.4 Compatibility
- The fix **must** be compatible with iOS 16 and above (the app's minimum deployment target).
- The fix **must** not affect any other screen that displays event information (list views, calendar view, row view).

---

## 8. Edge Cases & Special Scenarios

| Scenario | Expected Behavior |
|---|---|
| Event where `isAllDay` is `true` but start time is NOT midnight | Display "All Day" capsule (flag takes precedence over time components) |
| Event where `isAllDay` is `nil` and end date is also `nil` | Evaluate only start time components; if start is midnight treat as ambiguous — fall back to displaying start time as timed event per BR-008 |
| Event where start and end are both midnight (00:00:00) | Does not match sentinel values (end must be 23:59:59); display "12:00 AM" as a timed event |
| `dateString` already returns "All Day" as the time component | The split-string approach must still apply capsule styling, not display "All Day" as plain text |
| Very long event name on header card | Capsule must not be pushed off-screen; layout must handle text truncation in the event name field, not in the time row |
| Dark mode display | Capsule background opacity and text color must remain legible |

---

## 9. Out of Scope

- Changes to the backend API, event feed, or data ingestion layer.
- Changes to how events are created or edited.
- Localization / internationalization of the "All Day" string.
- Display changes on the event list screen (`EventsView`, `EventRowView`).
- Changes to the `AllDayEventBannerView` calendar list component.
- Push notification content for all-day events.
- Android / cross-platform considerations.
- Adding an "All Day" toggle in any event creation or editing flow.

---

## 10. Success Metrics

| Metric | Target |
|---|---|
| Zero reports of "12:00 AM" shown on all-day event detail pages post-release | 100% elimination of the defect |
| All-day events from the Berkeley events feed correctly display the capsule | Verified for all event types: Holiday, Enrollment, Default |
| No regression in timed event time display | All timed event detail pages show correct formatted time range |
| Capsule renders correctly on iPhone SE (smallest supported) and iPhone Pro Max (largest) | Visual verification on both device sizes |
| VoiceOver reads "All Day" (not capsule shape description) when focusing the time row | Accessibility audit pass |

---

## 11. References

- **Related source files**:
  - `berkeley-mobile/Events/EventDetailView.swift` — contains `BMDetailHeaderView.timeView` (defect location)
  - `berkeley-mobile/Data/ItemProtocols/BMCalendarEvent.swift` — contains `dateString` computed property with all-day detection logic
  - `berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift` — contains `isAllDay: Bool?` field
  - `berkeley-mobile/Events/AllDayEventBannerView.swift` — existing capsule component for visual reference/reuse
- **Issue**: TDLOKI-222
- **Workflow**: workflow-asos-ado
- **Repository**: https://github.com/gouveiahenrique/berkeley-mobile-ios
