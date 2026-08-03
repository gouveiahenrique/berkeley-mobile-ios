# Business Requirements: Display "All Day" Indicator on Event Detail Page

**Issue**: ASDLC-498  
**Summary**: Events Page — Display "All Day" Indicator Instead of Time on Event Detail Page  
**Date**: 2026-08-03  
**Complexity**: S (Small)

---

## 1. Executive Summary

When a campus event is designated as an All Day event, the Event Detail Page incorrectly displays a time value (e.g., "12:00 AM") in the time row. This is misleading because no specific start or end time applies to all-day events. The time row must instead display an "All Day" capsule/badge to clearly and accurately communicate that the event spans the entire day.

---

## 2. Problem Statement

**Current State**  
On the Event Detail Page, the time row always displays a time value derived from the event's date string. For all-day events, this results in showing "12:00 AM" — a technically stored default time that has no meaning to the user and misrepresents the event's schedule.

**Desired State**  
When an event is marked as All Day, the time row on the Event Detail Page must display an "All Day" capsule/badge instead of any time value. Users can immediately understand that the event is not time-bounded within the day.

**Business Impact**  
- Students and staff relying on the Berkeley Mobile app receive inaccurate schedule information for all-day events (holidays, full-day enrollment periods, exhibits, etc.).
- Displaying "12:00 AM" damages trust in the app's event information and may cause confusion about whether the user needs to attend at a specific time.

**Urgency**  
This is an accuracy and UX correctness issue. The erroneous display is present on every all-day event currently in the system, including recurring events such as academic calendar dates.

---

## 3. Personas & User Stories

**Persona: Berkeley Student / Staff**  
A user of the Berkeley Mobile app who browses campus events to plan their schedule.

- **User Story 1**: As a student, when I view the detail page for an all-day event, I want to see a clear "All Day" indicator in the time row so that I know no specific attendance time is required.
- **User Story 2**: As a student, when I view the detail page for a time-bounded event (with a specific start and/or end time), I want to continue seeing the formatted time range so my schedule planning is not affected.

**Persona: Event Organizer (indirect)**  
Campus departments or organizations that post all-day events (holidays, academic deadlines, exhibits) and expect them to be displayed accurately to attendees.

---

## 4. System Capability Statements

The following facts describe what the system already provides, to avoid duplicating or overriding existing logic:

- **All-day detection is already provided by the data model**: The event data model includes an explicit `isAllDay` flag, as well as a date string computation that already resolves to "All Day" as the time portion when the event's start time is midnight (00:00:00) and end time is 11:59:59 PM.
- **The date string format is `<Date> / <TimePart>`**: The time portion (after ` / `) is what the Event Detail Page displays in the time row. For all-day events, this time portion already resolves to the text "All Day" through existing system logic.
- **The `isAllDay` flag is optional (nullable)**: It may be absent on older or partially populated event records. The date-string-based detection serves as the authoritative signal for all-day status for display purposes.
- **Ownership of all-day determination**: The backend/data layer determines and communicates all-day status. The display layer must not re-implement this logic; it must read and present the resolved value.

---

## 5. Business Rules

**BR-001**: When an event is an All Day event, the time row on the Event Detail Page must display an "All Day" capsule/badge and must not display any clock time.

**BR-002**: An event is considered All Day for display purposes when the time portion of its date string resolves to "All Day" (as provided by the existing system).

**BR-003**: When an event is NOT an All Day event, the time row must continue to display the formatted time range as it currently does (e.g., "3:00 PM - 5:00 PM").

**BR-004**: The "All Day" indicator must be visually distinct from plain text — it must be presented as a capsule/pill-shaped badge to match the existing "All Day" display convention used elsewhere in the app.

**BR-005**: The time row must always be visible when a valid time portion exists in the event's date string (whether it is "All Day" or a specific time). The row must not be suppressed for all-day events.

**BR-006**: The "All Day" badge must use the same label text ("All Day") as used in other parts of the app for consistency.

---

## 6. Acceptance Criteria

```gherkin
Feature: Event Detail Page — All Day Indicator in Time Row

  Scenario: All-day event displays "All Day" badge in the time row
    Given a campus event is marked as an All Day event
    When a user opens the Event Detail Page for that event
    Then the time row displays an "All Day" capsule/badge
    And the time row does not display any clock time (e.g., "12:00 AM")
    And the date row continues to display the event's date normally

  Scenario: Time-bounded event continues to display time range
    Given a campus event has a specific start time and optional end time
    When a user opens the Event Detail Page for that event
    Then the time row displays the formatted time range (e.g., "3:00 PM - 5:00 PM")
    And no "All Day" badge is shown in the time row

  Scenario: Time-bounded event with only a start time (no end time)
    Given a campus event has a specific start time and no end time
    When a user opens the Event Detail Page for that event
    Then the time row displays only the start time (e.g., "3:00 PM")
    And no "All Day" badge is shown in the time row

  Scenario: All-day event "All Day" badge appearance matches app convention
    Given a campus event is an All Day event
    When a user opens the Event Detail Page for that event
    Then the "All Day" indicator is rendered as a capsule/pill-shaped badge
    And the badge label reads "All Day"
    And the badge is consistent with the "All Day" visual treatment used in other parts of the Events section

  Scenario: All-day event detail still shows the date
    Given a campus event is marked as an All Day event
    When a user opens the Event Detail Page for that event
    Then the date row shows the event's date (e.g., "Today", "Tomorrow", or a formatted date)
    And the time row shows the "All Day" badge
    And both rows are visible simultaneously
```

---

## 7. Non-Functional Requirements

**Accessibility**  
- The "All Day" badge must be accessible to screen readers with a descriptive label equivalent to "All Day event."

**Visual Consistency**  
- The "All Day" capsule/badge style must be consistent with the existing "All Day" treatment used in the Events list (e.g., `AllDayEventBannerView`), so users see a coherent design language across the Events section.

**Performance**  
- The change must not introduce additional data fetching or processing. The all-day determination is derived entirely from data already loaded for the event detail view.

**Reliability**  
- If the all-day status cannot be determined (e.g., the date string is malformed or absent), the time row must fall back to displaying the time portion as-is, with no crash or blank row.

---

## 8. Edge Cases & Special Scenarios

**EC-001 — Event with missing time portion**: If an event's date string does not contain a time portion (e.g., the separator ` / ` is absent), the time row must not be shown. This is unchanged from existing behavior.

**EC-002 — Event with `isAllDay` flag absent**: If the `isAllDay` flag is nil/absent but the date string time portion resolves to "All Day" via the existing computation logic, the event must still display the "All Day" badge. The date string is the authoritative signal.

**EC-003 — Event with `isAllDay = true` but a non-"All Day" date string**: This is an open question — if the explicit flag and the computed date string disagree, the display layer should use the date string time portion as the authoritative source (since it is the value currently shown). This inconsistency should be flagged as a data quality issue if observed.

**EC-004 — All-day event with a location**: Location and "All Day" badge must both be displayed simultaneously with no layout conflict.

**EC-005 — All-day event with no end time recorded**: If an all-day event lacks an end time, the date string computation may not produce "All Day." In this case, the existing behavior (showing "12:00 AM") persists until the data model is corrected upstream. This scenario is out of scope for this issue.

---

## 9. Out of Scope

- Changes to how all-day status is determined or stored in the backend or data model.
- Changes to the Event Row view (list view) display of all-day events.
- Changes to the calendar view display of all-day events.
- Adding new all-day event detection logic beyond reading the existing date string.
- Modifying the "All Day" banner used in the Events list section (`AllDayEventBannerView`).
- Any changes to event editing, creation, or calendar export behavior.
- Handling the case where `isAllDay = true` but the computed date string does not reflect "All Day" (data quality issue, out of scope).

---

## 10. Success Metrics

- **SM-001**: Zero all-day events display a clock time (e.g., "12:00 AM") in the time row on the Event Detail Page.
- **SM-002**: 100% of all-day events display the "All Day" capsule/badge in the time row on the Event Detail Page.
- **SM-003**: 100% of time-bounded events continue to display their formatted time range unchanged.
- **SM-004**: No regression in the display of event dates, locations, descriptions, or action buttons on the Event Detail Page.
- **SM-005**: The "All Day" badge matches the visual style of existing "All Day" treatments in the app, verified by design review.

---

## 11. References

- **Related component**: `AllDayEventBannerView` — existing "All Day" capsule treatment in the Events list section.
- **Affected view**: Event Detail Page, time row within the header card.
- **Data model**: `BMCalendarEvent` protocol and its `dateString` computed property, which already resolves the time portion to "All Day" for qualifying events.
- **Event data model**: `BMEventCalendarEntry`, which carries both `isAllDay` (nullable flag) and conforms to `BMCalendarEvent` for the computed date string.
- **Repository**: berkeley-mobile-ios (ASUC OCTO)
