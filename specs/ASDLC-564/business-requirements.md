# Business Requirements: [Events Page] Display (All Day) Indicator Instead of Time on Event Detail Page

- **Issue Key**: ASDLC-564
- **Date**: 2026-10-21
- **Complexity**: S (Small)

## 1. Executive Summary
On the Event Detail page, events flagged as All Day currently show a misleading time value (e.g., "12:00 AM") in the time row. This work replaces that value with an "All Day" capsule/pill-shaped label so users immediately understand the event spans the entire day.

## 2. Problem Statement
- **Current state**: For an All Day event, the time row on the Event Detail page shows a clock time such as "12:00 AM". No specific start or end time applies to the event, so the information is inaccurate.
- **Desired state**: For an All Day event, the time row shows an "All Day" capsule label in place of any time value. Non-All-Day events are unchanged.
- **Business impact**: Students, staff, and visitors reading event details are no longer misled about when an event happens. The detail page becomes consistent with the Events list, which already presents All Day events with an "All Day" capsule.
- **Urgency**: Low-to-medium; this is a user-facing data accuracy defect with no dependencies.

### Responsibility Boundaries
- The event data already carries an optional All Day flag, supplied by the existing event data source. The app must use it as received and must not infer "All Day" from the time value (e.g., midnight).
- The flag is optional per event. When absent, the event is treated as not All Day.
- The Events list already renders an "All Day" capsule; the detail page is the only surface changed by this work.
- No changes to authentication, data fetching, or the event data source are required.

## 3. Personas & User Stories
- **Campus visitor / student (primary)**: Browses events and opens details to plan attendance.
  - *As a user, I want to see "All Day" instead of a time for all-day events so that I do not think the event starts at midnight.*
- **Event organizer (secondary)**: Publishes events marked All Day.
  - *As an organizer, I want my All Day events to be shown accurately so attendees are not confused.*
- **Decision maker**: Berkeley Mobile product owner approves the change.

## 4. Business Rules
- **BR-001**: If an event is flagged All Day, the time row on the Event Detail page must display an "All Day" capsule/pill-shaped label.
- **BR-002**: If an event is flagged All Day, no clock time value (including "12:00 AM") may appear in the time row.
- **BR-003**: If an event is not flagged All Day, or the flag is absent, the time row must display the event time exactly as it does today.
- **BR-004**: The date row, location row, event name, description, and action buttons must remain unchanged for all events.
- **BR-005**: The label text must read exactly "All Day".
- **BR-006**: The time row must keep its existing clock icon alongside the "All Day" capsule so the row layout stays consistent with other rows.
- **BR-007**: The All Day determination must come solely from the event's All Day flag, not from the time value.

## 5. Acceptance Criteria
```gherkin
Feature: All Day indicator on Event Detail page

  Scenario: All Day event shows the capsule
    Given an event flagged as All Day
    When the user opens the Event Detail page
    Then the time row displays a capsule labeled "All Day"
    And no clock time is shown in the time row

  Scenario: Timed event is unchanged
    Given an event not flagged as All Day with a start time of 3:00 PM
    When the user opens the Event Detail page
    Then the time row displays the time as it does today
    And no "All Day" capsule is shown

  Scenario: Event with missing All Day flag
    Given an event with no All Day flag
    When the user opens the Event Detail page
    Then the event is treated as not All Day
    And the time row displays the time as it does today

  Scenario: Timed event starting at midnight is not treated as All Day
    Given an event not flagged as All Day with a start time of 12:00 AM
    When the user opens the Event Detail page
    Then the time row displays "12:00 AM"
    And no "All Day" capsule is shown

  Scenario: Other rows unaffected for All Day event
    Given an event flagged as All Day with a date and a location
    When the user opens the Event Detail page
    Then the date row and the location row display their usual values

  Scenario: All Day event without a location
    Given an event flagged as All Day with no location
    When the user opens the Event Detail page
    Then the "All Day" capsule is shown
    And the location row is not shown
```

## 6. Non-Functional Requirements
- **Performance**: The indicator must appear together with the rest of the page content, with no added load time or visible delay.
- **Accessibility**: The capsule must be readable by screen readers as "All Day", must remain legible in light and dark appearance, and must scale with the user's text size settings.
- **Visual consistency**: The capsule must be visually consistent with the existing "All Day" capsule on the Events list.
- **Security**: No new data collected or exposed.
- **Reliability**: A missing flag must never cause an error; it falls back to normal time display.
- **Observability**: No new logging or analytics are required.

## 7. Edge Cases & Special Scenarios
- All Day flag absent: treated as not All Day (BR-003).
- Timed event at midnight: shows the time, not the capsule (BR-007).
- All Day event spanning multiple days: the time row still shows only the "All Day" capsule; the date row behavior is unchanged.
- Long event names or small screens: the capsule must remain on a single line and must not be truncated or overlap other rows.
- Flag value changes after a data refresh: the page reflects the latest value of the event shown.

## 8. Out of Scope
- Changes to the Events list or All Day banner.
- Changes to the date row format or multi-day date presentation.
- Changes to the event data source or how events are flagged All Day.
- Behavior of adding All Day events to the device calendar.
- Redesigning the Event Detail page.
- Localization of the "All Day" label.

## 9. Success Metrics
- 100% of All Day events show the "All Day" capsule and 0 show a clock time on the detail page (verified via manual and automated UI checks).
- 0 regressions in time display for non-All-Day events.
- 0 user-reported complaints about incorrect "12:00 AM" times on All Day events after release.

## 10. References
- Issue ASDLC-564
- Repository: https://github.com/gouveiahenrique/berkeley-mobile-ios.git
- Related existing behavior: "All Day" capsule on the Events list.

### Open Questions / Assumptions
- Assumption: the capsule styling (neutral gray capsule, bold text) follows the existing Events list capsule, as the issue only says "suggested as a capsule/pill-shaped label".
- Assumption: the clock icon is retained next to the capsule (BR-006).
