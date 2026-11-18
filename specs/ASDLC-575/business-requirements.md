# Business Requirements: [Events Page] Display (All Day) Indicator Instead of Time on Event Detail Page

Issue: ASDLC-575 | Date: 2026-11-18 | Complexity: S
context_mesh: unavailable (memory tools not present in this session)

## 1. Executive Summary
The Event Detail page shows a misleading time value (e.g., "12:00 AM") for events flagged as All Day. This work replaces that time value with an "All Day" capsule-shaped label so users immediately understand the event spans the whole day. Non-all-day events are unchanged.

## 2. Problem Statement
- **Current state:** The time row of the Event Detail page always shows a time derived from the event's start date. For All Day events this is a placeholder midnight value, which implies a specific start time that does not exist.
- **Desired state:** For All Day events, the time row shows an "All Day" capsule label instead of a time.
- **Business impact:** Students, staff and visitors browsing campus events get accurate scheduling information and avoid mistaking all-day events for midnight events. The events list already presents All Day events with a capsule "All Day" label, so this makes the detail page consistent with it.
- **Personas:** Primary: app users viewing event details (students, visitors). Secondary: event organizers, whose events must be represented accurately.

### Responsibility boundaries
- The data source already tells the system whether an event is All Day. The client must use this flag as received and must not infer All Day status from time values.
- The flag is optional per event; when it is absent the event is treated as not All Day.
- Date display (the calendar row) is already handled and is not changed.

## 3. Business Rules
- BR-001: If an event is flagged All Day, the time row must show an "All Day" capsule label and must not show any clock time.
- BR-002: If an event is not flagged All Day (false or absent), the time row must show the time exactly as it does today.
- BR-003: The label text must be exactly "All Day".
- BR-004: The label must be capsule/pill shaped, and its visual style must be consistent with the existing "All Day" capsule in the events list.
- BR-005: The time row must keep its position and its clock icon, alongside the date and location rows.
- BR-006: The date row and location row behavior must not change.

## 4. Acceptance Criteria
```gherkin
Feature: All Day indicator on Event Detail page

  Scenario: All Day event shows capsule
    Given an event flagged as All Day
    When the user opens its Event Detail page
    Then the time row shows a capsule labeled "All Day"
    And no clock time such as "12:00 AM" appears in the time row

  Scenario: Timed event unchanged
    Given an event not flagged as All Day
    When the user opens its Event Detail page
    Then the time row shows the event time as before
    And no "All Day" capsule is shown

  Scenario: All Day flag absent
    Given an event with no All Day information
    When the user opens its Event Detail page
    Then the event is treated as not All Day
    And the time row shows the time as before

  Scenario: Other rows unaffected
    Given an All Day event with a location
    When the user opens its Event Detail page
    Then the date row and location row display the same content as for any other event

  Scenario: Consistency with list
    Given an All Day event shown with an "All Day" capsule in the events list
    When the user opens its Event Detail page
    Then the detail page also shows an "All Day" capsule

  Scenario: Appearance modes
    Given an All Day event
    When the detail page is shown in light mode or dark mode
    Then the "All Day" capsule text is legible in both
```

## 5. Non-Functional Requirements
- Performance: no perceptible change in detail page load time.
- Accessibility: the label must be readable by screen readers as "All Day", and must remain legible with larger text sizes.
- Security/Scalability: not applicable; no new data is collected or transmitted.
- Observability: no new logging or analytics required.
- Maintainability: automated tests must cover the All Day and non-All Day cases.

## 6. Edge Cases
- Event is All Day and has an end date spanning multiple days: the time row still shows only "All Day"; the date row behavior is unchanged.
- Event is All Day with a stored midnight start time: the time is never displayed.
- Event flagged All Day but with a missing end time: shows "All Day".
- Event not All Day with no end time: unchanged from current behavior.

## 7. Out of Scope
- Changes to the events list, calendar view or the existing list-level All Day banner.
- Changes to the date row format or multi-day date formatting.
- Changes to how the All Day flag is sourced or how events are added to the device calendar.
- Redesign of the Event Detail page.
- Localization of the "All Day" text.

## 8. Success Metrics
- 100% of All Day events show the "All Day" capsule and 0% show a clock time on the detail page.
- 0 regressions in time display for non-All Day events.
- Automated tests for both cases pass.

## 9. References
- Issue ASDLC-575.
- Existing behavior: the events list shows an "All Day" capsule for All Day events.

## Open Questions
- None blocking. Assumption: the existing list capsule style (gray translucent pill, bold text) is the visual reference for BR-004.
