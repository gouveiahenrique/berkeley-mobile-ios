# Business Requirements: ASOS-6
## [Events Page] Display "All Day" Indicator Instead of Time on Event Detail Page

**Issue Key**: ASOS-6
**Date**: 2026-06-30
**Status**: Draft
**Complexity**: S (Small)

---

## 1. Executive Summary

The Event Detail Page currently displays a misleading time value (e.g., "12:00 AM") in the time row when an event is marked as an all-day event. This feature corrects the display so that all-day events clearly communicate their all-day nature by showing a visually distinct "All Day" label in place of the time value. The change removes a source of user confusion and brings the detail page in line with accurate event information.

---

## 2. Problem Statement

**Current State**: When a user opens the detail page for an all-day event, the time row displays a clock icon alongside a specific time (e.g., "12:00 AM – 11:59 PM"). This representation is misleading because all-day events have no specific start or end time that is meaningful to a user.

**Desired State**: When a user views the detail page for an all-day event, the time row must display a clearly styled "All Day" badge or capsule label in place of any time value. The date row continues to display the date as normal.

**Business Impact**: Student and faculty users of the Berkeley Mobile app who browse campus events are shown inaccurate scheduling information, reducing trust in the app and creating confusion about whether they must attend at a specific time. Correcting this display improves user confidence and reduces potential scheduling errors.

**Urgency**: This is an active data accuracy defect affecting every all-day event visible in the app. Users who act on the incorrect "12:00 AM" time shown may arrive at incorrect times or dismiss events as irrelevant.

---

## 3. Personas & User Stories

### Primary Persona: App User (Student / Faculty)
A Berkeley student or faculty member who uses the Events section of Berkeley Mobile to discover and plan attendance at campus events.

**Pain Point**: Sees "12:00 AM" as the time for an event they know is an all-day exhibit or holiday, and is unsure whether the time is significant or erroneous.

**Goal**: Immediately understand, at a glance on the detail page, that an event spans the full day with no specific time commitment.

**User Story**:
> As a Berkeley Mobile user browsing an all-day campus event, I want the event detail page to clearly show "All Day" instead of a time value, so that I understand the event has no specific start or end time and I am not misled into arriving at 12:00 AM.

### Secondary Persona: Event Organizer / Content Publisher
A campus office or student organization that publishes events tagged as "all day" in the events system.

**Pain Point**: Their event is displayed with a time value that they did not specify, which misrepresents the event to attendees.

**Goal**: Have the app accurately reflect the all-day nature of their published event.

---

## 4. System Capability Statements

The following facts about the system constrain responsibility boundaries and must inform implementation:

- **All-day detection is already handled by the data layer**: The event data model exposes an explicit `isAllDay` flag provided by the backend. The system does not need to infer all-day status from time values; the flag is the authoritative source of truth.
- **A secondary all-day detection mechanism exists in the shared date string logic**: An event whose start time is midnight (00:00:00) and end time is 11:59:59 PM on the same day is also treated as all-day by the existing date string computation, which already produces "All Day" as the time portion of the formatted date string.
- **Open Question**: It is not confirmed whether `isAllDay` is always populated when the backend intends an event to be all-day, or whether the time-component heuristic (midnight start / 11:59 PM end) is the only reliable signal in all cases. The technical implementation must determine which signal — or combination of signals — to use as the authoritative source for the detail page display.

---

## 5. Business Rules

**BR-001**: When an event is classified as an all-day event, the time row on the Event Detail Page must display an "All Day" label and must not display any specific time value (e.g., "12:00 AM", "12:00 AM – 11:59 PM").

**BR-002**: The "All Day" label must be visually distinct from plain text — it must be rendered as a capsule or pill-shaped badge — to clearly communicate that it is a special category indicator, not a time string.

**BR-003**: The date row on the Event Detail Page must continue to display the event's date (or "Today" / "Tomorrow" relative label) regardless of whether the event is all-day.

**BR-004**: For events that are NOT classified as all-day, the time row must continue to display the event's start time and, where available, the end time, exactly as it does today. This change must not alter behavior for timed events.

**BR-005**: The "All Day" badge must be displayed within the existing time row area (clock icon row), replacing the time text. The layout of the detail page must not change for non-all-day events.

**BR-006**: The "All Day" label text must read exactly "All Day" (title case, two words) for consistency with existing in-app usage of this label (as seen in the events list banner and the shared date string).

---

## 6. Acceptance Criteria

```gherkin
Feature: All Day Indicator on Event Detail Page

  Scenario: All-day event detail page shows "All Day" badge instead of a time
    Given an event that is classified as an all-day event
    When a user opens the Event Detail Page for that event
    Then the time row displays a capsule/pill-shaped "All Day" badge
    And the time row does not display any time value (e.g., "12:00 AM")
    And the date row displays the event's date or relative label (e.g., "Today", "Tomorrow", or a date)

  Scenario: Timed event detail page continues to show the time unchanged
    Given an event that has a specific start time and is not classified as all-day
    When a user opens the Event Detail Page for that event
    Then the time row displays the event's start time
    And if the event has an end time, the time row also displays the end time in "start – end" format
    And the time row does not show an "All Day" badge

  Scenario: Timed event with no end time shows only the start time
    Given an event that has a start time but no end time and is not classified as all-day
    When a user opens the Event Detail Page for that event
    Then the time row displays only the start time
    And no end time or dash separator is shown

  Scenario: All-day event with no location still displays correctly
    Given an event that is classified as an all-day event
    And the event has no location specified
    When a user opens the Event Detail Page for that event
    Then the "All Day" badge is displayed in the time row
    And no location row is shown
    And no other rows are affected

  Scenario: All-day event with location displays both correctly
    Given an event that is classified as an all-day event
    And the event has a location specified
    When a user opens the Event Detail Page for that event
    Then the "All Day" badge is displayed in the time row
    And the location row displays the event location
    And the layout of other detail rows is unchanged

  Scenario: All-day event appears consistently on list view and detail view
    Given an event classified as all-day
    When a user views the event in the events list
    And then opens its Event Detail Page
    Then both views communicate the event as all-day
    And neither view displays a specific clock time for the event
```

---

## 7. Non-Functional Requirements

**NFR-001 — Visual Consistency**: The "All Day" capsule badge on the detail page must be visually consistent with the existing "All Day" banner label used on the events list, in terms of label text and general shape (capsule/pill style). Exact sizing and color may be adapted to fit the detail page context.

**NFR-002 — Accessibility**: The "All Day" badge must be accessible to assistive technologies (e.g., screen readers). It must be announced as "All Day" — not as a button or interactive element — when a user navigates to the time row.

**NFR-003 — No Performance Impact**: This is a purely presentational change. It must introduce no additional data fetching, network calls, or processing overhead. The all-day determination must be made solely from data already available when the detail view is rendered.

**NFR-004 — No Regression**: The change must not alter the display of timed events on the detail page. All existing rendering behavior for non-all-day events must remain identical.

---

## 8. Edge Cases & Special Scenarios

**EC-001 — `isAllDay` flag is nil or absent**: If the event's all-day flag is not set (nil), the system must fall back to the time-component heuristic (midnight start / 11:59:59 PM end) to determine whether the event should be treated as all-day on the detail page. If neither signal is conclusive, the event must be treated as a timed event and display the time value.

> **Open Question (flagged)**: The authoritative signal for all-day classification on the detail page — `isAllDay` flag, time-component heuristic, or both in combination — must be confirmed during technical specification. The business intent is: any event the system considers all-day must display "All Day", regardless of which signal the system uses to determine that.

**EC-002 — All-day event with no end date**: If an all-day event has no end date, the detail page must still display the "All Day" badge. The absence of an end date must not cause the time row to fall back to displaying a time value.

**EC-003 — Multi-day all-day events**: If an all-day event spans multiple days (e.g., a week-long holiday), the date row must display the full date range or the start date as applicable, and the time row must still show only the "All Day" badge — no time values on either end.

> **Open Question (flagged)**: The current date string format ("Today / All Day") only surfaces the start date. If multi-day events exist, how the date range should be surfaced on the detail page is not defined by this issue and is considered out of scope unless explicitly scoped in.

**EC-004 — Event transitions from all-day to timed (data refresh)**: If the app refreshes event data and an event that was previously displayed as all-day is now timed (or vice versa), the detail page must reflect the updated state after the refresh, consistent with the updated data.

---

## 9. Out of Scope

The following items are explicitly not part of this feature:

- Changes to how all-day events are displayed on the **events list view** or calendar view — those surfaces are not affected by this issue.
- Changes to how all-day events are displayed on the **event row** in the list.
- Changes to how events are **added to the device calendar** — the calendar add/remove behavior is unaffected.
- Changes to **how the backend identifies or flags all-day events** — this is a display-only change on the client.
- Introducing a new all-day detection algorithm or modifying the existing date string computation shared across event types.
- Multi-day event date range display (how to show start–end dates for week-long events) — this is a separate, unscoped concern.
- Localization or translation of the "All Day" label into other languages — not in scope unless explicitly requested.
- Any changes to event filtering, sorting, or data fetching.

---

## 10. Success Metrics

- **SM-001**: Zero users encounter the "12:00 AM" time display for a confirmed all-day event after the fix is deployed.
- **SM-002**: QA verification passes with 100% of all-day event test cases showing the "All Day" capsule badge and 0% showing a time value.
- **SM-003**: QA verification confirms 0 regressions in timed event display on the detail page.
- **SM-004**: The "All Day" badge meets accessibility audit standards (screen reader announces label text correctly).

---

## 11. References

- **Related In-App Component**: `AllDayEventBannerView` — existing "All Day" capsule component used on the events list; serves as a visual and textual reference for consistency.
- **Affected View**: Event Detail Page (`EventDetailView` and `BMDetailHeaderView`) — specifically the time row within the header card.
- **Data Model**: `BMEventCalendarEntry.isAllDay` flag and `BMCalendarEvent.dateString` computed property — the two existing signals for all-day classification.
- **Repository**: berkeley-mobile-ios (ASUC OCTO)
