# Business Requirements: ASOS-7
## [Events Page] Display "All Day" Indicator Instead of Time on Event Detail Page

**Issue Key**: ASOS-7  
**Date**: 2026-07-01  
**Status**: Draft  
**Complexity**: S (Small)

---

## 1. Executive Summary

When a user opens the detail page for an event that spans the entire day, the time row currently displays a misleading time value (e.g., "12:00 AM") instead of communicating that no specific start/end time applies. This change replaces that time value with a visually distinct "All Day" indicator — presented as a capsule/pill-shaped label — so users immediately understand the event's all-day nature without confusion.

---

## 2. Problem Statement

**Current State**: The Event Detail Page always renders a time row showing a formatted time string (e.g., "12:00 AM"). For all-day events, this time value is an artifact of how all-day events are stored (midnight start) and does not represent a meaningful time to the user.

**Desired State**: When an event is flagged as all-day, the time row on the Event Detail Page displays an "All Day" capsule/badge instead of any time string.

**Business Impact**:
- Users viewing all-day events (e.g., academic calendar holidays, enrollment deadlines, campus-wide all-day events) see an inaccurate "12:00 AM" time, which erodes trust in the app's data accuracy.
- The fix eliminates user confusion and aligns the detail page with the clear, badge-based "All Day" language already used elsewhere in the Events feature.

**Urgency**: Low-risk, self-contained UX correction. No back-end changes required; the event data model already carries an `isAllDay` flag and the app already has an established "All Day" visual component.

---

## 3. Personas & User Stories

### Primary Persona: Berkeley Mobile App User
A UC Berkeley student, staff member, or community member browsing campus events via the mobile app.

**User Story**:
> As a Berkeley Mobile app user, when I tap on an all-day event to see its details, I want the time row to clearly say "All Day" instead of showing a specific time, so I understand that the event has no particular start or end time.

### Secondary Persona: Event Administrator / Data Publisher
Staff members who publish campus events (academic calendar, campus-wide events). They expect that events marked as all-day in the source system are displayed accurately in the app.

**User Story**:
> As an event administrator, when I publish an all-day event, I want it to be shown to users without a misleading time value, so the app faithfully represents the event as I intended.

---

## 4. Business Rules

**BR-001**: When an event is designated as an all-day event, the Event Detail Page time row MUST display an "All Day" indicator and MUST NOT display any time value (start time, end time, or time range).

**BR-002**: When an event is NOT designated as an all-day event, the Event Detail Page time row MUST continue to display the event's time information exactly as it does today (no change to non-all-day events).

**BR-003**: The "All Day" indicator MUST be visually presented as a capsule/pill-shaped label, consistent with the established "All Day" visual pattern already used in the Events feature.

**BR-004**: The determination of whether an event is all-day is provided by the upstream data source. The system receives this flag directly; the app MUST use the provided flag to decide which display to show and MUST NOT attempt to re-derive all-day status from time values alone.

**BR-005**: The "All Day" indicator MUST appear in the same position on the Event Detail Page as the time row it replaces — directly below the date row and above the location row.

**BR-006**: The time row row MUST always be visible for all events (all-day or timed). For all-day events it shows the "All Day" indicator; for timed events it shows the time. The time row MUST NOT be hidden or omitted entirely for any event.

---

## 5. Acceptance Criteria

```gherkin
Feature: All Day Indicator on Event Detail Page

  Background:
    Given the user is on the Berkeley Mobile app
    And the user navigates to the Events section

  Scenario: All-day event shows "All Day" indicator in the time row
    Given an event is designated as an all-day event by the data source
    When the user taps the event to open its detail page
    Then the time row displays a capsule/pill-shaped "All Day" indicator
    And no specific time value (start time, end time, or time range) is shown in the time row
    And the "All Day" indicator appears below the date row
    And the "All Day" indicator appears above the location row (if a location exists)

  Scenario: Non-all-day event continues to show time in the time row
    Given an event is NOT designated as an all-day event
    When the user taps the event to open its detail page
    Then the time row displays the event's start time
    And if the event has an end time, the time range is shown (e.g., "10:00 AM - 11:30 AM")
    And no "All Day" indicator is shown

  Scenario: All-day indicator is visually consistent with existing "All Day" styling
    Given an event is designated as an all-day event
    When the user views the Event Detail Page
    Then the "All Day" label is presented in a capsule/pill shape
    And the visual style of the indicator is consistent with the "All Day" badge used elsewhere in the Events feature

  Scenario: All-day event with no location still shows "All Day" indicator
    Given an event is designated as an all-day event
    And the event has no location specified
    When the user taps the event to open its detail page
    Then the time row displays the "All Day" indicator
    And the location row is not shown (unchanged behavior — location row only shows when a location exists)
    And no blank or empty space replaces the location row

  Scenario: Legacy all-day detection still shows "All Day" indicator
    Given an event has a start time of midnight (12:00 AM) and an end time of 11:59:59 PM
    And the event is not explicitly flagged as all-day by the data source
    When the user opens the event detail page
    Then the time row displays the "All Day" indicator
    And no specific time value is shown

  Scenario: Multiple events in the same day list include both all-day and timed events
    Given a list of events on the same date includes both all-day and timed events
    When the user opens the detail page for the all-day event
    Then the time row shows the "All Day" indicator
    When the user navigates back and opens the detail page for the timed event
    Then the time row shows the event's time value
```

---

## 6. Non-Functional Requirements

**Performance**:
- The "All Day" indicator determination MUST be resolved at display time with no perceptible delay. No additional data fetching is required; the all-day flag is already part of the event data loaded before the detail page opens.

**Consistency / Design**:
- The "All Day" capsule/badge visual MUST match the styling convention already established in the Events feature (same label text "All Day", same pill/capsule shape treatment).
- The layout of the header card on the Event Detail Page (event name → date row → time row → location row) MUST remain unchanged. Only the content of the time row changes for all-day events.

**Accessibility**:
- The "All Day" indicator MUST be readable by screen readers. The label text "All Day" MUST be available as an accessibility label so visually impaired users receive the same information.
- The indicator MUST meet minimum contrast requirements against its background for readability.

**Reliability**:
- If the all-day flag is absent or indeterminate for an event (e.g., null/missing), the system MUST fall back to displaying the event's time value as if it were a timed event. The "All Day" indicator MUST only be shown when the all-day flag is definitively true.

**Maintainability**:
- The logic that determines whether to show the "All Day" indicator vs. a time value MUST be contained within the Event Detail Page's time row component, making it straightforward to maintain or extend in the future.

---

## 7. Edge Cases & Special Scenarios

| Scenario | Expected Behavior |
|---|---|
| `isAllDay` flag is `true` | Display "All Day" indicator; hide time value |
| `isAllDay` flag is `false` or absent | Display time value as today |
| Event has midnight start and 11:59 PM end (legacy all-day pattern) | Display "All Day" indicator (existing detection logic already handles this) |
| All-day event has no end time | Display "All Day" indicator (end time is irrelevant for all-day display) |
| All-day event has no location | Time row shows "All Day"; location row is hidden (no change to location row behavior) |
| All-day event with description | "All Day" indicator shows correctly; description section unaffected |
| All-day event with register/learn more links | "All Day" indicator shows correctly; action buttons unaffected |
| User adds an all-day event to device calendar | Calendar add behavior is unaffected; only the display in the detail page changes |

---

## 8. Out of Scope

The following are explicitly excluded from this change:

- **Event list/row view**: The time display on the event list row (the card shown before tapping into the detail) is not changed by this issue. Any changes to the list view are a separate task.
- **Event data model or back-end**: No changes to how events are stored, fetched, or structured in the data source. The `isAllDay` flag is already provided; no new fields or endpoints are needed.
- **Adding to device calendar behavior**: How all-day events are added to the user's native device calendar is not modified.
- **Academic calendar vs. campus-wide event distinction**: This change applies uniformly to any event marked all-day, regardless of which tab or event type it belongs to.
- **Redesign of the Event Detail Page layout**: Only the content of the time row changes. No other layout, spacing, or visual redesign is in scope.
- **Event editing or creation**: The app is read-only for events; no edit workflows are in scope.
- **Push notifications or reminders**: Out of scope.

---

## 9. Success Metrics

| Metric | Target |
|---|---|
| All-day events on the detail page display "All Day" indicator | 100% of all-day events show the indicator; 0% show a raw time value |
| Non-all-day events are unaffected | 100% of timed events continue to display correct time values |
| No regression in Event Detail Page for timed events | All existing time display behavior for non-all-day events passes QA |
| Accessibility label present on "All Day" indicator | Verified via accessibility audit |
| Visual consistency with existing "All Day" badge styling | Design review sign-off |

---

## 10. Open Questions

| # | Question | Impact |
|---|---|---|
| OQ-001 | When `isAllDay` is `null` (not set) in the data source, should the system fall back to the legacy midnight-to-11:59 PM detection, or treat the event as timed? | Determines fallback behavior for older or incomplete event records. Recommended default: apply legacy detection as a secondary check. |
| OQ-002 | Should the clock icon in the time row be retained when the "All Day" indicator is displayed, or replaced/removed? | Minor visual detail. Recommended: retain the clock icon for layout consistency, placing the "All Day" capsule beside it just as a time string would appear. |

---

## 11. References

- **Related Component**: `AllDayEventBannerView` — an existing "All Day" capsule/banner component in the Events feature that establishes the visual language for this indicator.
- **Existing All-Day Detection Logic**: The `BMCalendarEvent` protocol's `dateString` computed property already contains logic to detect all-day events (midnight start + 11:59:59 PM end) and return "All Day" as the time portion of the date string. This existing logic is directly relevant to the fix.
- **Event Data Model**: `BMEventCalendarEntry` already carries an `isAllDay: Bool?` field populated from the upstream data source.
- **Affected View**: `BMDetailHeaderView` — the `timeView` sub-component within the Event Detail Page header card is the specific display location where the "All Day" indicator must appear.
- **Repository**: https://github.com/gouveiahenrique/berkeley-mobile-ios
