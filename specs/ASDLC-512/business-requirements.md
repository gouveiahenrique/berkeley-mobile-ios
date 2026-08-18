# Business Requirements: ASDLC-512
## Display "All Day" Indicator Instead of Time on Event Detail Page

**Issue Key**: ASDLC-512  
**Date**: 2026-08-18  
**Status**: Draft  
**Complexity**: S (Small)

---

## 1. Executive Summary

When a campus event is marked as an all-day event, the Event Detail Page incorrectly displays a time value (e.g., "12:00 AM") in the time row instead of communicating that the event spans the full day. This misleads users into thinking the event has a specific start time. The time row must display a clearly styled "All Day" badge/capsule whenever the event is flagged as an all-day event, bringing the detail page into alignment with the event list, which already handles this distinction correctly.

---

## 2. Problem Statement

### Current State
The Event Detail Page contains a time row that always renders the start time of an event. When an event is an all-day event, the start time stored is midnight (12:00 AM), causing the time row to display "12:00 AM" — a value that is factually meaningless for an event without a specific start or end time.

The Events List page already distinguishes all-day events by displaying a dedicated visual banner instead of a time row. The Event Detail Page has not been updated to reflect this same logic, creating an inconsistency in how all-day events are communicated to the user.

### Desired State
When a user opens the Event Detail Page for an all-day event, the time row must display a visually distinct "All Day" capsule/badge label — not a time value. For events that are not all-day, behavior remains unchanged: the time row continues to display the event's start time (and end time if available).

### Business Impact
- **Users** receive accurate, unambiguous information about when to attend or plan for an event.
- **Product consistency**: the Events List and Event Detail Page communicate all-day events using a coherent visual language.
- **Trust**: displaying "12:00 AM" for an all-day event erodes confidence in the accuracy of the app's event data.

### Urgency
The inconsistency exists in a currently shipped feature. Any user who taps through to the detail page of an all-day event sees misleading information. The fix is well-scoped and poses no risk to unrelated features.

---

## 3. Personas & User Stories

### Primary Persona: Berkeley Student / Community Member (App User)
A UC Berkeley student or staff member who browses campus events in the app to decide which to attend.

**User Stories:**
- As an app user, when I open an all-day event's detail page, I want to immediately understand that the event has no specific start or end time, so I can plan my attendance without confusion.
- As an app user, I want the event detail page to visually match what I already see in the events list (an "All Day" indicator), so the experience feels consistent and trustworthy.

### Secondary Persona: Event Organizer / Campus Department
A department or student organization that publishes events and expects their all-day designation to be faithfully represented to viewers.

**User Story:**
- As an event organizer, I want the "All Day" flag I set on my event to be reflected accurately on the detail page, so attendees are not confused by a misleading time display.

---

## 4. Business Rules

**BR-001**: An event is considered "all-day" when it is explicitly flagged as such by the event data source. The all-day flag is the authoritative signal; time-of-day values on all-day events must not be interpreted as meaningful start/end times.

**BR-002**: On the Event Detail Page, when an event is flagged as all-day, the time row must display an "All Day" capsule/badge label. No time value (hours, minutes, AM/PM) must be shown in this row for an all-day event.

**BR-003**: On the Event Detail Page, when an event is NOT flagged as all-day, the time row must display the event's start time (and end time if available) exactly as it does today. No change to non-all-day event behavior is permitted by this requirement.

**BR-004**: The "All Day" badge displayed on the Event Detail Page must be visually consistent with the "All Day" indicator already used on the Events List page (capsule/pill shape).

**BR-005**: The time row icon (clock icon) must remain visible alongside the "All Day" badge so the row retains its visual meaning within the detail layout.

**BR-006**: If the all-day flag for an event is absent or indeterminate (not explicitly set), the system must treat the event as NOT all-day and display the time value. No default-to-all-day fallback is permitted.

---

## 5. Acceptance Criteria

```gherkin
Feature: Event Detail Page — All Day Indicator

  Scenario: All-day event shows "All Day" badge instead of time
    Given an event is flagged as an all-day event by the data source
    When a user navigates to that event's Detail Page
    Then the time row displays an "All Day" capsule/badge label
    And no time value (e.g., "12:00 AM") is visible in the time row
    And the clock icon remains visible next to the "All Day" badge

  Scenario: Non-all-day event continues to show time value
    Given an event is NOT flagged as an all-day event
    And the event has a defined start time
    When a user navigates to that event's Detail Page
    Then the time row displays the event's start time
    And the time row displays the event's end time if one exists
    And no "All Day" badge is shown

  Scenario: Non-all-day event with no end time shows only start time
    Given an event is NOT flagged as an all-day event
    And the event has a start time but no end time
    When a user navigates to that event's Detail Page
    Then the time row displays only the event's start time
    And no end time is shown
    And no "All Day" badge is shown

  Scenario: All-day flag is absent — treated as non-all-day
    Given an event's all-day flag is absent or indeterminate
    When a user navigates to that event's Detail Page
    Then the time row displays the event's start time
    And no "All Day" badge is shown

  Scenario: All-day badge visual style matches Events List
    Given a user views an all-day event's Detail Page
    When the "All Day" badge renders in the time row
    Then the badge is displayed with a capsule/pill shape
    And the badge is visually consistent with the "All Day" indicator used on the Events List page
```

---

## 6. Non-Functional Requirements

### Consistency
- The visual treatment of "All Day" events on the detail page must match the established pattern used on the Events List page. The same badge style, label text ("All Day"), and capsule shape must be used.

### Accuracy
- The all-day determination must rely solely on the explicit all-day flag provided by the data source. Inferring all-day status from time values (e.g., midnight start) is not an acceptable behavior for this feature.

### Performance
- This change involves only conditional display logic on an already-loaded event object. No additional network requests or data fetches are required. Performance impact must be zero.

### Accessibility
- The "All Day" badge must be readable by screen readers with meaningful accessible label text (e.g., "All Day event").
- Color contrast of the badge must meet standard accessibility guidelines.

### Scope of Impact
- Changes must be isolated to the Event Detail Page's time row rendering. No other views, screens, or data flows must be altered.

---

## 7. Edge Cases & Special Scenarios

**EC-001 — All-day flag is `nil`/absent**: Treated as non-all-day (BR-006). The time value is displayed. This prevents an ambiguous flag from silently hiding time information.

**EC-002 — All-day event with no end time stored**: The "All Day" badge must still display when the all-day flag is true, regardless of whether an end date/time value is present.

**EC-003 — All-day event where stored start time is midnight (00:00:00)**: The time value must NOT be shown. The all-day flag takes precedence; the midnight time is an artifact of data storage, not user-facing information.

**EC-004 — Event where time-based heuristic and all-day flag disagree**: The explicit all-day flag is always authoritative. If the flag is `true`, the "All Day" badge must be shown even if the stored times do not match any specific time pattern.

**EC-005 — All-day event with location**: The "All Day" badge and the location row must both be visible on the detail page simultaneously. These rows are independent.

**EC-006 — All-day event with no description**: The detail page must render the "All Day" badge correctly regardless of whether a description section is present.

---

## 8. Out of Scope

- **Events List page changes**: The Events List already handles all-day events correctly with a full-row banner. No changes to the list view are included in this requirement.
- **Academic Calendar page**: Any separate academic calendar feature is not in scope.
- **All-day flag data sourcing**: How the all-day flag is set, stored, or provided by the backend is not in scope. This requirement only addresses how the existing flag is displayed.
- **Calendar integration behavior**: How all-day events are added to the device calendar (via the "Add to Calendar" action) is not in scope.
- **Retroactive data correction**: Correcting historical event records that may have been stored without an all-day flag is not in scope.
- **Other event detail fields**: Changes to the date row, location row, description, or action buttons are not in scope.
- **Event Row View in list**: `EventRowView` (used for non-all-day events in the list) is not in scope.

---

## 9. Success Metrics

| Metric | Target |
|--------|--------|
| All-day events on detail page display "All Day" badge instead of time | 100% of events with `isAllDay = true` |
| Non-all-day events on detail page display time value unchanged | 100% of events with `isAllDay != true` |
| Zero regression in non-all-day event time display | Verified by manual testing and UI snapshot tests |
| "All Day" badge style matches Events List indicator | Visual parity confirmed in design review |
| No new network calls introduced by this change | Confirmed by code review |

---

## 10. References

- **ASDLC-512**: Original issue — "Display (All Day) Indicator Instead of Time on Event Detail Page"
- **Repository (iOS)**: https://github.com/gouveiahenrique/berkeley-mobile-ios.git
- **Repository (Emerge)**: https://github.com/gouveiahenrique/emerge.git
- **Related Views**:
  - `EventDetailView` — contains the time row requiring update
  - `AllDayEventBannerView` — existing "All Day" capsule component used in the Events List; serves as the visual reference for this change
  - `EventsView` — Events List page that already handles all-day events correctly via the `isAllDay` flag
  - `BMCalendarEvent` protocol — defines the `dateString` computed property (time-based heuristic); the all-day flag, not this string, is the authoritative source for this feature
  - `BMEventCalendarEntry` — event data model containing the `isAllDay: Bool?` field provided by the backend
