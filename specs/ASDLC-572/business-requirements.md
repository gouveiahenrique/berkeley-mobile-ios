# Business Requirements: [Events Page] Display (All Day) Indicator Instead of Time on Event Detail Page

Issue: ASDLC-572 | Date: 2026-11-17 | Complexity: S

## 1. Executive Summary
On the Event Detail page, events flagged as All Day currently show a misleading clock time (e.g., "12:00 AM") in the time row. The time row must instead show an "All Day" capsule/pill-shaped label so users immediately understand the event spans the whole day. Timed events must be unaffected.

## 2. Problem Statement
- **Current state:** The Event Detail page time row shows a clock time for All Day events (observed: 12:00 AM). All Day events have no meaningful start/end time, so this is inaccurate.
- **Desired state:** For All Day events, the time row shows an "All Day" capsule in place of the time text. Timed events keep showing their time (or time range).
- **Business impact:** Students, staff and visitors browsing campus events get accurate information and avoid misreading all-day events as midnight events. Consistent with the existing "All Day" capsule already used in the Events list.
- **Personas:** Primary: students/visitors viewing event details. Secondary: event organizers whose all-day events are presented.

### Responsibility Boundaries
- The event data already carries an All Day flag (optional; absent is treated as not All Day). The client does not need to compute All Day status from times for this feature.
- The event list screen already shows an "All Day" capsule; this issue covers only the Event Detail page.
- The date row and location row on the Detail page already exist and are unchanged.
- Open question (non-blocking, resolved by BR-002): the current time text logic also infers "All Day" from specific start/end times, which can disagree with the flag. This spec makes the flag the single source of truth.

## 3. Business Rules
- **BR-001:** If an event is marked All Day, the Event Detail time row must display an "All Day" capsule (pill-shaped label) and must not display any clock time or time range.
- **BR-002:** All Day status is determined by the event's All Day flag. A missing flag means not All Day.
- **BR-003:** If an event is not All Day, the time row must display the time/time range exactly as today.
- **BR-004:** The time row must keep its leading clock icon (same position/alignment as other rows) for both variants.
- **BR-005:** The capsule text must read exactly "All Day" and must be legible in light and dark appearance.
- **BR-006:** The date row, location row, and the Events list All Day banner must not change.

## 4. Acceptance Criteria
```gherkin
Feature: All Day indicator on Event Detail page

  Scenario: All Day event shows capsule
    Given an event marked as All Day
    When the user opens its Event Detail page
    Then the time row shows a capsule labeled "All Day"
    And no clock time such as "12:00 AM" is shown

  Scenario: Timed event unchanged
    Given an event not marked All Day with start 2:00 PM and end 3:30 PM
    When the user opens its Event Detail page
    Then the time row shows "2:00 PM - 3:30 PM"
    And no "All Day" capsule is shown

  Scenario: Timed event without end time
    Given a non-All-Day event starting 2:00 PM with no end time
    When the user opens its Event Detail page
    Then the time row shows "2:00 PM" and no capsule

  Scenario: All Day flag missing
    Given an event with no All Day flag
    When the user opens its Event Detail page
    Then it is treated as a timed event

  Scenario: All Day event with midnight start
    Given an All Day event whose start is 12:00 AM
    When the user opens its Event Detail page
    Then "12:00 AM" is not displayed anywhere in the time row

  Scenario: Other rows unaffected
    Given an All Day event with a date and location
    When the user opens its Event Detail page
    Then the date row and location row display as before
    And the clock icon is shown beside the capsule

  Scenario: Appearance modes
    Given an All Day event
    When the Detail page is viewed in light and in dark appearance
    Then the "All Day" capsule text is legible in both
```

## 5. Non-Functional Requirements
- **Performance:** No perceptible added delay when opening the Detail page.
- **Security/Privacy:** No new data collected or transmitted.
- **Accessibility:** The capsule must be announced by screen readers as "All Day"; text must scale with the user's text-size settings without clipping.
- **Scalability/Reliability:** Purely presentational; no new failure modes.
- **Observability:** No new logging or analytics required.

## 6. Edge Cases & Special Scenarios
- All Day flag true but start/end times present: times are ignored in the time row.
- Multi-day All Day events: the time row still shows only "All Day"; date row behavior is unchanged.
- Very large text size: the capsule grows to fit "All Day" without truncation.
- Event with no time data and not All Day: behaves as today.

## 7. Out of Scope
- Redesigning the Events list All Day banner.
- Changing date row formatting, or how All Day status is supplied by the data source.
- Calendar export/"add to calendar" behavior.
- Other screens that display event times.
- Localization.

## 8. Success Metrics
- 100% of All Day events show the "All Day" capsule and 0% show a clock time on the Detail page (verified by manual/automated UI checks).
- 0 regressions in timed event display.
- Zero reports of all-day events being shown as 12:00 AM after release.

## 9. References
- Issue ASDLC-572.
- Existing All Day capsule on the Events list (visual precedent).
- Repository: https://github.com/gouveiahenrique/berkeley-mobile-ios.git
