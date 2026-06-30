# Business Requirements: ASOS-4
## [Events Page] Display "All Day" Indicator Instead of Time on Event Detail Page

**Issue Key**: ASOS-4  
**Date**: 2026-06-30  
**Status**: Draft  
**Complexity**: S (Small)

---

## 1. Executive Summary

When a campus event is designated as an "All Day" event, the Event Detail Page currently displays a misleading time value (e.g., "12:00 AM") in the time row. This ticket requires the time row on the Event Detail Page to instead display a clearly labeled "All Day" capsule/badge so users understand that the event has no specific start or end time.

---

## 2. Problem Statement

**Current State**: On the Event Detail Page, the time row always renders a formatted time string regardless of whether the event is an all-day event. For all-day events, this produces the nonsensical value "12:00 AM," because all-day events are stored with midnight start times by convention rather than a meaningful clock time.

**Desired State**: When the event is marked as an all-day event, the time row on the Event Detail Page must display an "All Day" indicator (visually styled as a capsule/pill-shaped label) instead of any time string.

**Business Impact**: App users — primarily UC Berkeley students, faculty, and staff — rely on the Events page to plan their day around campus happenings. Displaying "12:00 AM" for all-day events (such as university holidays, enrollment deadlines, and multi-day exhibitions) is confusing and erodes trust in the accuracy of event information.

**Urgency**: The Events list view already correctly identifies all-day events and renders them with an "All Day" banner. The Detail Page is inconsistent with this existing behavior, creating a contradictory experience. Fixing this closes the gap between the two views.

---

## 3. Personas & User Stories

### Primary Persona: App User (Student / Staff / Faculty)
A UC Berkeley community member browsing campus events to decide which to attend or add to their personal calendar.

**User Story 1**:  
> As an app user viewing the detail page of an all-day campus event, I want to see an "All Day" label in the time row so that I know there is no specific start or end time and I do not misinterpret "12:00 AM" as the event's actual start time.

**User Story 2**:  
> As an app user viewing the detail page of a time-specific event, I want to continue seeing the start (and end, if available) time so that I can plan my attendance accurately.

### Secondary Persona: Events Page Viewer (List View)
A user who has already seen the "All Day" banner in the events list and taps through to the detail page, expecting consistency.

**User Story 3**:  
> As a user who saw an "All Day" banner in the event list, I want the detail page to show the same "All Day" designation so that the experience is consistent and I am not confused by a contradictory time value.

---

## 4. System Capability Statements

The following facts about what the system already provides are relevant to scoping this change:

- The event data model already carries an explicit all-day flag for each event. The Event Detail Page must consume this existing flag — no new data retrieval or backend changes are required.
- The `dateString` computed property on an event already embeds an "All Day" token in place of a time string when the all-day conditions are met via start/end time conventions. However, the current Event Detail Page time row parses and displays the time portion of this string unconditionally.
- The Events list view already has a distinct "All Day" capsule/banner component that is used to replace the standard row presentation. The detail page must apply analogous logic for its own time row.
- The date portion of `dateString` (e.g., "Today", "Tomorrow", or a formatted date) is separated from the time portion by a " / " delimiter. The detail page already uses this delimiter to split date from time for separate display.

**Open Question**: It is unclear whether the `isAllDay` flag is the authoritative signal to use for this determination, or whether the time-component matching embedded in `dateString` (midnight start + 11:59:59 PM end) is the canonical check. The technical implementation should clarify which signal is authoritative and whether both can produce inconsistent results. If `isAllDay` can be true while `dateString` does not contain "All Day" (or vice versa), a decision on precedence is required before implementation.

---

## 5. Business Rules

**BR-001**: When an event is an all-day event, the time row on the Event Detail Page MUST display an "All Day" indicator rather than any clock time value.

**BR-002**: The "All Day" indicator MUST be visually styled as a capsule/pill-shaped label to be consistent with the established design pattern used elsewhere in the Events feature.

**BR-003**: When an event is NOT an all-day event, the time row on the Event Detail Page MUST continue to display the event's start time. If an end time exists, it MUST also be displayed (e.g., "10:00 AM - 12:00 PM").

**BR-004**: The date row on the Event Detail Page MUST remain unaffected by this change — it must always display the event date regardless of whether the event is all-day.

**BR-005**: The location row on the Event Detail Page MUST remain unaffected by this change.

**BR-006**: The "All Day" indicator on the detail page MUST use the text label "All Day" (matching the label used in the Events list view).

**BR-007**: If the event's all-day status cannot be determined (e.g., the flag is absent or indeterminate), the system MUST fall back to displaying the time string rather than the "All Day" indicator.

---

## 6. Acceptance Criteria

```gherkin
Feature: All Day Indicator on Event Detail Page

  Background:
    Given the user has navigated to the Events section of the Berkeley Mobile app

  Scenario: Detail page shows "All Day" indicator for an all-day event
    Given an event is marked as an all-day event
    When the user taps the event to open its detail page
    Then the time row displays a capsule-styled "All Day" label
    And the time row does NOT display any clock time value (e.g., "12:00 AM")
    And the date row displays the event date as normal

  Scenario: Detail page shows time for a time-specific event with start and end
    Given an event has a specific start time and a specific end time
    And the event is NOT marked as an all-day event
    When the user taps the event to open its detail page
    Then the time row displays the event's start time and end time (e.g., "10:00 AM - 12:00 PM")
    And no "All Day" label is shown in the time row

  Scenario: Detail page shows time for a time-specific event with start time only
    Given an event has a specific start time
    And the event has no end time
    And the event is NOT marked as an all-day event
    When the user taps the event to open its detail page
    Then the time row displays only the event's start time (e.g., "10:00 AM")
    And no "All Day" label is shown in the time row

  Scenario: Detail page date row is unaffected for all-day events
    Given an event is marked as an all-day event
    When the user taps the event to open its detail page
    Then the date row correctly shows the event date (e.g., "Today", "Tomorrow", or "MM/DD/YYYY")
    And the date row does NOT show any time or "All Day" label

  Scenario: Detail page is consistent with list view for all-day events
    Given an event is marked as an all-day event
    When the user views the event in the Events list
    Then the event is presented with an "All Day" banner in the list
    When the user taps through to the event detail page
    Then the time row shows the "All Day" capsule label
    And no contradictory time value is displayed

  Scenario: Fallback behavior when all-day status is indeterminate
    Given an event whose all-day flag is absent or indeterminate
    When the user taps the event to open its detail page
    Then the time row displays the event's time string as computed from the event's dates
    And no "All Day" label is shown
```

---

## 7. Non-Functional Requirements

**NFR-001 — Consistency**: The "All Day" label text and capsule visual style on the detail page must be consistent with the "All Day" presentation used in the Events list view. A user moving between the two screens must not perceive a discrepancy in meaning or styling.

**NFR-002 — Accessibility**: The "All Day" indicator must be readable by assistive technologies (e.g., screen readers) and must convey the same meaning as visible text — it must not be represented solely as a visual shape without a text label.

**NFR-003 — Performance**: This change involves conditional display logic evaluated locally on the device using data already loaded. No network requests are introduced; no latency impact is acceptable.

**NFR-004 — Localization**: The "All Day" label text must be structured in a way that supports future localization. Currently the app uses "All Day" in English; this requirement must not hardcode the string in a way that forecloses translation.

---

## 8. Edge Cases & Special Scenarios

**EC-001 — Event spans multiple days**: If an event starts on one date and ends on a different date, and is flagged as all-day, the detail page must still display the "All Day" indicator in the time row. The date row should reflect the start date. Behavior for multi-day range display in the date row is out of scope for this ticket.

**EC-002 — All-day flag present but time values are non-zero**: If an event's all-day flag is `true` but the stored time values do not match the expected midnight/11:59 PM convention, the explicit flag takes precedence and the "All Day" indicator must be shown.

**EC-003 — All-day flag absent but time values match all-day convention**: If the all-day flag is not present (nil/unset) but start and end times match the all-day convention (midnight start, 11:59:59 PM end), the system must apply fallback logic. The expected behavior in this case is flagged as an open question (see Section 4) and must be resolved during technical design.

**EC-004 — All-day event with no end time**: If an event is flagged as all-day but has no end date/time stored, the "All Day" indicator must still be shown. The absence of an end time must not cause the row to fall back to displaying a clock time.

**EC-005 — Event name is very long**: The "All Day" indicator must not be visually broken or clipped by a long event name. The indicator is in the time row (not the event name row), so this primarily affects layout stability — the indicator must remain fully visible.

---

## 9. Out of Scope

- **Events list view changes**: The list view already handles all-day events correctly with its own banner component. No changes to the list view are required.
- **Backend or data model changes**: The all-day flag already exists in the event data. No server-side changes are required.
- **Date row display changes**: How the date portion (day/date label) is formatted and shown is unchanged by this ticket.
- **Multi-day event date range display**: Showing "Day 1 - Day 3" or equivalent date ranges in the date row is not in scope.
- **Localization of the "All Day" string into non-English languages**: Structuring the label for localizability is in scope; actually translating it is out of scope.
- **Changes to the "Add to Calendar" behavior**: The event's behavior when added to the device calendar is not affected.
- **All-day event detection logic changes**: The rules for what constitutes an all-day event (flag vs. time-based heuristic) are not being redefined by this ticket — the open question in Section 4 must be resolved in technical design using the existing model.
- **Design changes to any other event detail rows** (location, description, buttons).

---

## 10. Success Metrics

- **SM-001**: Zero user-reported instances of "12:00 AM" appearing in the time row of an all-day event after the fix is released.
- **SM-002**: The time row for all timed events continues to display correct start and end times (no regression).
- **SM-003**: The "All Day" capsule on the detail page is visually indistinguishable in style from the "All Day" presentation in the list view (verified through design review).
- **SM-004**: All acceptance criteria in Section 6 pass manual QA on device before release.

---

## 11. References

- Related existing component: `AllDayEventBannerView` — the existing "All Day" capsule used in the Events list view
- Affected screen: `EventDetailView` / `BMDetailHeaderView` — specifically the `timeView` sub-component
- Event data model: `BMEventCalendarEntry` — carries the `isAllDay` flag and `dateString` computed property
- All-day detection logic: `BMCalendarEvent.dateString` extension — contains the existing time-based all-day heuristic
- Issue repository: https://github.com/gouveiahenrique/berkeley-mobile-ios
