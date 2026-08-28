# Business Requirements Specification
## ASDLC-515: [Events Page] Display "All Day" Indicator Instead of Time on Event Detail Page

**Date**: 2026-08-28  
**Status**: Draft  
**Complexity**: S (Small)

---

## 1. Executive Summary

When a campus event is designated as an All Day event, the Event Detail Page incorrectly displays a time value (such as "12:00 AM") in the time row instead of communicating that the event spans the entire day. This creates a misleading experience for users trying to understand event scheduling. The fix requires replacing the displayed time value with a clearly labeled "All Day" visual indicator when an event carries the all-day designation.

---

## 2. Problem Statement

**Current State**:  
The Event Detail Page shows a time row beneath the date row for every event. For all-day events, the system currently displays a clock time (e.g., "12:00 AM") even though no specific start or end time is meaningful for that event. This happens because the all-day status is not consistently checked when rendering the time row — the display relies on a derived time string that falls back to midnight when no specific time applies.

**Desired State**:  
When an event is marked as All Day, the time row must display an "All Day" capsule/badge label in place of any time value. The capsule style is consistent with the existing All Day visual treatment used elsewhere in the Events feature.

**Business Impact**:  
Users viewing event details are misled into thinking an event starts at 12:00 AM, which may cause confusion about attendance, scheduling conflicts, or event relevance. Correcting this ensures users receive accurate, trustworthy information at the point of decision-making.

**Urgency**:  
The current behavior is factually incorrect and actively misleads users. No new infrastructure is required — the all-day flag and the capsule visual component already exist in the system. The fix is low-risk and high-value.

---

## 3. Personas & User Stories

### Primary Persona: Berkeley Mobile App User (Student / Staff / Faculty)

**Needs**: Accurate, at-a-glance understanding of when and how long an event lasts.  
**Pain Point**: Sees "12:00 AM" on an all-day event and either dismisses the event as a midnight event or is confused about the schedule.  
**Goal**: Instantly know whether an event requires showing up at a specific time or simply spans the whole day.

**User Stories**:

- As a student browsing campus events, I want to immediately see when an event is all-day so that I can plan my schedule without confusion.
- As a user reading an event's detail page, I want the time row to reflect the actual nature of the event so that I am not misled by a false time value.

---

## 4. Business Rules

**BR-001**: When an event is designated as an All Day event, the time row on the Event Detail Page **must** display an "All Day" indicator instead of a time value.

**BR-002**: The "All Day" indicator **must** be visually distinct from plain text time values — it must be rendered as a capsule/pill-shaped badge to signal a categorically different time type.

**BR-003**: The determination of whether an event is All Day **must** be based on the event's explicit all-day designation. The system's existing all-day flag on the event record is authoritative — the display logic must use it directly rather than inferring all-day status from time component matching.

**BR-004**: Events that are NOT designated as All Day **must** continue to display their start time (and end time if available) in the time row, unchanged from the current behavior.

**BR-005**: The date row (showing the calendar date) **must** remain visible and unchanged for all-day events — only the time row is affected.

**BR-006**: The "All Day" capsule **must** appear in the same position where the time value would otherwise appear (i.e., it replaces the time value in-place, adjacent to the clock icon row).

---

## 5. Acceptance Criteria

```gherkin
Feature: All Day Indicator on Event Detail Page

  Background:
    Given the user is using the Berkeley Mobile app
    And the user navigates to the Events section

  Scenario: All Day event shows "All Day" capsule instead of time
    Given an event exists that is designated as All Day
    When the user opens the Event Detail Page for that event
    Then the time row displays an "All Day" capsule/badge
    And no clock time (e.g., "12:00 AM") is shown in the time row
    And the date row continues to show the event's calendar date

  Scenario: Non-All Day event continues to show time
    Given an event exists that is NOT designated as All Day
    And the event has a defined start time
    When the user opens the Event Detail Page for that event
    Then the time row displays the event's start time
    And the time row does not display an "All Day" indicator

  Scenario: Non-All Day event with start and end time shows time range
    Given an event exists that is NOT designated as All Day
    And the event has both a start time and an end time
    When the user opens the Event Detail Page for that event
    Then the time row displays the time range (start time to end time)
    And the time row does not display an "All Day" indicator

  Scenario: All Day capsule is visually distinct
    Given an event exists that is designated as All Day
    When the user opens the Event Detail Page for that event
    Then the "All Day" label is rendered inside a capsule/pill-shaped visual container
    And the capsule is clearly distinguishable from plain text time values

  Scenario: All Day event detail page is otherwise unchanged
    Given an event exists that is designated as All Day
    When the user opens the Event Detail Page for that event
    Then the event name, date, location, description, and action buttons display as normal
    And only the time row content is replaced by the "All Day" capsule

  Scenario: All Day event with no end time still shows "All Day" capsule
    Given an event exists that is designated as All Day
    And the event has no end time recorded
    When the user opens the Event Detail Page for that event
    Then the time row displays the "All Day" capsule
    And no time range or partial time is shown

  Scenario: All Day flag is used as the authoritative source
    Given an event is explicitly flagged as All Day in the data
    But the event's stored time values do not conform to the midnight-to-23:59 pattern
    When the user opens the Event Detail Page for that event
    Then the time row still displays the "All Day" capsule
    And the stored time values are not shown
```

---

## 6. Non-Functional Requirements

**Performance**:  
- The change in display logic must introduce no perceptible delay. The Event Detail Page must load and render at the same speed as today.

**Visual Consistency**:  
- The "All Day" capsule styling must be visually consistent with the existing All Day banner used in other parts of the Events feature, ensuring a cohesive design language across the app.

**Accessibility**:  
- The "All Day" capsule label must be accessible to screen readers and must convey the same meaning as the visible text.

**Reliability**:  
- The display logic must handle all combinations of the all-day flag (true, false, or unset/nil) without crashing or displaying blank content. An unset all-day flag must be treated as not all-day (default behavior: show time).

**Maintainability**:  
- The all-day detection logic in the time row must directly use the event's all-day flag as its authoritative source, not secondary heuristics (such as comparing time components).

---

## 7. Edge Cases & Special Scenarios

| Scenario | Expected Behavior |
|---|---|
| `isAllDay` flag is `true` and time components are midnight/23:59 | Display "All Day" capsule |
| `isAllDay` flag is `true` but time components do not match midnight/23:59 (e.g., end time is nil) | Display "All Day" capsule — flag is authoritative |
| `isAllDay` flag is `false` or absent | Display time value as today |
| `isAllDay` flag is `nil` (unset) | Treat as not all-day; display time value |
| All Day event with no location set | "All Day" capsule displays; location row is hidden as usual |
| All Day event with no description | "All Day" capsule displays; description section is hidden as usual |
| All Day event viewed in light mode | "All Day" capsule renders correctly |
| All Day event viewed in dark mode | "All Day" capsule renders correctly with appropriate contrast |

---

## 8. Open Questions

**OQ-001**: Is the `isAllDay` flag always populated from the data source for all events, or can it arrive as `nil` for events ingested from certain calendar sources? If `nil` is common, a fallback detection rule may be needed for those events.

**OQ-002**: Should the calendar-add action (adding the event to the user's native calendar) also pass the all-day designation, or is that already handled correctly today? This is not in scope for the current change but may be related.

---

## 9. Out of Scope

- Changes to the Events list view or calendar view — only the Event Detail Page time row is affected.
- Changes to how all-day status is stored, ingested, or computed in the backend or data layer.
- Adding or modifying the All Day banner displayed above the events list (that is a separate component).
- Changing the date row or any other row on the Event Detail Page.
- Changes to how non-all-day events display their time, date, location, or description.
- Adding new analytics or logging for all-day event views.
- Modifying the calendar-add functionality or the event's iCalendar representation.

---

## 10. Success Metrics

| Metric | Target |
|---|---|
| All Day events on Event Detail Page display "All Day" capsule | 100% of all-day events |
| Time value ("12:00 AM" or any clock time) shown for all-day events | 0 occurrences |
| Non-All Day events continue to display correct time values | No regression — 100% unaffected |
| Crash rate on Event Detail Page after change | No increase from baseline |
| Design review approval for capsule styling | Approved before release |

---

## 11. References

- Related issue: ASDLC-515
- Existing All Day banner component: `Events/AllDayEventBannerView.swift`
- Event data model: `Events/EventDataSource/BMEventCalendarEntry.swift` — `isAllDay: Bool?` field
- Event Detail Page: `Events/EventDetailView.swift` — `timeView` computed property
- Shared calendar event protocol: `Data/ItemProtocols/BMCalendarEvent.swift` — `dateString` computed property
- GitHub repository: https://github.com/gouveiahenrique/berkeley-mobile-ios
