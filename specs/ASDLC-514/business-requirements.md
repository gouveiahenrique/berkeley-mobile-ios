# Business Requirements: Display "All Day" Indicator on Event Detail Page

**Issue Key**: ASDLC-514
**Date**: 2026-08-18
**Status**: Ready for Technical Implementation
**Complexity**: S (Small)

---

## 1. Executive Summary

When a campus event is marked as "All Day," the Event Detail Page currently shows a specific time value (e.g., "12:00 AM") in the time row, which is factually incorrect and misleading. The time row must instead display a clearly styled "All Day" indicator — visually consistent with the capsule/pill label style already used elsewhere in the app — to accurately communicate that the event spans the entire day without a defined start or end time.

---

## 2. Problem Statement

**Current State**: The Event Detail Page displays a time row (with a clock icon) that shows a specific time value such as "12:00 AM" even when the event has been designated as an all-day event. This occurs because the detail view renders the time portion of the event's date string without accounting for the all-day flag, leading it to display the raw midnight start time associated with all-day events in the system.

**Desired State**: When an event is designated as all-day, the time row on the Event Detail Page must show an "All Day" capsule/badge indicator in place of any time value. No specific time should be visible for all-day events.

**Business Impact**:
- Users are misled into believing an all-day event starts at 12:00 AM.
- This undermines trust in the accuracy of event information displayed in the app.
- The inconsistency is jarring given that the event list view already shows all-day events with a distinct visual treatment; the detail view contradicts this.

**Urgency**: The bug exists today and affects every all-day event in the app. Any user who taps into the detail of an all-day event is shown incorrect time information. No new infrastructure is needed — the fix is contained to the detail page display logic.

---

## 3. Personas & User Stories

### Primary Persona: Berkeley Mobile App User
A UC Berkeley student, staff member, or community member browsing campus events. They use the app to discover what's happening on campus, check event details, and decide whether to attend.

**User Stories**:

- As a user viewing the Event Detail Page, I want to clearly see when an event is all-day so that I don't mistake it for an event starting at midnight.
- As a user who has already seen an event listed as "All Day" in the events list, I want the detail page to show consistent information so that I trust the app's accuracy.
- As a user planning my day, I want the time display on all-day events to be unambiguous so that I don't miscalculate when I need to arrive.

---

## 4. System Capability Statements

The following facts are established by examining the existing system and govern how responsibility is divided:

- **The backend provides the all-day designation directly.** Each event record includes an explicit all-day flag supplied by the data source. The client must not attempt to infer all-day status from start/end time values.
- **The event list view already enforces the all-day distinction.** When displaying events in list form, the app already shows all-day events with a dedicated capsule-style banner ("All Day") and omits the standard time-based event row. The detail view must be brought into consistency with this behavior.
- **The all-day flag may be absent (null/unset).** When the flag is absent or false, the event has explicit start and end times that must continue to be displayed normally. No change is required for non-all-day events.
- **The time row currently derives its content from a formatted date string** that concatenates the date and the time, separated by a delimiter. When the all-day flag is true, the time segment of this string may still contain a midnight time value rather than "All Day," depending on the event's underlying time data. The fix must use the authoritative all-day flag rather than relying on time-string parsing.

---

## 5. Business Rules

**BR-001**: When an event's all-day flag is explicitly set to `true`, the Event Detail Page time row **must not** display any clock time (e.g., "12:00 AM", "8:00 AM - 5:00 PM").

**BR-002**: When an event's all-day flag is explicitly set to `true`, the Event Detail Page time row **must** display an "All Day" label styled as a capsule/pill-shaped badge.

**BR-003**: The "All Day" capsule on the detail page **must** use a visual style consistent with the existing all-day indicator used in the event list view (capsule shape, same label text "All Day").

**BR-004**: When an event's all-day flag is `false` or absent, the time row **must** continue to display the event's start time and end time (if available) exactly as it does today — this change must not affect timed events.

**BR-005**: The determination of whether an event is all-day **must** be based solely on the authoritative all-day flag provided by the backend, not on whether the event's time happens to be midnight or any other heuristic.

**BR-006**: The clock icon accompanying the time row **must** remain visible alongside the "All Day" capsule, preserving the established visual pattern for the time information row.

---

## 6. Acceptance Criteria

```gherkin
Feature: All Day Indicator on Event Detail Page

  Scenario: All-day event shows "All Day" capsule in time row
    Given the user is viewing the Event Detail Page
    And the event is marked as an all-day event
    When the detail page renders the time row
    Then the time row displays an "All Day" capsule/badge label
    And the time row does not display any clock time value (e.g., "12:00 AM")
    And the clock icon is still visible in the time row

  Scenario: Timed event continues to show start and end time
    Given the user is viewing the Event Detail Page
    And the event is NOT marked as an all-day event
    And the event has a defined start time and end time
    When the detail page renders the time row
    Then the time row displays the event's start time and end time
    And no "All Day" capsule is shown

  Scenario: Timed event with start time only continues to show start time
    Given the user is viewing the Event Detail Page
    And the event is NOT marked as an all-day event
    And the event has a defined start time but no end time
    When the detail page renders the time row
    Then the time row displays only the event's start time
    And no "All Day" capsule is shown

  Scenario: All-day flag absent or null treats event as timed
    Given the user is viewing the Event Detail Page
    And the event's all-day flag is absent or null
    When the detail page renders the time row
    Then the time row displays the event's time information normally
    And no "All Day" capsule is shown

  Scenario: "All Day" capsule is visually consistent with event list treatment
    Given the user has seen an event in the event list marked as "All Day"
    When the user taps into that event's detail page
    Then the detail page displays an "All Day" label in a capsule/pill shape
    And the capsule visual style (shape, label text) is consistent with the all-day treatment in the event list view

  Scenario: All-day event has no misleading time shown anywhere in time row
    Given the user is viewing the Event Detail Page for an all-day event
    When the user reads the time row
    Then the user sees only the "All Day" capsule
    And no numeric time (e.g., "12:00 AM", "00:00") is visible anywhere in the time row
```

---

## 7. Non-Functional Requirements

**Consistency**: The "All Day" indicator on the detail page must match the established visual language of the existing all-day capsule used in the events list, ensuring a coherent user experience across screens.

**Correctness**: The fix must use the authoritative all-day flag from the data model. No fallback heuristic based on time values (e.g., checking for midnight) is acceptable as the primary signal, as such heuristics can produce false positives and false negatives.

**No Regression**: The change must not alter the display of timed events in any way. All timed event behavior — including events with only a start time, events with start and end times, and events where the all-day flag is null/absent — must remain exactly as it is today.

**Accessibility**: The "All Day" capsule text must be readable by assistive technologies (screen readers) to ensure visually impaired users receive the same information as sighted users.

---

## 8. Edge Cases & Special Scenarios

| Scenario | Expected Behavior |
|---|---|
| `isAllDay` is `true`, but event also has time values in the data | Show "All Day" capsule only; ignore and never display the time values |
| `isAllDay` is `null` (not set by backend) | Treat as timed event; display time normally |
| `isAllDay` is `false` | Treat as timed event; display time normally |
| All-day event with no location | Time row shows "All Day" capsule; location row is omitted (unchanged behavior) |
| All-day event tapped from event list "All Day" banner | Detail page must show "All Day" in time row — must not suddenly show "12:00 AM" |
| All-day event with no end time | Show "All Day" capsule; the absence of end time is not surfaced to the user |

---

## 9. Out of Scope

The following are explicitly **not** part of this feature:

- Changes to how all-day events appear in the **event list view** — the list already handles this correctly and must not be modified as part of this work.
- Changes to how all-day events are **added to the device calendar** — calendar export behavior is unrelated to this display fix.
- Changes to the **date row** (the calendar icon row showing the event date) on the Event Detail Page.
- Changes to the **event list's** `AllDayEventBannerView` component — reuse is acceptable, but modifications to it are out of scope unless required for the detail page use case.
- Introducing a new all-day detection heuristic (e.g., midnight-to-midnight time range) — the existing backend flag is the authoritative source and must be used as-is.
- Changes to backend data or how the `isAllDay` field is set or sourced.
- Changes to any other page or screen beyond the Event Detail Page time row.

---

## 10. Success Metrics

| Metric | Target |
|---|---|
| All-day events on detail page show "All Day" capsule | 100% of all-day events |
| All-day events on detail page show no clock time value | 0 occurrences of a time value alongside "All Day" |
| Timed events on detail page unaffected | 0 regressions in timed event display |
| Visual consistency: "All Day" capsule style matches list view treatment | Confirmed by design/QA review |
| Accessible label available to screen readers for "All Day" indicator | 100% |

---

## 11. References

- **Related screen**: Event List View — already correctly differentiates all-day events using a capsule banner (reference for consistent styling)
- **Data model**: Event data includes an explicit all-day boolean flag sourced from the backend — this is the authoritative signal for all-day determination
- **Existing component**: An "All Day" capsule visual component already exists in the codebase (used in the event list view) and must be referenced for visual consistency on the detail page
- **Issue**: ASDLC-514 — [Events Page] Display (All Day) Indicator Instead of Time on Event Detail Page
