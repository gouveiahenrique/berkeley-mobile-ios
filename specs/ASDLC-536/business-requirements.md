# Business Requirements: Display "All Day" Indicator on Event Detail Page

**Issue Key**: ASDLC-536  
**Date**: 2026-09-27  
**Status**: Draft  
**Complexity**: S (Small)

---

## 1. Executive Summary

When a campus event is marked as an all-day event, the Event Detail Page currently displays a misleading time value (e.g., "12:00 AM") in the time row instead of communicating that no specific start/end time applies. This specification defines the requirement to replace that erroneous time display with a clear "All Day" visual indicator, ensuring users receive accurate information about the event's time scope.

---

## 2. Problem Statement

### Current State
The Event Detail Page contains a time row that always renders a time string derived from the event's start date. For all-day events, the stored start time defaults to midnight (12:00 AM), causing the time row to display "12:00 AM" — a value that is technically present in the data but meaningless and misleading for an all-day event.

### Desired State
When an event is flagged as all-day, the time row on the Event Detail Page must display an "All Day" label — presented as a capsule/pill-shaped badge — instead of any time value. This communicates clearly and at a glance that the event has no specific start or end time.

### Business Impact
- **User trust**: Showing "12:00 AM" for an all-day event is factually incorrect and erodes confidence in the app's accuracy.
- **User comprehension**: Users may attempt to attend an event at midnight based on what they see, which is unintended and potentially harmful.
- **Consistency**: The Events list view already distinguishes all-day events visually with a banner treatment; the detail page must be consistent with that established pattern.

### Urgency
This is a data accuracy bug affecting every all-day event currently displayed in the app. Because the Events list already handles the all-day case correctly, the detail page divergence is immediately noticeable to users who navigate from the list to the detail.

---

## 3. Personas & User Stories

### Primary Persona: Berkeley Student / Community Member
A student browsing upcoming campus events who taps an all-day event (e.g., a holiday, an academic deadline, or a campus-wide exhibit) to view its details.

**User Story**:  
> As a student viewing event details, I want the time row to clearly say "All Day" for all-day events, so that I am not misled into thinking the event starts at 12:00 AM.

### Secondary Persona: Event Organizer / Admin
A person who creates and categorizes events in the campus event system, marking certain events as "all day."

**User Story**:  
> As an event organizer, I want the app to faithfully represent that my event is all-day, so that attendees do not show up at the wrong time.

---

## 4. Business Rules

**BR-001**: An event is considered "all-day" when it is explicitly flagged as such by the data source. The all-day flag is the authoritative indicator — time values stored on the event record must not override this designation.

**BR-002**: When an event is all-day, the time row on the Event Detail Page must display an "All Day" indicator. No start time, end time, or time range may be shown for all-day events.

**BR-003**: The "All Day" indicator must be visually distinct from plain text — it must use a capsule (pill-shaped) badge style, consistent with the visual treatment already used for all-day events in the Events list view.

**BR-004**: When an event is not all-day, the time row must continue to display the event's start time and, where available, the end time, exactly as it does today. This change must not alter behavior for timed events.

**BR-005**: The "All Day" indicator must appear in the same position in the detail layout where the time row currently appears — it replaces the time row content, not the row itself.

**BR-006**: The system provides two parallel all-day signals on event data:
  - An explicit all-day flag, sourced from the backend data feed and used to drive the Events list view's all-day display.
  - A time-component heuristic in the shared date string utility, which infers all-day status when the event's start time is midnight (00:00:00) and end time is 23:59:59.

These two signals can disagree. The detail page must use one authoritative signal consistently — which signal takes precedence must be defined before implementation begins (see EC-001).

> **Open question (must resolve before implementation)**: When the explicit all-day flag is present and true, but the time-component heuristic does not fire (e.g., the end time is not exactly 11:59:59 PM), which signal wins? Should the detail page use the explicit flag, the heuristic, or the formatted date string that already encodes the heuristic result? The data/backend team must confirm which is authoritative.

---

## 5. Acceptance Criteria

```gherkin
Feature: All Day indicator on Event Detail Page

  Background:
    Given the user has opened the berkeley-mobile app
    And the user navigates to the Events section

  Scenario: All-day event shows "All Day" badge instead of a time
    Given an event exists that is marked as an all-day event
    When the user taps the event to open its detail page
    Then the time row displays an "All Day" capsule/badge
    And no start time (e.g., "12:00 AM") is shown in the time row
    And no end time is shown in the time row

  Scenario: All-day badge uses capsule/pill visual style
    Given an event exists that is marked as an all-day event
    When the user views the event detail page
    Then the "All Day" label appears inside a pill-shaped (capsule) container
    And the badge is visually distinct from plain text labels

  Scenario: Timed event continues to show start and end time
    Given an event exists that is NOT marked as an all-day event
    And the event has a defined start time
    When the user taps the event to open its detail page
    Then the time row displays the event's start time
    And if an end time exists, the time range is also displayed
    And no "All Day" badge is shown

  Scenario: Timed event with no end time shows only start time
    Given an event exists that is NOT marked as an all-day event
    And the event has a defined start time but no end time
    When the user taps the event to open its detail page
    Then the time row displays only the start time
    And no "All Day" badge is shown

  Scenario: All-day badge position matches current time row position
    Given an event exists that is marked as an all-day event
    When the user views the event detail page
    Then the "All Day" badge appears in the same vertical position as the time row does for non-all-day events
    And the date row (showing the calendar date) remains unchanged above it

  Scenario: Visual consistency with the Events list view
    Given an event is marked as all-day
    When the user views the event in the Events list
    And then navigates to the event's detail page
    Then both views clearly communicate "All Day" status
    And neither view displays a time value for the event
```

---

## 6. Non-Functional Requirements

### Accessibility
- The "All Day" badge must be readable by screen readers. The accessible label must convey "All Day" as the time information for the event.
- Contrast between the badge text and its background must meet standard accessibility contrast ratios.

### Visual Consistency
- The capsule/pill badge style must be consistent with the visual language already established in the Events list view's all-day banner treatment.
- The badge must render correctly in both light mode and dark mode.

### Performance
- No additional data fetching is required. The all-day flag is already present on the event object — this change is purely a display-layer update.

### Reliability
- This change must not introduce any regression for timed events. The time display for non-all-day events must remain completely unchanged.

---

## 7. Edge Cases & Special Scenarios

### EC-001: Conflicting all-day signals (flag vs. heuristic)
The system has two parallel mechanisms for determining whether an event is all-day: an explicit boolean flag from the backend data feed, and a time-component heuristic applied to the stored start/end times. These two signals can disagree — for example, if the backend marks an event as all-day but stores end times that do not exactly match the midnight-to-11:59 PM window the heuristic requires.

Additionally, the explicit all-day flag may be absent (null) for some events, leaving only the heuristic available.

**Required decision before implementation**: The data/backend team must confirm:
1. Which signal is authoritative when both are present but disagree.
2. Whether the heuristic is an acceptable fallback when the flag is absent.
3. Until confirmed, the implementation must use whichever signal is already used by the Events list view (the explicit flag) as the primary check, with the heuristic as fallback — to ensure visual consistency between the list and detail views.

### EC-002: All-day event with a location
All-day events may also have a location. The location row must continue to display normally below the "All Day" badge — only the time row content changes.

### EC-003: All-day event with no description, no links
All-day events may have minimal data (no description, no register link, no learn-more link). The layout must degrade gracefully — the "All Day" badge in the time row must still display correctly when surrounding content is absent.

### EC-004: Multi-day all-day events
Some all-day events may span multiple calendar days. This specification does not address multi-day display — the date row behavior for multi-day events is out of scope. However, the time row must still show "All Day" for any event flagged as all-day, regardless of duration.

---

## 8. Out of Scope

- Changes to how all-day events are displayed in the **Events list view** — that view already handles all-day events correctly and must not be modified.
- Changes to the **date row** (the calendar icon row showing the event date) — only the time row is in scope.
- Changes to how events are **created, edited, or flagged** as all-day in the backend or admin tools.
- Support for **multi-day event date ranges** — the date row is unchanged.
- Changes to the **calendar add/remove functionality** available from the event detail toolbar.
- Changes to the **"Learn More" or "Register" buttons**.
- Any changes to event data fetching, caching, or the network layer.

---

## 9. Success Metrics

1. **Zero instances** of "12:00 AM" (or any time value) appearing in the time row for events flagged as all-day — verifiable by manual QA on real all-day events.
2. **All timed events** continue to display start and end times correctly — no regression observed.
3. **Visual QA pass**: The "All Day" badge renders correctly in both light and dark mode, and is visually consistent with the Events list view's all-day treatment.
4. **Accessibility pass**: The "All Day" badge is announced correctly by VoiceOver (screen reader).

---

## 10. References

- **Related issue**: ASDLC-536 (this document)
- **Repository**: berkeley-mobile-ios
- **Affected screen**: Event Detail Page (`EventDetailView` / `BMDetailHeaderView` — the time row within the header card)
- **Event data model**: The `isAllDay` boolean flag on event objects is the authoritative all-day indicator provided by the data source
- **Existing all-day treatment**: The Events list view already displays an "All Day" banner for events where `isAllDay == true`, using a capsule-shaped visual — this is the reference pattern for the badge style
- **Shared date string utility**: The protocol-level `dateString` computed property applies a time-component heuristic to detect all-day status when the explicit flag is absent; this behavior is relevant context for the open question in BR-006 / EC-001
