# Business Requirements: ASDLC-519
## [Events Page] Display "All Day" Indicator Instead of Time on Event Detail Page

**Issue Key**: ASDLC-519  
**Date**: 2026-09-11  
**Complexity**: S (Small)

---

## 1. Executive Summary

When a user views the detail page of an event marked as "All Day," the time row currently displays a misleading time value (e.g., "12:00 AM") rather than communicating that no specific time applies. The Event Detail Page must instead display a visually distinct "All Day" indicator in the time row whenever an event is designated as all-day, replacing the time value entirely. This prevents user confusion and accurately represents the nature of all-day events.

---

## 2. Problem Statement

**Current State**  
The Event Detail Page contains a time row that always displays a formatted start/end time. When an event is explicitly flagged as "All Day," the time row still displays a time value (e.g., "12:00 AM"), which is inaccurate and misleading because all-day events have no meaningful start or end time.

**Desired State**  
When an event is flagged as "All Day," the time row on the Event Detail Page must display an "All Day" indicator — styled as a capsule/pill-shaped label — in place of any time value. For events that are not all-day, the time row must continue to display the formatted start (and optionally end) time as it does today.

**Business Impact**  
- Users are misled into believing an all-day event starts at 12:00 AM, potentially causing scheduling confusion.
- Displaying "All Day" accurately sets user expectations about event attendance and planning.
- The app already uses a capsule-style "All Day" label in other parts of the Events feature, establishing a visual convention that this fix must be consistent with.

**Urgency**  
The current behavior is actively misleading to users browsing all-day events (e.g., holidays, academic calendar dates). The fix is scoped, low-risk, and improves data accuracy for all users of the Events feature.

---

## 3. Personas & User Stories

### Persona: Berkeley Student / App User
A student using Berkeley Mobile to check upcoming campus events, academic deadlines, or holidays.

**User Story 1**  
As a student viewing an all-day event (e.g., a holiday or campus closure), I want to see "All Day" displayed in the time row so that I immediately understand no specific time applies and I do not need to plan around a specific hour.

**User Story 2**  
As a student viewing a timed event (e.g., a career fair or lecture), I want to see the specific start and end times in the time row so I can plan my schedule accurately.

---

## 4. Business Rules

**BR-001: All-Day Event Identification**  
An event is considered "All Day" when it is explicitly flagged as an all-day event by the data source. The determination of whether an event is all-day is owned by the data layer and must not be re-derived or overridden by the display layer.

**BR-002: All-Day Time Row Display**  
When an event is identified as "All Day" (per BR-001), the time row on the Event Detail Page must display an "All Day" capsule/pill-shaped label. No time value (start time, end time, or range) may be displayed for all-day events.

**BR-003: Timed Event Time Row Display**  
When an event is NOT identified as "All Day," the time row must continue to display the event's time information as it does today. This rule is unchanged; the fix must not alter timed-event display behavior.

**BR-004: Visual Consistency**  
The "All Day" indicator on the Event Detail Page must use the same capsule/pill visual style already established in the app's existing "All Day" event presentation. This ensures visual consistency across the Events feature.

**BR-005: Time Row Always Present**  
The time row must always be present on the Event Detail Page for every event — displaying either the "All Day" indicator (per BR-002) or the time range (per BR-003). The row must not be hidden or omitted for any event type.

---

## 5. Acceptance Criteria

```gherkin
Feature: Event Detail Page – All Day Indicator

  Background:
    Given the user has opened the Berkeley Mobile app
    And the user has navigated to the Events section

  Scenario: All-day event shows "All Day" indicator in time row
    Given an event is flagged as an all-day event
    When the user opens the Event Detail Page for that event
    Then the time row displays an "All Day" capsule/pill-shaped label
    And the time row does not display any time value (e.g., "12:00 AM")

  Scenario: Timed event still shows time range in time row
    Given an event has a specific start time and is not flagged as all-day
    When the user opens the Event Detail Page for that event
    Then the time row displays the event's start time
    And if the event has an end time, the time row also displays the end time

  Scenario: Timed event with no end time shows only start time
    Given an event has a specific start time, no end time, and is not flagged as all-day
    When the user opens the Event Detail Page for that event
    Then the time row displays only the event's start time
    And no end time is shown

  Scenario: All-day indicator style is consistent with existing app conventions
    Given an event is flagged as an all-day event
    When the user opens the Event Detail Page for that event
    Then the "All Day" label is presented in a capsule/pill shape
    And the visual style matches the "All Day" label used elsewhere in the Events feature

  Scenario: Time row is always present regardless of event type
    Given any event (all-day or timed)
    When the user opens the Event Detail Page for that event
    Then the time row is visible and displays appropriate content
    And the time row is never hidden or absent
```

---

## 6. Non-Functional Requirements

**Performance**  
The all-day indicator must render with no perceptible additional delay compared to the current time row. The determination of whether to show "All Day" vs. a time value must not add any network requests.

**Accessibility**  
The "All Day" capsule label must be readable by screen readers (VoiceOver) and conveyed as meaningful text, not just a visual shape. The label text "All Day" must be accessible as a text element.

**Visual Consistency**  
The "All Day" capsule must visually match the style used in the rest of the Events feature, maintaining a coherent look and feel across the app.

**Reliability**  
The display logic must correctly handle the case where the all-day flag is absent or undefined — in this case, the event must be treated as a timed event and the time row must show whatever time information is available.

---

## 7. Edge Cases & Special Scenarios

**Edge Case 1: All-day flag is absent or undefined**  
If an event's all-day status is not set (e.g., the field is missing or null), the event must be treated as a timed event. The time row must display the available time information rather than showing "All Day."

**Edge Case 2: All-day event with no end time**  
If an event is flagged as all-day but has no end time, the "All Day" indicator must still be displayed. The absence of an end time must not cause the row to fall back to displaying a time value.

**Edge Case 3: All-day flag is true but time values are present**  
The all-day flag takes precedence over any time values stored on the event. If an event is explicitly flagged as all-day, the "All Day" indicator must be shown regardless of what time values are stored (e.g., midnight start).

**Edge Case 4: Time string already encodes "All Day" in the date/time field**  
The system may produce a date string that already includes an "All Day" segment derived from time-component heuristics. In this case, displaying the "All Day" indicator must be driven by the authoritative all-day flag, not by string parsing. The display must not rely on detecting "All Day" as a substring.

> **Open Question**: Is the `isAllDay` flag authoritative and always populated when a backend event is all-day, or is the time-component heuristic (midnight start / 23:59:59 end) the only reliable signal? Clarification is needed to determine whether both signals must be honored or if one takes precedence.

---

## 8. Out of Scope

- Changes to the Events list view, calendar view, or any other page beyond the Event Detail Page time row.
- Changing the date row on the Event Detail Page (the date display remains unchanged).
- Changing the behavior of the "Add to Calendar" feature for all-day events.
- Introducing new event types or modifying how all-day events are created or stored.
- Changing how the all-day flag is set, computed, or stored in the data layer.
- Modifying the "All Day" banner/view used in the calendar or list views — only the time row on the Event Detail Page is in scope.
- Any backend or data-service changes.

---

## 9. Success Metrics

- **Zero misleading time displays**: No all-day event on the Event Detail Page displays a time value (e.g., "12:00 AM") after the fix is deployed.
- **No regression on timed events**: All timed events continue to display correct time information in the time row.
- **Visual consistency**: The "All Day" capsule on the Event Detail Page is indistinguishable in style from the existing "All Day" indicator used elsewhere in the Events feature.
- **Accessibility compliance**: The "All Day" label passes VoiceOver accessibility checks.

---

## 10. References

- **Issue**: ASDLC-519 — [Events Page] Display "All Day" Indicator Instead of Time on Event Detail Page
- **Repository**: https://github.com/gouveiahenrique/berkeley-mobile-ios
- **Related files identified**:
  - Event Detail Page view (displays the time row)
  - Event data model (contains the all-day flag and date/time fields)
  - Existing "All Day" capsule banner view (provides the visual precedent for the indicator style)
  - Calendar event protocol (defines the dateString computation used in the time row today)
