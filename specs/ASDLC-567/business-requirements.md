# Business Requirements: [Events Page] Display (All Day) Indicator Instead of Time on Event Detail Page

**Issue:** ASDLC-567 | **Date:** 2026-10-29 | **Complexity:** S

## 1. Executive Summary
When an event is an All Day event, the Event Detail page currently shows a time value such as "12:00 AM" in its time row. This is misleading because no specific time applies. The time row must instead show an "All Day" capsule (pill-shaped label), so users immediately understand the event spans the whole day.

## 2. Problem Statement
- **Current state:** The Events list already recognises All Day events (it uses the event's own All Day designation and shows a dedicated all-day banner). The Event Detail page does not use that designation; it infers all-day status from specific start/end clock values, which does not match how events actually arrive, so it displays "12:00 AM".
- **Desired state:** For All Day events the detail time row shows an "All Day" capsule and no clock time. Timed events are unchanged.
- **Business impact:** Students, staff and visitors browsing campus events get accurate information and consistent behaviour between the list and detail screens, avoiding confusion about when an event happens.

**Personas:** Primary: campus students/visitors viewing events. Secondary: event organisers whose All Day events are published to the app.

### Responsibility boundaries
- The upstream event data already states whether an event is All Day; the app must use that designation as the source of truth and must not recompute it from clock times.
- The All Day designation is optional on an event; when absent it is treated as "not All Day".
- The date row, location, and other detail rows are unaffected.

## 3. Business Rules
- **BR-001:** If an event is designated All Day, the time row on the Event Detail page must show an "All Day" capsule label and must not show any clock time (start or end).
- **BR-002:** If an event is not designated All Day (false or absent), the time row must show the start time (and end time when present) exactly as today.
- **BR-003:** All Day status is determined solely by the event's All Day designation, consistent with the Events list.
- **BR-004:** The capsule text must read exactly "All Day".
- **BR-005:** The capsule must be pill-shaped, visually consistent with the existing all-day styling in the Events list, and the time row must keep its clock icon and layout alignment with other detail rows.
- **BR-006:** The date row must continue to show the date ("Today", "Tomorrow" or the calendar date) for All Day events.
- **BR-007:** The "All Day" label must be readable by screen readers as "All Day".

## 4. Acceptance Criteria
```gherkin
Feature: All Day indicator on Event Detail page

  Scenario: All Day event shows capsule
    Given an event designated as All Day
    When the user opens the Event Detail page
    Then the time row shows an "All Day" capsule
    And no clock time such as "12:00 AM" is shown

  Scenario: Timed event unchanged
    Given an event not designated as All Day starting at 3:00 PM and ending at 4:30 PM
    When the user opens the Event Detail page
    Then the time row shows "3:00 PM - 4:30 PM"
    And no "All Day" capsule is shown

  Scenario: Timed event without end time
    Given a timed event starting at 3:00 PM with no end time
    When the user opens the Event Detail page
    Then the time row shows "3:00 PM" only

  Scenario: Consistency with list
    Given an event shown with the all-day banner in the Events list
    When the user opens its detail page
    Then the time row shows the "All Day" capsule

  Scenario: Date row for All Day event
    Given an All Day event happening today
    When the user opens the Event Detail page
    Then the date row shows "Today"
    And the time row shows the "All Day" capsule

  Scenario: All Day designation absent
    Given an event with no All Day designation and a start time of 12:00 AM
    When the user opens the Event Detail page
    Then the time row shows "12:00 AM" as a timed event

  Scenario: All Day event with an end time present
    Given an All Day event that also has an end time
    When the user opens the Event Detail page
    Then only the "All Day" capsule is shown and no end time appears

  Scenario: Accessibility
    Given VoiceOver is on and an All Day event is open
    When focus reaches the time row
    Then it is announced as "All Day"
```

## 5. Non-Functional Requirements
- **Performance:** No perceptible delay opening the detail page; no extra data requests.
- **Security/Privacy:** No new data collected or exposed.
- **Accessibility:** BR-007; capsule text must remain legible in light and dark appearance and at larger text sizes without truncation.
- **Observability:** None required.
- **Maintainability:** All Day styling is shared with the list where practical.

## 6. Edge Cases & Special Scenarios
- Event with All Day flag absent: treated as timed (BR-002).
- Event with All Day flag true and any start/end times: capsule only (BR-001).
- Event with flag false but start at midnight: shows the clock time; the app does not guess.
- Multi-day events: out of scope; the single capsule is shown if flagged All Day.
- Events restored from the app's locally saved copy (e.g. saved/calendar-exported): the All Day designation must be retained so the capsule still appears. If this designation is not currently preserved on restore, that is a defect to be corrected within this work for the Event Detail page's source events. (Open question OQ-1 below.)
- Long text size: capsule wraps/scales without clipping.

## 7. Out of Scope
- Changes to the Events list or all-day banner.
- Redesign of the Event Detail page or other detail rows.
- Treating midnight-start events with no designation as All Day.
- Changes to calendar export, notifications or other event types (e.g. gym classes, library) beyond what shares the same detail screen.
- Backend/data-source changes.

## 8. Success Metrics
- 100% of All Day events show the capsule and 0% show a clock time on the detail page (manual and automated check over sample events).
- 0 regressions in timed event display (all existing timed event tests pass).
- Zero user reports of incorrect "12:00 AM" on all-day events after release.

## 9. Open Questions / Assumptions
- **OQ-1:** Is the All Day designation preserved when an event is restored from local storage? Assumption: it must be; the Tech Lead verifies and fixes if not.
- **OQ-2:** Capsule colours/style: assumed to follow the existing all-day styling in the Events list since the issue only says "suggested".
- Assumption: the detail page is also used by non-event sources where All Day does not apply; they keep existing behaviour (BR-002).

## 10. References
- ASDLC-567 (this issue); earlier related analysis ASDLC-565 (same topic).
- Repository: https://github.com/gouveiahenrique/berkeley-mobile-ios.git
