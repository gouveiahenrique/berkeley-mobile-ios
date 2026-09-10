# Business Requirements: Display "All Day" Indicator on Event Detail Page

**Issue Key**: ASDLC-517  
**Date**: 2026-09-10  
**Complexity**: S (Small)

---

## 1. Executive Summary

When a campus event is designated as an all-day event, the Event Detail Page incorrectly displays a time value (12:00 AM) in the time row, which is misleading to users. This feature replaces that misleading time value with a clearly labeled "All Day" capsule/badge indicator, ensuring users receive accurate event scheduling information.

---

## 2. Problem Statement

**Current State**: The Event Detail Page always renders a time value in the time row, regardless of whether the event spans a full day. All-day events display "12:00 AM" — a technically derived default that has no meaningful scheduling significance and actively misleads users into believing the event has a specific start time.

**Desired State**: When an event is marked as all-day, the time row must display a visually distinct "All Day" capsule/badge indicator in place of any time value. The indicator must immediately communicate that no specific start or end time applies to the event.

**Business Impact**: Users relying on the app to plan attendance at campus events may be confused or misinformed by a "12:00 AM" time on an all-day event (e.g., a holiday, an exhibit open all day, a multi-day enrollment period). Accurate display of scheduling information is fundamental to the app's usefulness.

**Urgency**: The current behavior is actively incorrect and degrades user trust in event scheduling information. No new feature development is blocked on this; it is a correctness fix.

---

## 3. Personas & User Stories

### Persona 1: Student Event Attendee
A UC Berkeley student using the app to browse and plan attendance at campus events, club activities, and academic calendar dates.

- **Need**: To immediately understand whether an event has a fixed time or spans the entire day.
- **Pain Point**: Seeing "12:00 AM" on an all-day event (e.g., a holiday or campus exhibit day) causes confusion and erodes confidence in the app's accuracy.
- **Goal**: Glance at the Event Detail Page and instantly know that no specific arrival time is required.

**User Story**: As a student browsing campus events, when I open the detail page for an all-day event, I want to see a clear "All Day" indicator in the time row so that I know no specific time applies and I do not need to arrive at a particular hour.

### Persona 2: Faculty / Staff Event Organizer
A campus staff member who creates or manages calendar entries (e.g., enrollment deadlines, exhibit days, holiday closures) that span entire days.

- **Need**: Confidence that the information they enter as "all day" is faithfully displayed to attendees.
- **Goal**: The app correctly surfaces the all-day nature of the event without any misleading time values.

**User Story**: As an event organizer who marks events as all-day, I want the mobile app to display "All Day" on the Event Detail Page so that attendees receive the same information I intended when creating the event.

---

## 4. Business Rules

**BR-001**: When an event is designated as all-day, the time row on the Event Detail Page must display an "All Day" capsule/badge label and must not display any clock time (e.g., "12:00 AM", "11:59 PM").

**BR-002**: The "All Day" indicator must be visually distinct from a standard time value — it must use a capsule/pill shape so users can recognize at a glance that the row communicates a scheduling category, not a specific time.

**BR-003**: An event is considered all-day if the system marks it as all-day. The system provides the all-day designation; the display layer must reflect it faithfully without re-deriving or overriding the designation.

**BR-004**: The "All Day" indicator must appear in the same time row position where a time value is shown for non-all-day events, so the visual layout of the Event Detail Page remains consistent.

**BR-005**: For non-all-day events, the time row must continue to display the event's start time (and end time where available) exactly as it does today — this change must not affect the display of timed events.

**BR-006**: The "All Day" indicator must display only the label "All Day" — it must not include the event name, date, or any other event metadata (the event name is already displayed prominently in the header).

**BR-007**: The clock icon associated with the time row must remain visible alongside the "All Day" capsule, preserving the visual consistency of the detail row layout (icon + content).

---

## 5. Acceptance Criteria

```gherkin
Feature: All Day Indicator on Event Detail Page

  Scenario: All-day event shows "All Day" capsule instead of time
    Given a user opens the Event Detail Page for an event marked as all-day
    When the time row renders
    Then the time row displays a capsule/badge labeled "All Day"
    And no clock time value (e.g., "12:00 AM") is visible in the time row
    And the clock icon is visible alongside the "All Day" capsule

  Scenario: Timed event still shows time value
    Given a user opens the Event Detail Page for an event that has a specific start time
    When the time row renders
    Then the time row displays the event's start time
    And the end time is displayed if the event has one
    And no "All Day" capsule is shown

  Scenario: Timed event with end time shows time range
    Given a user opens the Event Detail Page for an event with both a start time and an end time
    When the time row renders
    Then the time row displays both the start time and end time as a range (e.g., "9:00 AM - 5:00 PM")
    And no "All Day" capsule is shown

  Scenario: All-day event detail page layout is consistent with timed event
    Given a user views the Event Detail Page for both an all-day event and a timed event
    When comparing the time row position in both views
    Then both time rows occupy the same position in the event header
    And the date row and location row are unaffected by the time row change

  Scenario: All Day capsule does not include event name
    Given a user opens the Event Detail Page for an all-day event
    When the time row renders
    Then the "All Day" capsule displays only the text "All Day"
    And the event name does not appear inside the capsule
```

---

## 6. Non-Functional Requirements

**Performance**: The change in display logic must not introduce any perceptible rendering delay. The time row must render as fast as the current implementation.

**Accessibility**: The "All Day" capsule must be readable by screen readers and must convey the same meaning as its visual label (i.e., assistive technologies must announce "All Day" when focusing the time row of an all-day event).

**Visual Consistency**: The "All Day" capsule styling must be consistent with the existing visual language used in the app for all-day event indicators elsewhere (the app already uses a capsule/pill shape for this purpose in other views).

**Maintainability**: The all-day detection logic must rely on the event's authoritative all-day designation provided by the system — it must not introduce a secondary, divergent detection heuristic.

---

## 7. Edge Cases & Special Scenarios

**Edge Case 1 — All-day event with no end date**: If an all-day event has a start date but no end date, the time row must still show the "All Day" capsule, not a time value.

**Edge Case 2 — All-day designation vs. derived time detection**: The system determines whether an event is all-day. If an event's stored time components happen to match midnight (00:00) but the event is NOT designated as all-day, the time row must display the time value (12:00 AM), not the "All Day" capsule. The capsule must only appear when the event is explicitly designated as all-day.

**Edge Case 3 — Missing or nil all-day flag**: If the all-day designation is absent or indeterminate (e.g., data not yet loaded), the time row must default to displaying the time value rather than the "All Day" capsule.

**Edge Case 4 — Multi-day events**: If an event spans multiple days but is not designated as all-day, the time row must display the start time. The "All Day" indicator applies only to events explicitly marked as all-day; span length alone does not trigger it.

---

## 8. Out of Scope

- Changes to the Events list view, calendar view, or any other screen — only the Event Detail Page time row is in scope.
- Changes to how all-day events are created, edited, or stored — only the display is in scope.
- Changes to the date row or location row on the Event Detail Page.
- Adding a new visual component type that doesn't already exist in the app's design vocabulary — the capsule/pill shape is already established in the app.
- Changes to how all-day events are added to the user's device calendar (the "Add to Calendar" action is unaffected).
- Changes to event list rows (`EventRowView`) or the calendar section banner view (`AllDayEventBannerView`) used in the events list — those are separate views with separate display concerns.
- Localization or internationalization of the "All Day" label beyond the existing app standard.

---

## 9. Success Metrics

1. **Zero misleading time values**: After this change, 100% of all-day event detail pages must show "All Day" in the time row and 0% must show a clock time value.
2. **Zero regressions on timed events**: 100% of timed event detail pages must continue to show the correct time value (verified by existing event data with specific start times).
3. **User comprehension**: The "All Day" indicator is immediately recognizable as a scheduling category label, not a time (validated through visual review against the existing capsule design pattern used elsewhere in the app).

---

## 10. References

- **Issue**: ASDLC-517 — [Events Page] Display (All Day) Indicator Instead of Time on Event Detail Page
- **Repository**: berkeley-mobile-ios
- **Related Views**: Event Detail Page (header info section, time row)
- **Existing Pattern**: The app already uses a capsule/pill all-day indicator in the events list view — this feature brings the Event Detail Page into alignment with that established pattern.
- **All-day event data**: The `BMEventCalendarEntry` model includes an explicit all-day designation field provided by the backend. The system also includes a time-component-based heuristic in the shared date formatting logic; this issue should be resolved using the authoritative designation rather than solely the heuristic, as the heuristic does not cover all cases (see Edge Case 2 above).

**Open Question — Responsibility boundary (must be resolved before implementation)**:  
The event model has both an explicit all-day designation from the backend AND a time-component-based heuristic in the shared date formatting logic. It is unclear whether the two always agree, and which should be the authoritative source for driving the "All Day" capsule display on the detail page. The tech lead must confirm: should the detail page use the explicit designation, the heuristic, or a combination (e.g., either flag triggers the capsule)?
