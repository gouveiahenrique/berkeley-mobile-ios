# Business Requirements: Display "All Day" Indicator on Event Detail Page

**Issue**: ASDLC-511
**Date**: 2026-08-06
**Status**: Draft

---

## 1. Executive Summary

When a user views the detail page for an all-day event in the Berkeley Mobile app, the time row currently displays a misleading time value (e.g., "12:00 AM") instead of indicating that the event spans the full day. This specification defines the requirement to replace that time display with a clearly labeled "All Day" indicator — styled as a capsule/pill badge — so that users correctly understand the event's temporal scope at a glance.

---

## 2. Problem Statement

**Current State**: The Event Detail Page contains a time row that always renders a clock icon and a time string derived from the event's date data. For all-day events, this string resolves to "12:00 AM," which is a technically derived value but is factually incorrect and misleading to users — all-day events have no meaningful start or end time.

**Desired State**: When an event is marked as all-day, the time row must display a visually distinct "All Day" indicator (capsule/pill label) in place of the time value. No time string (start or end) must appear for all-day events on this page.

**Business Impact**: Users reading event details rely on the time row to understand scheduling. Displaying "12:00 AM" for all-day events creates confusion, erodes trust in the app, and may cause users to misread event timing (e.g., planning to attend at midnight). Correcting this display directly improves the reliability and clarity of event information.

**Urgency**: This is a correctness defect affecting every all-day event in the app. It impacts user comprehension on every visit to an all-day event detail page and warrants prompt resolution.

---

## 3. Personas & User Stories

### Primary Persona: Berkeley Student / Attendee
A student browsing upcoming UC Berkeley events who opens an event detail page to decide whether and when to attend.

- **Need**: Accurate, at-a-glance event timing information.
- **Pain Point**: Seeing "12:00 AM" on an all-day event leads them to believe the event starts at midnight, causing scheduling confusion or missed attendance.
- **Goal**: Immediately understand that no specific time is required — the event is available all day.

**User Story**:
> As a student viewing an all-day event's detail page, I want to see a clear "All Day" label in the time row so that I am not misled into thinking the event starts at a specific time.

### Secondary Persona: Event Browser (general app user)
Any app user browsing the events section — including faculty, staff, or community members — who views event details to plan attendance.

- **Need**: Consistent, trustworthy display of event timing.
- **Goal**: Confidently distinguish timed events from all-day events without needing to read a description.

---

## 4. Business Rules

**BR-001**: An event must be treated as all-day when the system indicates it spans the entire day with no specific start or end time. The determination of whether an event is all-day is made by the data provided for that event — the display layer must respect and reflect this classification without re-computing it.

**BR-002**: When an event is classified as all-day, the time row on the Event Detail Page must display an "All Day" indicator and must not display any specific time value (neither start time nor end time).

**BR-003**: When an event is NOT classified as all-day, the time row must continue to display the event's start time, and the end time if one exists. No change to timed-event behavior is permitted as part of this feature.

**BR-004**: The "All Day" indicator must be visually distinct from plain text — it must use a capsule/pill shape to set it apart from the date row and communicate its categorical nature.

**BR-005**: The "All Day" indicator must display the label text "All Day" (exact casing). No abbreviations or alternate labels are permitted.

**BR-006**: The time row must remain visible for all-day events (it must not be hidden); only its content changes from a time string to the "All Day" indicator. The clock icon and row structure are retained so layout consistency is maintained.

**BR-007**: The all-day classification of an event is determined by data provided to the detail view — the Event Detail Page must not independently re-derive or override this classification.

---

## 5. Acceptance Criteria

```gherkin
Feature: All Day Indicator on Event Detail Page

  Scenario: All-day event shows "All Day" indicator in time row
    Given a user navigates to the Event Detail Page for an all-day event
    When the detail page is displayed
    Then the time row must show an "All Day" capsule/pill indicator
    And the time row must not show any time value (e.g., "12:00 AM", "12:00 AM - 11:59 PM")
    And the capsule/pill indicator must contain the text "All Day"

  Scenario: Timed event continues to show start and end times
    Given a user navigates to the Event Detail Page for a timed event with a start time and end time
    When the detail page is displayed
    Then the time row must show the event's start time
    And the time row must show the event's end time
    And the time row must not show an "All Day" indicator

  Scenario: Timed event with no end time shows only start time
    Given a user navigates to the Event Detail Page for a timed event with only a start time and no end time
    When the detail page is displayed
    Then the time row must show the event's start time
    And the time row must not show an end time
    And the time row must not show an "All Day" indicator

  Scenario: All-day indicator is visually distinct from adjacent date row
    Given a user views the Event Detail Page for an all-day event
    When the time row is displayed
    Then the "All Day" label must be enclosed in a visible capsule or pill shape
    And the capsule must be visually distinguishable from the plain-text date row above it

  Scenario: Time row remains present for all-day events
    Given a user views the Event Detail Page for an all-day event
    When the detail page is displayed
    Then the time row must be visible (not hidden or removed from layout)
    And the time row must contain the "All Day" capsule indicator in place of a time string

  Scenario: All-day classification is read from event data, not re-derived on the detail page
    Given an event is provided to the detail page with its all-day status set
    When the detail page renders the time row
    Then the page must use the all-day classification as provided by the event data
    And must not independently check start/end times to determine all-day status
```

---

## 6. Non-Functional Requirements

**Performance**:
- The "All Day" indicator must render as part of the normal page load with no perceptible additional delay. The classification check is a simple conditional — it must not introduce any loading state or async behavior.

**Accessibility**:
- The "All Day" capsule must be accessible to screen readers. It must be readable as "All Day" by assistive technologies, not just rendered visually. The label text "All Day" must be the accessible description of the element.

**Visual Consistency**:
- The capsule/pill indicator must align with the existing design language of the app. Its size, font weight, and shape must be consistent with similar badge-style indicators used elsewhere in the app (such as `AllDayEventBannerView`, which already uses the capsule pattern and the label "All Day").
- The indicator must display correctly across all supported device sizes and in both light and dark mode.

**Maintainability**:
- The all-day display logic must be contained within the Event Detail Page's time row rendering. It must not scatter display-specific logic into the event data model or other unrelated views.

**Reliability**:
- The indicator must appear correctly every time an all-day event is opened, with no intermittent fallback to showing a time value.

---

## 7. Edge Cases & Special Scenarios

**EC-001 — All-day flag present but start/end times are non-standard**: If an event carries an explicit all-day classification in its data, the "All Day" indicator must be shown regardless of what time values happen to be stored on the event object. The explicit classification takes precedence.

**EC-002 — All-day flag absent or nil**: If the all-day status is not set on an event (nil or absent), the time row must fall back to the normal time display behavior (show start time and end time if available). It must not infer all-day status from time values in this fallback path.

**EC-003 — All-day event with no location**: The "All Day" indicator must render correctly even when the location row is absent. The time row must not shift layout or break when the location row is hidden.

**EC-004 — All-day event with a description**: When both the "All Day" indicator and a description section are present, both must display correctly without overlap or layout breakage.

**EC-005 — All-day event with "Learn More" or "Register" buttons**: The presence of action buttons must not affect the time row's display of the "All Day" indicator, and vice versa.

**EC-006 — Event list (row) view**: The `dateString` property used in the event row list view already produces "All Day" text for all-day events via existing logic. This specification concerns only the Event Detail Page's time row rendering — the list row is out of scope and must not be modified.

---

## 8. Out of Scope

- **Changes to the event list/row view**: The event row (shown in the events list) already handles all-day display via the `dateString` property. No changes to that view are required or permitted.
- **Changes to how all-day status is determined**: The logic that classifies an event as all-day lives in the data layer. This specification only covers how the Event Detail Page displays that classification — not how it is computed or stored.
- **Notification or calendar integration**: How all-day events appear in the device calendar or in push notifications is out of scope.
- **New event creation or editing**: This feature is read-only display only. No changes to event creation, editing, or data entry flows are included.
- **All-day banner in the calendar/scrolling view**: The `AllDayEventBannerView` used in the calendar section is a separate component with different purpose and layout. It must not be modified as part of this work.
- **Changes to the date row**: Only the time row is affected. The date row display (showing "Today", "Tomorrow", or a date string) must remain unchanged.
- **Backend or data model changes**: The all-day field already exists in the event data model. No backend changes are required.

---

## 9. Success Metrics

- **Zero "12:00 AM" displays on all-day event detail pages**: After the fix, no all-day event must show a numeric time in the time row. This can be verified by manual testing against known all-day events.
- **Regression-free timed events**: All timed event detail pages must continue to display correct start and end times after the change, verified by testing against known timed events.
- **Accessibility compliance**: The "All Day" indicator must be readable by assistive technologies, verified via accessibility audit (e.g., VoiceOver on device).
- **Visual consistency in light and dark mode**: The capsule indicator must render correctly in both appearance modes, verified by visual inspection on device or simulator.
- **No layout breakage in edge cases**: Events missing location, description, or action buttons must render the "All Day" indicator without layout issues.

---

## 10. References

- **ASDLC-511**: Source issue — "[Events Page] Display (All Day) Indicator Instead of Time on Event Detail Page"
- **AllDayEventBannerView**: Existing component in the app already using capsule style with "All Day" text — serves as the visual reference for the indicator design.
- **BMCalendarEvent.dateString**: Existing protocol extension that already produces "All Day" as the time portion of `dateString` when the event meets the all-day time criteria (start at 00:00:00, end at 23:59:59). The Event Detail Page's `timeView` currently extracts the time portion of this string — but the string-splitting approach does not distinguish all-day from timed events at the rendering layer, which is the root cause of this defect.
- **BMEventCalendarEntry.isAllDay**: Explicit boolean field on the event model that carries the authoritative all-day classification from the data source. This field must be the primary signal used by the detail page time row to determine whether to show the "All Day" indicator.

---

## Open Questions

**OQ-001 — Authoritative all-day signal**: The event model contains two potential signals for all-day status: (a) the `isAllDay` boolean field, and (b) the time-component heuristic embedded in `dateString`. It must be confirmed with the backend/data team which signal is authoritative for determining all-day display on the detail page. If `isAllDay` can be nil for events sourced from some data providers, the fallback behavior (use heuristic vs. default to timed display) must be defined before implementation.

**OQ-002 — Clock icon retention**: BR-006 states the clock icon is retained for layout consistency when showing the "All Day" indicator. If the design team prefers to hide or replace the clock icon for all-day events, this must be confirmed before implementation to avoid rework.
