# Business Requirements: Display "All Day" Indicator on Event Detail Page

**Issue Key**: ASDLC-518  
**Date**: 2026-09-25  
**Status**: Draft  

---

## 1. Executive Summary

When a campus event is designated as "All Day," the Event Detail Page currently shows a misleading time value (e.g., 12:00 AM) in the time row. The time row must instead display a visually distinct "All Day" badge/capsule to accurately communicate to users that no specific start or end time applies to the event.

---

## 2. Problem Statement

### Current State
The Event Detail Page contains a dedicated row for displaying event time information. When an event is marked as an "All Day" event, the time row falls back to rendering a raw time value (such as "12:00 AM") derived from the event's stored start date. This value is technically meaningless for all-day events and misleads users into believing the event begins or ends at a specific time.

### Desired State
When an event is marked as an "All Day" event, the time row on the Event Detail Page must display a clearly readable "All Day" indicator — styled as a capsule or pill-shaped badge — in place of any time value. This makes the event's all-day nature immediately clear to the user.

### Business Impact
- **Users**: App users browsing campus event details receive inaccurate schedule information (a time that does not apply), which degrades trust in the app's accuracy.
- **Event organizers**: All-day events (e.g., campus holidays, enrollment deadlines, and multi-day exhibitions) are misrepresented.
- **Product quality**: The Events list view already correctly distinguishes all-day events with a banner; the Detail Page inconsistency undermines a uniform user experience.

### Urgency
The Events list view already handles all-day events with a dedicated visual banner. The Detail Page is the only remaining surface where this inconsistency exists. Fixing it completes the correct presentation of all-day events across the entire Events feature.

---

## 3. Personas & User Stories

### Persona 1: General Student / App User
A student checking upcoming campus events to plan their schedule.

**User Story**:  
As a student viewing the details of a campus-wide holiday or enrollment deadline, I want to clearly see that the event lasts all day — without a confusing time label — so I know I do not need to arrive at or leave by a specific time.

### Persona 2: Event Organizer / Content Admin
A university office or student organization that creates and publishes all-day campus events.

**User Story**:  
As an event organizer who marks an event as "All Day" in the event management system, I want the Event Detail Page to reflect that designation accurately so that attendees are not confused by a phantom time value.

### Persona 3: Accessibility-Conscious User
A user who relies on clear, unambiguous labels to understand content.

**User Story**:  
As a user who needs unambiguous information, I want the "All Day" status to be displayed as a distinct, labeled visual element — not as a time string — so I immediately understand the event's schedule without inferring it from context.

---

## 4. Business Rules

**BR-001**: When an event's all-day designation is confirmed, the time row on the Event Detail Page MUST display an "All Day" indicator in place of any time value.

**BR-002**: The "All Day" indicator MUST be styled as a capsule/pill-shaped badge to visually distinguish it from a standard time label, matching the established visual language for all-day events already used elsewhere in the Events feature.

**BR-003**: An event is treated as an all-day event when its all-day flag is explicitly set to true by the data source. Events for which the flag is absent or false are NOT treated as all-day events.

**BR-004**: For non-all-day events, the time row behavior MUST remain unchanged: it must continue displaying the event's start and end time as currently implemented.

**BR-005**: The date row (showing the date of the event) MUST remain visible and unaffected for all-day events — only the time row changes.

**BR-006**: If an event's all-day flag is absent (not set), the system MUST fall back to current behavior and render whatever time information is available; it MUST NOT assume all-day status.

**BR-007**: The "All Day" capsule badge MUST contain the label text "All Day" and be readable against the Event Detail Page's background in both light and dark appearance modes.

---

## 5. Acceptance Criteria

```gherkin
Feature: Display "All Day" Indicator on Event Detail Page

  Background:
    Given the user has navigated to the Events section of the Berkeley Mobile app

  # --- Happy Path ---

  Scenario: All-day event shows "All Day" badge in the time row
    Given an event exists with its all-day flag set to true
    When the user taps that event to open the Event Detail Page
    Then the time row displays an "All Day" capsule/pill-shaped badge
    And the time row does NOT display any time value (e.g., no "12:00 AM")
    And the date row continues to display the event's date as normal

  Scenario: "All Day" badge is visually distinct from a time label
    Given an event with its all-day flag set to true is displayed on the Event Detail Page
    Then the "All Day" indicator appears as a capsule or pill-shaped element
    And the label text reads exactly "All Day"
    And the badge is visually consistent with the "All Day" presentation used in the Events list view

  # --- Non-All-Day Events (Regression) ---

  Scenario: Non-all-day event continues to display start and end time
    Given an event exists with its all-day flag set to false
    When the user taps that event to open the Event Detail Page
    Then the time row displays the event's start time
    And the time row displays the event's end time (if one exists)
    And no "All Day" badge is shown

  Scenario: Non-all-day event with only a start time shows start time only
    Given an event exists with its all-day flag set to false
    And the event has a start time but no end time
    When the user opens the Event Detail Page
    Then the time row displays only the start time
    And no "All Day" badge is shown

  # --- Edge Cases ---

  Scenario: Event with absent all-day flag is not treated as all-day
    Given an event exists for which the all-day flag has not been set (value is absent)
    When the user opens the Event Detail Page
    Then the system falls back to displaying whatever time information is available
    And no "All Day" badge is shown

  Scenario: "All Day" badge is readable in dark mode
    Given the device is using dark appearance
    And an event with its all-day flag set to true is displayed on the Event Detail Page
    Then the "All Day" badge text and background are both readable and visually distinct

  Scenario: "All Day" badge is readable in light mode
    Given the device is using light appearance
    And an event with its all-day flag set to true is displayed on the Event Detail Page
    Then the "All Day" badge text and background are both readable and visually distinct

  Scenario: All-day event with a location still shows location information
    Given an all-day event also has a location field set
    When the user opens the Event Detail Page
    Then the "All Day" badge is shown in the time row
    And the location row is shown with the event's location
    And both rows are visible simultaneously

  Scenario: All-day event without a location does not show an empty location row
    Given an all-day event has no location value
    When the user opens the Event Detail Page
    Then the "All Day" badge is shown in the time row
    And no location row is shown
```

---

## 6. Non-Functional Requirements

### Performance
- The time row rendering (whether showing "All Day" or a time value) must not introduce any perceptible delay — the Event Detail Page must load and render fully within the same timeframe as the current implementation.

### Accessibility
- The "All Day" badge must be accessible to screen readers: the accessible label must read as "All Day" so users relying on assistive technology receive the correct information.
- Text within the badge must maintain sufficient contrast against its background in both light and dark appearance modes to meet accessibility readability standards.

### Consistency
- The visual style of the "All Day" badge on the Event Detail Page must be consistent with the "All Day" visual treatment already established in the Events list view.

### Reliability
- The change must not introduce any regression in how non-all-day events display their time information.
- The change must handle the case where the all-day flag is absent (nil/unset) gracefully, without crashing or displaying incorrect data.

### Maintainability
- The logic for determining whether to show the "All Day" badge versus a time value must be explicit and tied to the event's all-day designation — not inferred from time values (e.g., midnight start times).

---

## 7. Edge Cases & Special Scenarios

| Scenario | Expected Behavior |
|---|---|
| All-day flag is `true` | Time row shows "All Day" capsule badge; no time string shown |
| All-day flag is `false` | Time row shows start time (and end time if present); no badge |
| All-day flag is absent (not provided) | Falls back to current behavior; no badge shown |
| All-day event has no end time | Time row shows "All Day" badge; no end time shown |
| All-day event has a location | Both the "All Day" time row and the location row appear |
| All-day event has no location | Only the "All Day" time row appears; no empty location row |
| Device in dark mode | Badge text and background remain legible |
| Device in light mode | Badge text and background remain legible |
| Event list view vs. detail view consistency | Both views reflect the all-day state accurately; no discrepancy between how the list and detail present all-day events |

---

## 8. Out of Scope

The following items are explicitly NOT part of this requirement:

- Changes to how all-day events are displayed in the **Events list view** — the list view already handles all-day events correctly with its banner component.
- Changes to how all-day events are **created, edited, or stored** — this is a display-only change.
- Changes to the **date row** on the Event Detail Page — only the time row is affected.
- Changes to the behavior of the **calendar add/remove action** (the toolbar button) when an event is all-day.
- Support for **multi-day events** that span more than one calendar day — those are handled separately.
- Changes to how all-day events are shown in **notifications** or other parts of the app outside the Events Detail Page.
- Changes to **event data sourcing or the backend** — the all-day designation is already provided by the data source.
- Surfacing additional metadata (e.g., event type, category) alongside the "All Day" badge.

---

## 9. Success Metrics

| Metric | Target |
|---|---|
| Accuracy | 100% of events with their all-day flag set to true show the "All Day" badge in the time row on the Event Detail Page |
| Zero regressions | 100% of events without the all-day flag continue to show their time as before |
| Visual consistency | "All Day" indicator style on Detail Page matches the existing indicator style in the Events list view |
| Accessibility | "All Day" badge is announced correctly by the system screen reader |
| No crash on nil | App does not crash or display an error when the all-day flag is absent |

---

## 10. Open Questions

| # | Question | Impact |
|---|---|---|
| OQ-001 | If the all-day flag is absent but the event's time values happen to span a full day (midnight to 11:59 PM), should the "All Day" badge be shown? The current time-based heuristic in `dateString` handles this case, but it is unclear whether this should also trigger the badge on the Detail Page. | If yes, the badge logic must include the time-based fallback; if no, only the explicit flag triggers the badge. |
| OQ-002 | Should the "All Day" badge on the Detail Page include the event name (as the existing list-view banner does), or should it display only the "All Day" label text? | Affects the badge's content and layout. |

---

## 11. References

- **Related in-app component**: Events list view already renders an "All Day" banner for events with the all-day flag set (see `EventsView`).
- **Existing all-day banner component**: A capsule-shaped "All Day" visual component already exists in the codebase (see `AllDayEventBannerView`).
- **All-day flag source**: The `isAllDay` field on event entries is provided by the upstream data source and is optional (may be absent).
- **Current time display logic**: The `dateString` property on calendar events formats time information; it contains a time-based heuristic that returns "All Day" for events starting at midnight and ending at 11:59 PM — but the Detail Page's time row may not always display this correctly when the `isAllDay` flag and the time heuristic disagree.
- **Repository**: https://github.com/gouveiahenrique/berkeley-mobile-ios
