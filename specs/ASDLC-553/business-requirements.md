# Business Requirements Specification
## ASDLC-553: Display "All Day" Indicator Instead of Time on Event Detail Page

**Issue Key**: ASDLC-553  
**Date**: 2026-09-29  
**Status**: Draft  
**Complexity**: S (Small)

---

## 1. Executive Summary

When a campus event is designated as an all-day event, the Event Detail Page incorrectly displays a time value (e.g., "12:00 AM") in the time row, which is misleading because no specific start or end time applies to all-day events. The time row must instead display a visually distinct "All Day" indicator — styled as a capsule/pill-shaped label — so that users immediately understand the event spans the entire day without a specific scheduled time.

---

## 2. Problem Statement

**Current State**: The Event Detail Page always renders a time value in the time row, regardless of whether the event is an all-day event. For all-day events, this results in displaying "12:00 AM" (or another default time artifact), which is factually incorrect and confusing to users.

**Desired State**: When an event is flagged as an all-day event, the time row on the Event Detail Page must display a clearly styled "All Day" capsule/badge label instead of any time value. The date row continues to display normally.

**Business Impact**:
- Users currently receive inaccurate scheduling information, which can lead to confusion about whether an event has a specific time or not.
- Showing an accurate "All Day" indicator improves trust in the event information and reduces user confusion.
- This aligns the Event Detail Page with the system's existing "All Day" detection and display capabilities already present elsewhere in the app.

**Urgency**: The current behavior actively misleads users about event scheduling. Any user viewing an all-day event on the detail page sees incorrect information.

---

## 3. Personas & User Stories

### Primary Persona: Berkeley Mobile App User (Student / Staff / Faculty)

**Needs**: Accurate, at-a-glance event details when browsing campus events.  
**Pain Points**: Seeing "12:00 AM" on an all-day event suggests there is a specific time, which is confusing and may cause users to miss or misinterpret the event.  
**Goal**: Quickly understand the nature and timing of any campus event from the detail page.

**User Stories**:

- As a student viewing an all-day campus event, I want the Event Detail Page to clearly show "All Day" in place of a time, so that I understand no specific time slot is required.
- As a user browsing campus events, I want consistent and accurate time information on the Event Detail Page so that I can plan my schedule correctly.

---

## 4. Business Rules

**BR-001**: When an event is designated as an all-day event, the time row on the Event Detail Page must display an "All Day" capsule/pill label instead of any time value.

**BR-002**: The "All Day" indicator must be visually distinct from a standard time display (e.g., styled as a capsule or pill shape) so that users immediately recognize it as a special designation rather than a time.

**BR-003**: The date row on the Event Detail Page must continue to display the event date normally, unaffected by the all-day designation.

**BR-004**: When an event is NOT designated as an all-day event, the time row must continue to display the event start time and, if available, the end time — existing behavior must not be changed for timed events.

**BR-005**: An event is considered "all-day" when the system's all-day flag for that event is set to true. The system is responsible for determining this designation; the Event Detail Page must respect and display it accordingly.

**BR-006**: The "All Day" indicator must display the label text "All Day".

---

## 5. Acceptance Criteria

```gherkin
Feature: All Day Indicator on Event Detail Page

  Scenario: All-day event displays "All Day" capsule in the time row
    Given an event is designated as an all-day event
    When a user navigates to the Event Detail Page for that event
    Then the time row must display an "All Day" capsule/pill-shaped label
    And no time value (e.g., "12:00 AM") must appear in the time row
    And the date row must display the event date normally

  Scenario: Timed event continues to display start and end time
    Given an event is NOT designated as an all-day event
    And the event has a defined start time
    When a user navigates to the Event Detail Page for that event
    Then the time row must display the event start time
    And if an end time exists, the time row must also display the end time
    And the "All Day" capsule/pill label must not appear

  Scenario: Timed event with no end time displays only start time
    Given an event is NOT designated as an all-day event
    And the event has a defined start time but no end time
    When a user navigates to the Event Detail Page for that event
    Then the time row must display only the event start time
    And no end time is shown
    And the "All Day" capsule/pill label must not appear

  Scenario: All-day event with no end date specified
    Given an event is designated as an all-day event
    And the event has no end date defined
    When a user navigates to the Event Detail Page for that event
    Then the time row must still display the "All Day" capsule/pill-shaped label
    And no time value must appear in the time row

  Scenario: All-day indicator is visually distinct
    Given an all-day event is displayed on the Event Detail Page
    When a user views the time row
    Then the "All Day" label must be styled as a capsule or pill shape
    And the capsule/pill must be visually distinguishable from a plain text time display
```

---

## 6. Non-Functional Requirements

**Accessibility**: The "All Day" capsule must be readable by screen readers with an accessible label of "All Day".

**Visual Consistency**: The "All Day" capsule/pill styling must be consistent with existing pill-shaped labels used elsewhere in the app (an existing "All Day" pill component is already present in the app and must be reused or referenced for consistency).

**No Regression**: Changes must not affect the display of timed events on the Event Detail Page or any other screen in the app.

**Performance**: This change involves only conditional display logic; no additional network calls or data fetching are introduced.

---

## 7. Edge Cases & Special Scenarios

| Scenario | Expected Behavior |
|---|---|
| Event has `isAllDay = true` but start/end times are non-standard | Must display "All Day" capsule; the all-day flag is authoritative |
| Event has `isAllDay = false` or flag is absent | Must display time value as currently; no "All Day" label shown |
| Event has `isAllDay = true` and no location | "All Day" capsule shown; location row remains hidden (existing behavior) |
| Event has `isAllDay = true` and no end date | "All Day" capsule shown; no end time shown |
| Time row content changes between "All Day" and a time value for different events | Each event detail page renders the correct state independently |

**Open Question**: The system currently has two mechanisms that may indicate an all-day event: (1) a boolean `isAllDay` flag on the event object, and (2) a time-based heuristic that checks if start is 00:00:00 and end is 23:59:59. It must be confirmed which mechanism is authoritative for determining all-day status on the Event Detail Page. If the `isAllDay` flag is authoritative, the time-based heuristic must not override it. This must be resolved before implementation begins to ensure correct behavior.

---

## 8. Out of Scope

- Changes to the Events list/browse page (EventRowView) or calendar view — this change applies only to the Event Detail Page.
- Changes to how all-day events are created, edited, or sourced from the backend.
- Any changes to the event date row display logic.
- Adding any new "All Day" banner or notification to the list view.
- Changes to the color, font, or theme of existing event list row items.
- Any modification to how the app adds events to the user's device calendar.
- Changes to the definition or detection logic of what constitutes an "all-day" event (the `isAllDay` flag resolution is for clarification, not for changing the definition).

---

## 9. Success Metrics

| Metric | Target |
|---|---|
| All-day events on Event Detail Page display "All Day" capsule | 100% of all-day events |
| No time value appears alongside "All Day" label | 0 occurrences |
| Timed events unaffected — still display correct times | 100% of timed events |
| No new visual regressions on other pages | 0 regressions reported |

---

## 10. References

- **Related Issue**: ASDLC-553 (this issue)
- **Repository**: berkeley-mobile-ios
- **Existing Component**: An "All Day" capsule/pill component already exists in the app and is used in the all-day event banner on the events list. This component must be reused or referenced for visual consistency on the Event Detail Page.
- **Affected Screen**: Event Detail Page (the detail view shown when a user taps an event)
- **All-Day Detection**: The system provides an `isAllDay` flag per event. The existing heuristic checks for specific start/end time values (midnight to 23:59:59). The authoritative source for the detail page display must be confirmed (see Open Question in Section 7).
