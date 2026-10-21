# Business Requirements: [Events Page] Display (All Day) Indicator Instead of Time on Event Detail Page

**Issue Key:** ASDLC-562
**Date:** 2026-10-21
**Complexity:** S (Small)

## 1. Executive Summary

When an event is an All Day event, the Event Detail Page shows a clock time (for example "12:00 AM") in its time row. No specific time applies to an All Day event, so this is misleading. The time row must instead show an "All Day" capsule (pill-shaped label) so users immediately understand the event spans the entire day.

## 2. Problem Statement

**Current state:** The Event Detail Page always shows a time value in the time row. For events flagged as All Day, the value is a midnight time such as "12:00 AM", which implies the event starts at midnight. The Events list already marks All Day events with an "All Day" capsule, so the detail page is inconsistent with it.

**Desired state:** For All Day events, the time row shows an "All Day" capsule in place of any time value. Events that are not All Day continue to show their time (start, or start - end) exactly as today.

**Business impact:** Students, staff and visitors get accurate timing information and a presentation consistent with the Events list. This removes the risk of people thinking an All Day event happens at midnight.

**Urgency:** Low-effort correctness fix to displayed information; no dependency blocks it.

### Responsibility boundaries (system capabilities)

- The event data source already tells the app whether an event is All Day. This flag is optional: it can be absent, and an absent flag must be treated as "not All Day".
- The event name, date, location and other detail fields are unaffected and keep being displayed as received.
- The Events list already shows an "All Day" capsule; that existing behavior is not changed by this work.
- Open question (flagged, not decided here): the app currently also infers "All Day" from a start of 12:00:00 AM and an end of 11:59:59 (the end-time check as written matches 11:59:59 on the 12-hour clock, which may not be the intended 23:59:59). Whether the inference or the explicit flag is the source of truth for the detail page is not stated in the issue. This spec's rule BR-001 uses the existing All Day determination already used by the Events list (the explicit flag), and requires that no event the system considers All Day shows a clock time on the detail page. Product owner confirmation is requested on whether events lacking the flag but matching the midnight-to-end-of-day pattern must also show the capsule.

## 3. Personas & User Stories

| Persona | Needs | Pain point |
|---|---|---|
| Campus community member (primary: student, staff, visitor viewing events) | Quickly know when an event takes place | Sees "12:00 AM" for All Day events and is unsure whether the event is at midnight |
| Event organizer (secondary) | Their All Day events are represented accurately | All Day events look like midnight events |

**User stories**
- As an event attendee, I want to see "All Day" on the detail page of an All Day event so that I know I can attend at any time during the day.
- As an attendee, I want the detail page to match how the Events list labels All Day events so that the app feels consistent.
- As an attendee, I want events with specific times to keep showing their times so that nothing changes for them.

**Decision maker:** Product owner of the Events feature.

## 4. Business Rules

- **BR-001:** If an event is All Day, the time row of the Event Detail Page must display an "All Day" capsule and must not display any clock time (start or end).
- **BR-002:** If an event is not All Day, or its All Day indicator is absent, the time row must display the time exactly as it does today (start time, or start time - end time when an end exists).
- **BR-003:** The "All Day" indicator must be a pill-shaped (capsule) label with the exact text "All Day".
- **BR-004:** The capsule replaces the time value in the same row, in the same position, and keeps the row's clock icon and alignment with the date and location rows. The time row is shown exactly once.
- **BR-005:** The date row, event name, location row, image, description and action buttons must be unchanged for All Day events.
- **BR-006:** The capsule must be legible in both light and dark appearance and must be readable by screen readers as "All Day".
- **BR-007:** The Events list's existing All Day presentation must remain unchanged.

## 5. Acceptance Criteria

```gherkin
Feature: All Day indicator on Event Detail Page

  Scenario: All Day event shows capsule instead of time
    Given an event marked as All Day on 03/15/2027
    When the user opens the Event Detail Page for that event
    Then the time row displays an "All Day" capsule
    And the time row does not display "12:00 AM" or any other clock time

  Scenario: Timed event is unchanged
    Given an event that is not All Day starting at 2:00 PM and ending at 4:00 PM
    When the user opens the Event Detail Page for that event
    Then the time row displays "2:00 PM - 4:00 PM"
    And no "All Day" capsule is displayed

  Scenario: Timed event with no end time
    Given an event that is not All Day starting at 2:00 PM with no end time
    When the user opens the Event Detail Page for that event
    Then the time row displays "2:00 PM"
    And no "All Day" capsule is displayed

  Scenario: Missing All Day indicator is treated as not All Day
    Given an event whose All Day indicator is absent and which has a start time of 9:30 AM
    When the user opens the Event Detail Page for that event
    Then the time row displays "9:30 AM"
    And no "All Day" capsule is displayed

  Scenario: Date row for Today / Tomorrow is preserved
    Given an All Day event that occurs today
    When the user opens the Event Detail Page for that event
    Then the date row displays "Today"
    And the time row displays the "All Day" capsule

  Scenario: Layout alignment
    Given an All Day event with a location
    When the user opens the Event Detail Page
    Then the capsule appears in the time row beside the clock icon
    And the date row, time row and location row remain in their existing order and alignment

  Scenario: Appearance modes
    Given an All Day event
    When the user opens the Event Detail Page in light appearance and then in dark appearance
    Then the "All Day" text is legible against the capsule in both

  Scenario: Accessibility
    Given an All Day event and VoiceOver is enabled
    When the user focuses the time row
    Then the row is announced as "All Day"

  Scenario: Events list unchanged
    Given an All Day event
    When the user views the Events list
    Then the event is displayed with its existing "All Day" presentation
```

## 6. Non-Functional Requirements

- **Performance:** The detail page must open with no perceptible delay added by this change; the indicator is shown immediately with the rest of the page content.
- **Security / privacy:** No new data is collected or transmitted; no authentication changes required.
- **Scalability:** Not applicable; the change affects only the display of a single event.
- **Reliability:** If the All Day indicator is missing, the page must still render normally (see BR-002).
- **Accessibility:** See BR-006; the capsule text must scale with the user's text-size settings and must not truncate at the largest supported size.
- **Maintainability:** The All Day determination must be consistent across the Events list and detail page, so there is a single definition of "All Day" for users.
- **Observability:** No new logging or analytics are required.

## 7. Edge Cases & Special Scenarios

| Case | Required behavior |
|---|---|
| All Day indicator absent | Treated as not All Day; time shown (BR-002) |
| All Day event with an end date on a later day | Capsule is displayed; no clock time shown |
| All Day event whose stored start is midnight | "12:00 AM" must not appear anywhere in the time row |
| Event with start but no end, not All Day | Start time only |
| Event in the past | Same behavior as upcoming events |
| Event added/removed from calendar via toolbar button | No effect on the time row display |
| Very large text size | Capsule remains fully visible, wrapping or scaling without clipping |

## 8. Out of Scope

- Any change to the Events list, calendar view, or the existing All Day banner in the list.
- Changing how All Day events are created, stored or supplied by the data source.
- Changing the date row, location row, description or buttons.
- Changes to how events are added to the device calendar (including All Day handling there).
- Multi-day range display or time zone handling changes.
- Redesign of the detail page layout.
- Resolving the inference vs. flag question in Section 2 beyond the rule stated in BR-001.

## 9. Success Metrics

- 100% of All Day events show the "All Day" capsule and 0% show a clock time on the detail page (verified in QA against a set of All Day events).
- 0 regressions in timed event display (100% of sampled timed events show identical time text before and after).
- All acceptance criteria above pass in manual QA on light and dark appearance.
- No user-reported confusion about All Day event times after release.

## 10. References

- Issue: ASDLC-562 — "[Events Page] Display (All Day) Indicator Instead of Time on Event Detail Page"
- Repository: https://github.com/gouveiahenrique/berkeley-mobile-ios.git
- Related existing behavior: "All Day" capsule on the Events list.
