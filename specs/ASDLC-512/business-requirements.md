# Business Requirements: ASDLC-512
## [Events Page] Display "All Day" Indicator Instead of Time on Event Detail Page

**Issue Key**: ASDLC-512  
**Date**: 2026-08-06  
**Status**: Draft  
**Complexity**: S (Small)

---

## 1. Executive Summary

When a campus event is designated as "All Day," the Event Detail Page incorrectly displays a specific time value (e.g., "12:00 AM") in the time row. This misleads users into believing the event has a defined start time. The time row must instead show a clearly labeled "All Day" indicator — styled as a capsule/pill badge — to accurately communicate that the event spans the full day with no specific start or end time.

---

## 2. Problem Statement

### Current State
The Event Detail Page displays a time row for every event, unconditionally showing a time value derived from the event's start date. When an event is flagged as "All Day," the time row still renders "12:00 AM," which is an artifact of how all-day events store their date (midnight) rather than a meaningful time.

### Desired State
When an event is designated as All Day, the time row on the Event Detail Page must display an "All Day" badge/capsule in place of any time value. This matches the treatment already applied on the Events list page, where All Day events render a dedicated `AllDayEventBannerView` rather than a time string.

### Business Impact
- **Users** receive misleading information that may cause confusion about whether they need to arrive at a specific time.
- **Trust** in the app's accuracy is undermined when displayed data is demonstrably incorrect.
- **Consistency** is broken because the Events list page already differentiates All Day events visually, but the detail page does not follow suit.

### Urgency
This is a correctness defect affecting any event marked as All Day. It surfaces whenever a user taps into the detail view of such an event. Every All Day event in the system triggers this misleading display.

---

## 3. Personas & User Stories

### Primary Persona: Student / App User
A UC Berkeley student browsing upcoming campus events who taps an event to view its details.

**User Story**:  
> As a student viewing an event's detail page, I want to see clearly whether an event is "All Day" or has a specific time, so that I can plan my schedule accurately without being misled by a meaningless time value.

### Secondary Persona: Event Organizer
A staff member or student organization that has published an All Day event (e.g., a campus-wide holiday, an exhibition spanning the day) and expects the app to display it accurately.

**User Story**:  
> As an event organizer, I want All Day events I publish to display correctly on the detail page, so that attendees are not confused about whether there is a required attendance time.

---

## 4. Business Rules

**BR-001**: An event is considered "All Day" when it is explicitly designated as such by the data provider. The app must not independently infer All Day status from time values alone.

**BR-002**: When an event is All Day, the time row on the Event Detail Page must display an "All Day" indicator label and must not display any time value (no start time, no end time, no time range).

**BR-003**: When an event is not All Day, the time row on the Event Detail Page must display the event's start time and, if an end time is provided, the end time as a range. This behavior is unchanged from current.

**BR-004**: The "All Day" indicator must be visually distinct from a plain text time string — it must be presented as a capsule/pill-shaped badge to communicate its special status at a glance.

**BR-005**: The "All Day" indicator must use the label text "All Day" (consistent with the existing "All Day" label already used on the Events list page).

**BR-006**: The time row must always be visible on the Event Detail Page. If the event is All Day, it shows the "All Day" badge. If the event is not All Day, it shows the time. The row must never be hidden or omitted entirely.

**BR-007**: The "All Day" designation for an event is provided by the upstream data source and must be consumed as-is. The app must not override, re-derive, or validate this designation against time values.

---

## 5. Acceptance Criteria

```gherkin
Feature: All Day Indicator on Event Detail Page

  Scenario: All Day event shows "All Day" badge instead of time
    Given a user is viewing the Events list
    And there is an event marked as All Day
    When the user taps on that event to open the Event Detail Page
    Then the time row displays an "All Day" badge
    And the time row does not display any time value (no "12:00 AM", no time range)
    And the "All Day" badge is styled as a capsule/pill shape

  Scenario: Non-All-Day event still shows time on Event Detail Page
    Given a user is viewing the Events list
    And there is an event that is not marked as All Day
    When the user taps on that event to open the Event Detail Page
    Then the time row displays the event's start time
    And if an end time is present, the time row displays the time as a range (e.g., "10:00 AM - 2:00 PM")
    And no "All Day" badge is shown

  Scenario: Non-All-Day event with no end time shows only start time
    Given a user is viewing an event that is not marked as All Day
    And the event has no end time
    When the user opens the Event Detail Page
    Then the time row displays only the start time
    And no end time is shown

  Scenario: All Day badge label matches existing design language
    Given a user is viewing the Event Detail Page of an All Day event
    When the time row is rendered
    Then the badge label reads exactly "All Day"
    And the badge uses the same capsule/pill visual style consistent with existing All Day indicators in the app

  Scenario: Time row is always present on Event Detail Page
    Given any event (All Day or not)
    When the user opens the Event Detail Page
    Then the time row with a clock icon is always visible
    And it contains either the "All Day" badge or a time value, never blank
```

---

## 6. Non-Functional Requirements

### Usability
- The "All Day" badge must be immediately legible at the font size and layout used in the time row; it must not be truncated or clipped.
- The badge must be visually consistent with the existing "All Day" treatment used elsewhere in the app so users recognize it as the same concept.

### Accessibility
- The "All Day" badge must be accessible to screen readers with a label that communicates "All Day event" or equivalent, so visually impaired users receive the same information.

### Consistency
- The visual treatment of "All Day" on the detail page must be consistent with the "All Day" visual treatment on the Events list page to avoid confusion.

### Maintainability
- If the All Day badge visual style is updated in the future, the change must be applicable in one place and propagate to both the list and detail views.

---

## 7. Edge Cases & Special Scenarios

### EC-001: `isAllDay` field is absent or null
If the All Day designation from the data source is absent (null/missing) for a given event, the app must treat the event as not All Day and display the time value normally. No crash or blank display is acceptable.

### EC-002: Event marked All Day but start time is not midnight
The app must rely solely on the All Day designation from the data source (BR-007), not on whether the start time equals midnight. If an event is designated All Day, the "All Day" badge must appear regardless of what time value is stored internally.

### EC-003: All Day event added to user's device calendar
Adding an All Day event to the user's personal calendar is an existing feature. This requirement does not change the behavior of calendar export; it only changes what is displayed in the time row on the detail page.

### EC-004: All Day event with a location
When an All Day event also has a location, both the location row and the "All Day" time row must appear. Neither row should suppress the other.

### EC-005: All Day event with no description, no learn-more link, and no register link
The detail page must still render correctly (name, date row, "All Day" time row) even when all optional fields are absent.

---

## 8. Out of Scope

- Changes to the Events list page. The list already correctly differentiates All Day events and is not part of this fix.
- Changes to how All Day events are exported or added to the user's device calendar.
- Changes to how the data source defines or stores the All Day designation.
- Changes to the date row (the calendar-icon row showing the event date); only the time row is affected.
- Visual redesign of the Event Detail Page beyond the time row change.
- Adding new event types or categories.
- Changes to event filtering or sorting behavior.
- Changes to any other screen that displays event time information (e.g., search results, widgets).

---

## 9. Success Metrics

- **Correctness**: 100% of events marked as All Day display the "All Day" badge (not a time value) in the time row on the Event Detail Page.
- **No regression**: 100% of events not marked as All Day continue to display a time value in the time row.
- **Consistency**: The "All Day" badge label and visual shape match the existing All Day treatment used on the Events list page.
- **No crash**: The Event Detail Page renders without error for All Day events with any combination of optional fields (description, location, links) being present or absent.

---

## 10. References

- **ASDLC-512**: Original issue — [Events Page] Display (All Day) Indicator Instead of Time on Event Detail Page
- **Repository**: berkeley-mobile-ios (primary iOS client)
- **Repository**: emerge (secondary repository referenced in the issue)
- **Related component**: Events list page — already uses a distinct "All Day" visual treatment for All Day events in the list view; the detail page must match this convention.
- **Existing All Day detection logic**: The app already contains logic to detect All Day events based on the `isAllDay` flag provided by the data source, as well as a fallback heuristic (start time = 00:00:00, end time = 23:59:59). The detail page must use the same detection mechanism already in use elsewhere in the app rather than introducing a new one.

---

*Document prepared by: Business Analyst Agent*  
*Ready for: Tech Lead / Technical Specification*
