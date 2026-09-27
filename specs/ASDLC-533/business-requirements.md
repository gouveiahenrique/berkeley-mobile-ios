# Business Requirements: Display "All Day" Indicator on Event Detail Page

**Issue Key**: ASDLC-533  
**Summary**: Display "All Day" Indicator Instead of Time on Event Detail Page  
**Date**: 2026-09-27  
**Status**: Draft  
**Complexity**: S (Small)

---

## 1. Executive Summary

When a campus event is designated as an all-day event, the Event Detail Page incorrectly displays a clock time (e.g., "12:00 AM") in the time row instead of communicating that the event spans the entire day. This change replaces the misleading time value with a visually distinct "All Day" capsule/badge, so users immediately understand the event has no specific start or end time.

---

## 2. Problem Statement

**Current State**: On the Event Detail Page, the time row always renders a clock-formatted time string. For all-day events, this produces a misleading "12:00 AM" display because all-day events are stored with a midnight timestamp and no meaningful time. The `isAllDay` flag carried by events is not reliably honored when constructing the displayed time value.

**Desired State**: When an event is marked as all-day, the time row must display a visually distinct "All Day" capsule/badge — no clock time at all. Events with specific times continue to display the start and end times as before.

**Business Impact**:
- Users making scheduling decisions are misled by a "12:00 AM" display for events that have no time constraint.
- The inconsistency erodes trust in the Events feature within Berkeley Mobile.
- Fixing this aligns the detail view with how all-day events are already surfaced elsewhere in the app (the app already has an "All Day" banner component for event lists).

**Urgency**: Low-severity display defect; no data loss or security impact. Resolving it prevents ongoing user confusion for any all-day event viewed on the detail page.

---

## 3. Personas & User Stories

### Primary Persona: Berkeley Student / Campus Community Member

A student browsing campus events uses Berkeley Mobile to discover what's happening today. They tap an all-day event (e.g., an exhibit or holiday) and see "12:00 AM" in the time row, which is confusing — they may think the event starts at midnight or that they're looking at wrong information.

**User Story**:  
> As a student viewing an event on the Event Detail Page, I want to see an "All Day" indicator when an event has no specific start or end time, so that I immediately understand the event is available all day without a fixed schedule.

### Secondary Persona: Event Organizer (Indirect)

Event organizers submit all-day events through the Berkeley Events system. They expect their event to be displayed accurately in Berkeley Mobile. Showing "12:00 AM" misrepresents the event's schedule.

---

## 4. Business Rules

**BR-001**: An event is classified as an all-day event when its `isAllDay` flag is explicitly set to true by the data source. This flag is the authoritative signal for all-day status; time component inspection is a fallback only when the flag is absent.

**BR-002**: When an event is classified as all-day (per BR-001), the time row on the Event Detail Page must display an "All Day" capsule/badge. No clock time value must appear in this row.

**BR-003**: The "All Day" capsule/badge must be visually distinct from plain text — rendered as a pill/capsule shape — to differentiate it clearly from standard time ranges.

**BR-004**: When an event is not classified as all-day, the time row must continue to display the event's start time and end time (if available) exactly as it does today.

**BR-005**: The "All Day" badge must use the word "All Day" as its label (consistent with the label already used in other all-day event surfaces within the app).

**BR-006**: The date row (showing the calendar date or "Today"/"Tomorrow") must remain unaffected by this change; it must continue to display the event date regardless of all-day status.

**BR-007**: If an event has no end date, the time row continues to display only the start time (unchanged from current behavior for non-all-day events).

**Open Question OQ-001**: When the `isAllDay` flag is absent (nil) but the time components indicate midnight-to-end-of-day, should the event be treated as all-day? The current codebase uses a time-component fallback for `dateString`, but whether this fallback should also trigger the "All Day" badge on the detail page must be confirmed by the product owner before implementation.

---

## 5. Acceptance Criteria

```gherkin
Feature: All Day Indicator on Event Detail Page

  Scenario: All-day event displays "All Day" capsule in the time row
    Given a user has navigated to the Event Detail Page for an event
    And the event is marked as an all-day event
    When the time row is rendered
    Then a capsule/pill-shaped "All Day" badge is displayed in the time row
    And no clock time value (e.g., "12:00 AM") is visible in the time row

  Scenario: All-day event retains normal date display
    Given a user has navigated to the Event Detail Page for an event
    And the event is marked as an all-day event
    When the Event Detail Page is rendered
    Then the date row shows the correct calendar date (or "Today" / "Tomorrow" as appropriate)
    And the date row is unaffected by the all-day status

  Scenario: Timed event continues to show start and end times
    Given a user has navigated to the Event Detail Page for an event
    And the event has a specific start time and end time
    And the event is NOT marked as an all-day event
    When the time row is rendered
    Then the time row displays the formatted start time and end time
    And no "All Day" badge is displayed

  Scenario: Timed event with no end time shows only start time
    Given a user has navigated to the Event Detail Page for an event
    And the event has a specific start time but no end time
    And the event is NOT marked as an all-day event
    When the time row is rendered
    Then the time row displays only the formatted start time
    And no "All Day" badge is displayed

  Scenario: "All Day" badge is visually distinct from plain text
    Given a user is viewing an all-day event on the Event Detail Page
    When the time row is rendered
    Then the "All Day" label is enclosed in a capsule/pill-shaped container
    And the visual style (shape) makes it distinguishable from the plain date and location rows

  Scenario: Event detail page renders correctly when event has no location
    Given a user has navigated to the Event Detail Page for an all-day event
    And the event has no location set
    When the Event Detail Page is rendered
    Then the "All Day" badge is still displayed correctly in the time row
    And the location row is absent (unchanged behavior)
```

---

## 6. Non-Functional Requirements

**NFR-001 — Consistency**: The "All Day" label and capsule visual style must be consistent with the existing "All Day" presentation used in other event list surfaces within the app, preserving a unified design language.

**NFR-002 — Accessibility**: The "All Day" capsule must be readable by screen readers with a label equivalent to "All Day" so that users relying on assistive technology receive accurate information.

**NFR-003 — Performance**: The change must not introduce any measurable rendering delay on the Event Detail Page. The all-day determination is made from data already loaded; no additional network requests are required.

**NFR-004 — Backward Compatibility**: Events without an explicit `isAllDay` flag must behave identically to how they behave today (no regression for existing timed events).

---

## 7. Edge Cases & Special Scenarios

**EC-001 — isAllDay flag is nil (absent)**: When the `isAllDay` property is not set (nil), the system must fall back to the existing time-based all-day detection logic. The product owner must confirm (OQ-001) whether this fallback should also render the "All Day" badge on the detail page or only plain text.

**EC-002 — isAllDay is true but event has no end date**: The event must still display the "All Day" badge. The absence of an end date does not change the all-day classification.

**EC-003 — isAllDay is false but time components appear all-day**: The event must display its time value, not the "All Day" badge. The `isAllDay` flag takes precedence over time component heuristics when it is explicitly false.

**EC-004 — Event with extremely long name**: The capsule/badge containing "All Day" must not be distorted or clipped by a long event name. The layout must handle truncation of the event name without affecting the badge display.

**EC-005 — Event occurs "Today" and is all-day**: The date row shows "Today" and the time row shows the "All Day" badge. Both rows must render correctly together.

---

## 8. Out of Scope

- Changes to the Events list view or calendar view — this requirement applies only to the **Event Detail Page**.
- Changes to how all-day events are stored, fetched, or created — the data source is not modified.
- Changes to the "All Day" banner/label displayed in event list rows — that surface already works correctly.
- Adding new event types or categories.
- Modifying the all-day detection logic used for adding events to the device calendar.
- Internationalizing or translating the "All Day" label (not in scope for this change).

---

## 9. Success Metrics

- **SM-001**: Zero instances of "12:00 AM" appearing in the time row for events where `isAllDay` is true, verified through manual QA on the Event Detail Page.
- **SM-002**: All-day events display the "All Day" capsule/badge in 100% of cases where `isAllDay` is true.
- **SM-003**: No regression reported for timed events — the time row continues to show correct start/end times for non-all-day events.
- **SM-004**: The "All Day" capsule is visually consistent with the existing all-day indicator used elsewhere in the Events feature.

---

## 10. References

- Related issue: Events Page all-day detection logic in `BMCalendarEvent` protocol (existing fallback based on time components at midnight / 11:59 PM)
- `BMEventCalendarEntry` model carries an explicit `isAllDay: Bool?` field (supplied by the backend) that must be honored as the primary signal (BR-001)
- Existing `AllDayEventBannerView` component in the Events section uses a capsule shape and "All Day" label — the detail page badge must align with this established visual pattern
- Repository: https://github.com/gouveiahenrique/berkeley-mobile-ios
