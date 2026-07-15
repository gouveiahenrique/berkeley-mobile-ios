# Business Requirements Specification
## ASOS-9: [Events Page] Display "All Day" Indicator Instead of Time on Event Detail Page

**Issue Key**: ASOS-9  
**Date**: 2026-07-15  
**Status**: Draft

---

## 1. Executive Summary

The Event Detail Page currently shows a misleading time value (e.g., "12:00 AM") in the time row for events that are designated as all-day events. This change requires the time row to display a clearly distinguishable "All Day" indicator — styled as a pill/capsule badge — whenever an event is marked as spanning the entire day, replacing the erroneous time display.

---

## 2. Problem Statement

**Current State**  
When a user opens the Event Detail Page for an all-day event, the time row displays a time value such as "12:00 AM". This occurs because the time display logic does not distinguish between all-day events and timed events when rendering the detail header; it always shows a time regardless of event type.

**Desired State**  
When a user opens the Event Detail Page for an all-day event, the time row must display an "All Day" indicator (pill/capsule label) instead of any time value. Timed events must continue to display their start and end times as before.

**Business Impact**  
- App users are confused or misled about the nature of all-day events.
- Displaying "12:00 AM" implies a specific start time that does not exist, which may cause users to misread their schedules or miss events they assumed were time-specific.
- Correcting this improves the accuracy and trustworthiness of the Events feature for the student community relying on the Berkeley Mobile app.

**Urgency**  
The current behavior is actively incorrect for a defined class of events. Any all-day event displayed in the app currently presents false information to the user. This is a data accuracy defect with user-facing impact.

---

## 3. Personas & User Stories

**Primary Persona: Berkeley Student / App User**  
- A student browsing upcoming campus events and academic calendar entries.
- Needs to quickly understand whether an event has a specific time slot or occupies the entire day.
- Pain point: Sees "12:00 AM" on an all-day event and is uncertain whether to attend at midnight or whether the event has no fixed time.

**Secondary Persona: Event Organizer / University Administrator**  
- Creates events in the upstream system and marks certain events as "All Day" (e.g., university holidays, multi-day exhibits, enrollment windows).
- Expects the mobile app to faithfully represent their event metadata to students.

**User Stories**

- As a student, I want to see a clear "All Day" label on the Event Detail Page for all-day events, so that I immediately know no specific time applies and I do not try to attend at a fixed hour.
- As an event organizer, I want my all-day events to display correctly on the Event Detail Page, so that students understand the event spans the full day without confusion.

---

## 4. Business Rules

**BR-001**: An event is considered "All Day" when the upstream data source explicitly marks it as an all-day event (via the `isAllDay` flag provided by the backend) OR when the event's time data meets the established all-day detection criteria (start at midnight, end at 11:59:59 PM).

> **Open Question OQ-001**: The event data model contains two signals for all-day status: an explicit `isAllDay` boolean flag from the backend, and a time-based detection heuristic (start = 00:00:00, end = 23:59:59). It is unclear which signal is authoritative. The business requirement must clarify: should the "All Day" indicator be driven solely by the explicit flag, solely by the time heuristic, or by either? This must be resolved before implementation to avoid inconsistent behavior.

**BR-002**: When an event is determined to be "All Day" (per BR-001), the time row on the Event Detail Page must display an "All Day" indicator label and must NOT display any time value (no start time, no end time, no range).

**BR-003**: When an event is NOT "All Day", the time row on the Event Detail Page must display the event's start time and, if an end time exists, the end time range. This behavior must remain unchanged from the current implementation.

**BR-004**: The "All Day" indicator must be visually distinct from plain text — it must be rendered as a pill/capsule-shaped label to clearly communicate its meaning at a glance.

**BR-005**: The "All Day" indicator must use the text "All Day" as its label. No abbreviations or alternative labels are permitted.

**BR-006**: The time row must always be visible on the Event Detail Page when the event has either a time value or an all-day designation. The row must not be hidden or omitted for all-day events.

---

## 5. Acceptance Criteria

```gherkin
Feature: All Day Indicator on Event Detail Page

  Background:
    Given the user has opened the Berkeley Mobile app
    And the user navigates to the Events section

  Scenario: All-day event displays "All Day" indicator instead of time
    Given an event that is marked as an all-day event
    When the user taps on the event to open the Event Detail Page
    Then the time row displays a pill/capsule-shaped "All Day" label
    And the time row does NOT display any time value (e.g., "12:00 AM")
    And the date row continues to display the event date as usual

  Scenario: Timed event continues to display start and end time
    Given an event that has a specific start time and end time
    And the event is NOT marked as an all-day event
    When the user taps on the event to open the Event Detail Page
    Then the time row displays the event's start time
    And the time row displays the event's end time
    And no "All Day" label is shown

  Scenario: Timed event with no end time displays only start time
    Given an event that has a specific start time and no end time
    And the event is NOT marked as an all-day event
    When the user taps on the event to open the Event Detail Page
    Then the time row displays the event's start time only
    And no "All Day" label is shown

  Scenario: Time row is always present for all-day events
    Given an event that is marked as an all-day event
    When the user taps on the event to open the Event Detail Page
    Then the time row is visible in the Event Detail Page header
    And the time row contains the "All Day" label

  Scenario: "All Day" label is visually styled as a pill/capsule
    Given an event that is marked as an all-day event
    When the user views the Event Detail Page
    Then the "All Day" text is enclosed in a pill/capsule-shaped visual container
    And the label is visually distinguishable from plain text fields on the page

  Scenario: All-day event appearing as "Today" still shows "All Day" indicator
    Given an all-day event whose date is today
    When the user taps on the event to open the Event Detail Page
    Then the date row displays "Today"
    And the time row displays the "All Day" pill/capsule label
    And no time value is shown

  Scenario: All-day event appearing as "Tomorrow" still shows "All Day" indicator
    Given an all-day event whose date is tomorrow
    When the user taps on the event to open the Event Detail Page
    Then the date row displays "Tomorrow"
    And the time row displays the "All Day" pill/capsule label
    And no time value is shown
```

---

## 6. Non-Functional Requirements

**Performance**  
- The "All Day" indicator must render within the same time as the rest of the Event Detail Page header with no perceptible additional delay.

**Accessibility**  
- The "All Day" label must be readable by screen readers as "All Day" — the visual pill/capsule shape must not interfere with accessibility text representation.
- Contrast between the label text and the capsule background must meet standard accessibility contrast requirements.

**Consistency**  
- The visual style of the "All Day" pill on the Event Detail Page must be consistent with the existing "All Day" banner style used elsewhere in the app (the app already contains an all-day event banner component used in the calendar/list view). Reuse of the existing design language is expected.

**Reliability**  
- The display logic must handle the case where all-day status is indeterminate (e.g., the `isAllDay` flag is absent/null and the time heuristic does not apply) — in this case the event must be treated as timed and display the time value. No crash or blank row is acceptable.

---

## 7. Edge Cases & Special Scenarios

**EC-001: Missing or null `isAllDay` flag**  
If the all-day flag is absent or null from the event data, the system must fall back to the time-based heuristic (BR-001). If neither signal is available, the event must be treated as timed and display the start time as-is. The time row must never be blank.

**EC-002: All-day event with no end time**  
If an all-day event has a start date/time but no end date/time on record, the "All Day" indicator must still be shown based on the available signal (flag or start-time heuristic). The absence of an end time does not override the all-day designation.

**EC-003: Event whose start time is midnight but is NOT an all-day event**  
An event with a midnight start that is explicitly NOT flagged as all-day (e.g., a midnight vigil or late-night event) must display its actual start time, not the "All Day" label. The explicit flag, if present, takes precedence over the time heuristic.

> This edge case is tied to **OQ-001** — the resolution of which signal is authoritative will determine the correct behavior here.

**EC-004: All-day multi-day event**  
If an event spans multiple days and is marked as all-day, the date row must display the appropriate date (or date range per existing date string logic) and the time row must still display only the "All Day" label — no start/end times.

**EC-005: Very long event name or location alongside "All Day" label**  
The "All Day" pill must render correctly and not be clipped or overflow when other detail fields (event name, location) contain long text. The pill must maintain its intended shape and be fully visible.

---

## 8. Out of Scope

- Changes to how all-day events are displayed in the Events list view or calendar grid view — only the Event Detail Page time row is in scope.
- Changes to the backend data model or how events are created/marked as all-day — the upstream all-day designation is accepted as-is.
- Adding new filtering or sorting by all-day status in the Events list.
- Modifying the date row display logic — only the time row is affected.
- Changes to the "Learn More" or "Register" button behavior.
- Changes to the event description, location, or image display.
- Adding an "All Day" indicator to the event row cards in the list view (a separate initiative if desired).
- Push notification or calendar integration changes related to all-day event times.

---

## 9. Success Metrics

| Metric | Target |
|---|---|
| All-day events showing "12:00 AM" in time row | 0 occurrences after release |
| All-day events correctly showing "All Day" pill | 100% of all-day events on Event Detail Page |
| Timed events incorrectly showing "All Day" pill | 0 occurrences after release |
| Regression: timed event time display broken | 0 regressions |
| Crash or blank time row for any event type | 0 occurrences |

---

## 10. Open Questions

| ID | Question | Impact | Owner |
|---|---|---|---|
| OQ-001 | Which all-day signal is authoritative: the explicit `isAllDay` flag from the backend, or the time-based heuristic (midnight start / 11:59 PM end)? Should both be checked? | Determines BR-001 behavior and EC-003 resolution | Product / Engineering |

---

## 11. References

- Issue: ASOS-9 — [Events Page] Display (All Day) Indicator Instead of Time on Event Detail Page
- Repository: berkeley-mobile-ios (ASUC OCTO)
- Related component: `AllDayEventBannerView` — existing all-day banner used in calendar/list views; design language should be consistent
- Related data model: `BMCalendarEvent` protocol — contains the `dateString` computed property with existing all-day detection heuristic
- Related data model: `BMEventCalendarEntry` — contains the `isAllDay: Bool?` flag from the backend
