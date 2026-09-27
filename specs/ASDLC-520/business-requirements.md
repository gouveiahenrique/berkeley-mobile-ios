# Business Requirements: Display "All Day" Indicator on Event Detail Page

**Issue Key**: ASDLC-520
**Date**: 2026-09-27
**Status**: Draft

---

## 1. Executive Summary

When a campus event is designated as an All Day event, the Event Detail Page currently displays a misleading time value (e.g., "12:00 AM") in the time row. This must be corrected so that All Day events display a visually distinct "All Day" indicator — using a capsule/pill-shaped label — in place of any time value, communicating clearly that no specific start or end time applies to the event.

---

## 2. Problem Statement

### Current State

On the Event Detail Page, the time row always displays a formatted time string (e.g., "12:00 AM"). For events designated as All Day, this time value is technically a default value (midnight) and does not reflect any meaningful time information. Users who view the detail page for an All Day event see "12:00 AM" and may misinterpret it as a scheduled start time.

### Desired State

When a user views the Event Detail Page for an All Day event, the time row must display an "All Day" indicator styled as a capsule/pill-shaped label. No start time, end time, or time range is shown for All Day events.

### Business Impact

- **User trust**: Displaying a meaningless default time ("12:00 AM") erodes confidence in the accuracy of event information.
- **User comprehension**: Users may make incorrect assumptions about event scheduling based on the misleading time display.
- **Consistency**: The app already uses an "All Day" capsule visual treatment in the events list (banner view). The Event Detail Page must be consistent with this established pattern.

### Urgency

The issue causes factually incorrect information to be shown on a primary user-facing screen. Correction is needed to maintain the reliability of the Events feature.

---

## 3. Personas & User Stories

### Persona: Campus Event Attendee
A UC Berkeley student or community member who uses the Berkeley Mobile app to discover and track campus events.

**User Stories**:
- As a campus event attendee, I want the Event Detail Page to clearly indicate when an event is All Day, so I know no specific arrival time is required and I do not plan around a wrong time.
- As a campus event attendee, I want the time row to be visually distinct for All Day events, so I can immediately recognize the event type without reading ambiguous text.

### Persona: Event Organizer / Administrator
A person who creates or maintains event data in the upstream system and relies on the app to faithfully communicate event attributes to attendees.

**User Stories**:
- As an event organizer, I want the "All Day" designation I set in the event system to be correctly reflected on the Event Detail Page, so attendees receive accurate information.

---

## 4. Business Rules

**BR-001**: An event is considered "All Day" when the backend explicitly marks it as such via the `isAllDay` attribute. This designation is determined and provided by the upstream event data system — the mobile client must not recompute or override it.

**BR-002**: When an event is All Day, the time row on the Event Detail Page must display an "All Day" capsule/pill-shaped label. No time value (start time, end time, or range) may appear in the time row for All Day events.

**BR-003**: When an event is NOT All Day, the time row must display the event's time information exactly as it does today (e.g., "12:00 PM – 2:00 PM"). No behavior change applies to non-All Day events.

**BR-004**: The "All Day" indicator must be visually styled as a capsule/pill shape, consistent with the existing All Day banner treatment used in the events list view, so that the visual language is coherent across the app.

**BR-005**: The "All Day" capsule label must contain the text "All Day".

**BR-006**: If the `isAllDay` attribute for an event is absent or indeterminate (i.e., the value is not explicitly set), the time row must fall back to displaying the event's time information. It must not display the "All Day" indicator when All Day status is uncertain.

**BR-007**: The date row (showing the event's date, e.g., "Today" or "09/27/2026") must continue to display normally for all events, including All Day events. Only the time row behavior changes.

---

## 5. Acceptance Criteria

```gherkin
Feature: All Day Indicator on Event Detail Page

  Background:
    Given the user has opened the Berkeley Mobile app
    And the user has navigated to the Events section

  # ── Happy Path ──

  Scenario: All Day event shows "All Day" capsule in the time row
    Given an event is designated as "All Day" by the event data system
    When the user taps on that event to open the Event Detail Page
    Then the time row displays a capsule/pill-shaped label with the text "All Day"
    And no start time, end time, or time range is shown in the time row

  Scenario: All Day event still shows its date in the date row
    Given an event is designated as "All Day" by the event data system
    When the user taps on that event to open the Event Detail Page
    Then the date row continues to display the event's date (e.g., "Today" or the formatted date)
    And the date row is unaffected by the All Day designation

  Scenario: Non-All Day event continues to show time information
    Given an event is NOT designated as "All Day"
    When the user taps on that event to open the Event Detail Page
    Then the time row displays the event's time information (e.g., "12:00 PM – 2:00 PM")
    And no "All Day" capsule or label is shown in the time row

  # ── Alternative / Edge Case Paths ──

  Scenario: Event with unset or absent All Day attribute falls back to time display
    Given an event does not have an explicit "All Day" designation from the event data system
    When the user taps on that event to open the Event Detail Page
    Then the time row displays the event's available time information
    And the "All Day" capsule is not shown

  Scenario: All Day event without a known location shows no location row
    Given an event is designated as "All Day" by the event data system
    And the event has no location specified
    When the user taps on that event to open the Event Detail Page
    Then the time row displays the "All Day" capsule
    And the location row is absent
    And no other rows are affected

  Scenario: All Day event with all optional fields present displays correctly
    Given an event is designated as "All Day" by the event data system
    And the event has a description, location, "Learn More" link, and "Register" link
    When the user taps on that event to open the Event Detail Page
    Then the time row displays the "All Day" capsule
    And the date row, description section, location row, and action buttons all display normally

  # ── Error / Degraded State Paths ──

  Scenario: Event detail page loaded with an All Day event while offline
    Given the device has no network connectivity
    And a previously cached All Day event is available
    When the user views the Event Detail Page for that event
    Then the time row displays the "All Day" capsule based on the cached event data
    And no error is shown specifically for the time row
```

---

## 6. Non-Functional Requirements

### Usability
- **NFR-001**: The "All Day" capsule must be legible at the standard text size settings. It must not be truncated, clipped, or obscured.
- **NFR-002**: The visual style of the "All Day" capsule on the Event Detail Page must be consistent with the capsule/pill treatment already present in the events list view, so users experience a coherent visual language across the app.

### Accessibility
- **NFR-003**: The "All Day" capsule must be accessible to screen reader users. It must convey the same "All Day" meaning as the visible label when navigated via assistive technology.
- **NFR-004**: The "All Day" capsule must meet the app's existing color contrast standards so it is visible in both light and dark modes.

### Performance
- **NFR-005**: Determining whether to display the "All Day" capsule must not introduce any perceptible delay in rendering the Event Detail Page. The check is a simple attribute read and must complete in constant time.

### Reliability
- **NFR-006**: The change must not affect the behavior of any other screen in the Events feature (events list, calendar view, event row, today view). Only the Event Detail Page time row behavior changes.

---

## 7. Edge Cases & Special Scenarios

| Scenario | Expected Behavior |
|---|---|
| `isAllDay` is `true` and event also has midnight start/11:59:59 end times | Display "All Day" capsule — the explicit flag takes precedence; no time shown |
| `isAllDay` is `false` but event has midnight start and 11:59:59 end (edge timing data) | Display time information — the explicit flag says not All Day |
| `isAllDay` is `nil` (not set by backend) | Fall back to time display; do not show "All Day" capsule |
| All Day event has no end date | Display "All Day" capsule; the absence of an end date is acceptable for All Day events |
| All Day event's name is very long | Capsule displays "All Day" text at a fixed size; name overflow is handled by the event name row, not the time row |
| User adds an All Day event to their device calendar from the Event Detail Page | The calendar addition behavior is unaffected; only the display of the time row changes |
| Multiple All Day events listed consecutively | Each Event Detail Page independently shows the "All Day" capsule; there is no interaction between separate event detail screens |

---

## 8. Out of Scope

The following items are explicitly **not** part of this requirement:

- **Changes to the events list view**: The All Day banner/capsule in the events list already works correctly and is not modified by this work.
- **Changes to the calendar view**: How All Day events appear on the calendar grid is not modified.
- **Changes to the event row view**: The compact event row card on the Events and Today screens is not modified.
- **Changes to the All Day detection logic**: How the backend determines and communicates `isAllDay` is not modified. How the client computes the `dateString` for non-detail contexts is not modified.
- **Adding new event attributes or fields**: No new data attributes are introduced or requested from the backend.
- **Modifying the date row behavior**: The date row display logic is unchanged.
- **Changing event addition to device calendar**: The "Add to Calendar" toolbar action and its behavior are not modified.
- **Changes to push notifications or reminders**: Notification content or timing for All Day events is not in scope.
- **Redesigning the Event Detail Page layout**: Only the time row's content changes; overall page layout, header structure, and other elements remain unchanged.

---

## 9. Success Metrics

| Metric | Target |
|---|---|
| All Day events on Event Detail Page show "All Day" capsule | 100% of All Day events |
| Non-All Day events on Event Detail Page show correct time information | 100% of non-All Day events |
| No regression in events list, calendar, or event row views | Zero new defects in related screens |
| Screen reader correctly announces "All Day" for all-day event time rows | 100% of All Day events |
| Visual style of capsule is consistent with events list banner | Qualitative design review passes |

---

## 10. References

- **Related Issue**: Event Detail Page currently shows time row using `dateString` parsed from `BMCalendarEvent.dateString`, which has its own All Day heuristic but does not read the `isAllDay` attribute directly.
- **Existing All Day visual treatment**: `AllDayEventBannerView` in the Events feature provides the established capsule/pill pattern used in the events list — the Event Detail Page must adopt consistent visual language.
- **Authoritative All Day attribute**: The `isAllDay` property on the event model is provided by the upstream event data system. It is the authoritative source for whether an event is All Day and must be used by the Event Detail Page to determine display behavior.
- **Repository**: https://github.com/gouveiahenrique/berkeley-mobile-ios
