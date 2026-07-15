# Business Requirements Specification
## Issue 37: Display "All Day" Indicator Instead of Time on Event Detail Page

**Date**: 2026-07-15  
**Status**: Draft  
**Complexity**: S (Small)

---

## 1. Executive Summary

When a campus event is marked as an all-day event, the Event Detail Page currently displays a misleading time value (e.g., "12:00 AM") in the time row. This specification defines the requirement to replace that misleading time display with a clear "All Day" indicator — styled as a capsule/pill-shaped label — so that users immediately understand the event has no specific start or end time.

---

## 2. Problem Statement

**Current State**: The time row on the Event Detail Page unconditionally renders the event's start time. For all-day events, this start time defaults to 12:00 AM, which is technically a stored placeholder value rather than a meaningful time. Users viewing an all-day event see "12:00 AM" and may be confused about the actual time commitment of the event.

**Desired State**: When an event is flagged as all-day, the time row must display an "All Day" capsule/pill label instead of any time value. This communicates clearly that the event spans the entire day without a specific start or end time.

**Business Impact**: App users — primarily UC Berkeley students checking campus events — receive accurate, non-misleading information. Reducing confusion about event times improves the trustworthiness of the Events feature and prevents missed or misunderstood attendance expectations.

**Urgency**: This is a data-accuracy issue. Displaying a false time value (12:00 AM) actively misleads users and undermines confidence in the app's event information.

---

## 3. Personas & User Stories

### Primary Persona: UC Berkeley Student (App User)
A student browsing campus events to decide which ones to attend.

**User Story**:  
> As a UC Berkeley student viewing the Event Detail Page, I want to see an "All Day" indicator when an event has no specific time, so that I am not misled by a placeholder time value like 12:00 AM.

### Secondary Persona: Event Organizer (Indirect)
Event organizers who publish all-day events (e.g., campus holidays, multi-day exhibits) rely on the app to accurately represent their events to potential attendees.

---

## 4. Business Rules

**BR-001**: An event is considered "all-day" when the event data explicitly marks it as such. The system already determines whether an event qualifies as all-day — this determination is not computed by the detail screen.

> _Note_: The existing event data model contains an `isAllDay` flag on each event entry. The `dateString` computed property also encodes all-day status as the string "All Day" in the time portion. It is an open question which of these two signals the detail view must use as the authoritative source for all-day detection. This must be clarified before implementation.

**BR-002**: When an event is all-day, the time row on the Event Detail Page must display an "All Day" capsule/pill label. No time value (start time, end time, or any placeholder) may be displayed in the time row for an all-day event.

**BR-003**: When an event is not all-day, the time row must display the event's time information exactly as it does today. This change must not alter the display of timed events.

**BR-004**: The "All Day" indicator must be visually distinct from plain text — it must be rendered as a capsule/pill-shaped label to reinforce that it is a status indicator, not a time value.

**BR-005**: The Event Detail Page time row must always be visible when an event has a start date, regardless of whether the event is all-day or timed. The time row must not be hidden for all-day events; only its content changes.

---

## 5. Acceptance Criteria

```gherkin
Feature: All Day Indicator on Event Detail Page

  Background:
    Given the user has opened the Berkeley Mobile app
    And the user has navigated to the Events section

  Scenario: All-day event shows "All Day" capsule instead of time
    Given an event that is marked as all-day
    When the user taps the event to open the Event Detail Page
    Then the time row displays a capsule/pill-shaped "All Day" label
    And no time value (such as "12:00 AM" or any other clock time) is visible in the time row

  Scenario: Timed event continues to show start and end time
    Given an event that has a specific start time and end time
    When the user taps the event to open the Event Detail Page
    Then the time row displays the event's start time and end time
    And no "All Day" indicator is shown in the time row

  Scenario: Timed event with no end time shows only start time
    Given an event that has a specific start time but no end time
    When the user taps the event to open the Event Detail Page
    Then the time row displays the event's start time only
    And no "All Day" indicator is shown in the time row

  Scenario: "All Day" label is visually styled as a capsule/pill
    Given an event that is marked as all-day
    When the user views the Event Detail Page time row
    Then the "All Day" text is enclosed in a capsule/pill-shaped visual container
    And it is visually distinguishable from the surrounding plain text fields (date, location)

  Scenario: All-day event still shows date and location
    Given an event that is marked as all-day and has a date and location
    When the user opens the Event Detail Page
    Then the date row displays the event's date correctly
    And the location row displays the event's location correctly
    And only the time row content changes to the "All Day" indicator
```

---

## 6. Non-Functional Requirements

**NFR-001 — Consistency**: The "All Day" visual style on the Event Detail Page must align with how "All Day" is presented elsewhere in the app (e.g., the existing All Day banner used in the events list) to maintain a coherent user experience.

**NFR-002 — Accessibility**: The "All Day" capsule label must be accessible to screen reader users. The label must convey the same semantic meaning as its visual appearance — that the event has no specific time.

**NFR-003 — Performance**: The change must introduce no perceptible delay in rendering the Event Detail Page. The all-day determination is already available from the event data; no additional data fetch is required.

**NFR-004 — No regression**: All other information on the Event Detail Page (event name, date, location, description, action buttons, calendar add/remove) must continue to display correctly and without visual change for all event types.

---

## 7. Edge Cases & Special Scenarios

**EC-001 — Missing `isAllDay` flag**: If the all-day flag is absent or null on an event that otherwise appears to be all-day (e.g., start time is midnight and end time is 11:59 PM), the system must define which signal takes precedence. _(Open question: see BR-001 note.)_

**EC-002 — All-day event with no location**: When an all-day event has no location, the location row must remain hidden. The "All Day" indicator must still appear correctly in the time row.

**EC-003 — All-day event with no end date**: If an all-day event has no end date specified, the "All Day" indicator must still appear. The indicator represents the all-day nature of the event, not a time range.

**EC-004 — Very long event name**: The "All Day" capsule must render correctly regardless of event name length. The capsule itself does not include the event name — it is a standalone label.

**EC-005 — Non-all-day event with midnight start time**: If a timed event happens to start at exactly 12:00 AM (midnight) but is not flagged as all-day, the time row must display "12:00 AM" as a real time value, not the "All Day" indicator. The all-day indicator must only appear when the event is explicitly flagged as all-day.

---

## 8. Out of Scope

- Changes to the Events list page or calendar view — only the Event Detail Page time row is in scope.
- Changes to how all-day events are determined, stored, or provided by the data source.
- Adding an "All Day" indicator to the event row/card in the events list (a separate initiative if desired).
- Changes to how timed events display their time information.
- Any modification to event creation, editing, or data management flows.
- Push notifications or calendar integration behavior for all-day events.

---

## 9. Success Metrics

- **SM-001**: 100% of all-day events on the Event Detail Page show the "All Day" capsule label instead of a time value.
- **SM-002**: 0% of timed events on the Event Detail Page show the "All Day" capsule label.
- **SM-003**: No regression reports from QA or users regarding the date, location, description, or action button display on any event type.
- **SM-004**: The "All Day" label passes accessibility audit — screen readers announce it meaningfully.

---

## 10. References

- Related existing component: `AllDayEventBannerView` — an existing "All Day" capsule-style component already used in the app for displaying all-day events in the event list banner. The visual style of the indicator on the detail page should be consistent with or inspired by this component.
- Event data model: The event entry already carries an `isAllDay` flag and the existing `dateString` computed property already encodes "All Day" as the time portion for qualifying events. The authoritative signal to use in the detail view must be confirmed.
- Issue: [Events Page] Display (All Day) Indicator Instead of Time on Event Detail Page
