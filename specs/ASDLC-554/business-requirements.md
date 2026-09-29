# Business Requirements: ASDLC-554
## [Events Page] Display "All Day" Indicator Instead of Time on Event Detail Page

**Issue Key**: ASDLC-554  
**Date**: 2026-09-29  
**Status**: Ready for Technical Implementation  
**Complexity**: S (Small)

---

## 1. Executive Summary

When a campus event is designated as an "All Day" event, the Event Detail Page incorrectly displays a time value (e.g., "12:00 AM") in the time row, which is misleading to users. The time row must instead display a visually distinct "All Day" indicator — styled as a capsule/badge — to accurately communicate that the event spans the entire day without a specific start or end time.

---

## 2. Problem Statement

### Current State
On the Event Detail Page, every event displays a time row showing the event's start and optional end time. When an event is designated as an "All Day" event, the time row still renders a time value (currently "12:00 AM"), which is the technical default time stored for all-day events. This creates misleading information for the user, implying the event starts at midnight.

### Desired State
When an event is an "All Day" event, the time row must display an "All Day" badge or capsule indicator in place of any time value. The indicator must be visually distinct from a standard time display so users immediately understand no specific time applies.

### Business Impact
- **End users**: Students and community members viewing campus events receive incorrect information, potentially causing confusion about event timing.
- **Trust**: Displaying "12:00 AM" for all-day events (e.g., university holidays, academic enrollment periods) erodes confidence in the app's accuracy.

### Urgency
The misinformation is visible to all users browsing any all-day event. There is no workaround for end users. The fix is scoped and low-risk.

---

## 3. Personas & User Stories

### Primary Persona: Berkeley Mobile App User
**Description**: A UC Berkeley student, faculty member, or community member browsing campus events through the Berkeley Mobile app.  
**Goals**: Understand when and where events take place so they can plan attendance.  
**Pain Point**: Seeing "12:00 AM" on an all-day event (e.g., "Cal Day", a university holiday) creates confusion about whether the event has a specific start time.

**User Story**:
> As a Berkeley Mobile app user, when I tap on an all-day event to view its details, I want the time row to clearly show "All Day" instead of a misleading time value, so that I understand the event is not time-restricted and spans the whole day.

### Secondary Persona: Event Organizer / Content Publisher
**Description**: A university department or organization that publishes events to the Berkeley events calendar, designating some as all-day events.  
**Goals**: Ensure events are represented accurately to attendees.  
**Pain Point**: Their correctly-configured all-day event is misrepresented in the mobile app.

---

## 4. Business Rules

**BR-001: All-Day Event Detection**
An event must be treated as an "All Day" event when the event's all-day flag is set to true by the data source. The system must rely on the explicit all-day designation provided with the event data — not attempt to infer all-day status from time values alone.

**BR-002: Time Row Display for All-Day Events**
When an event is an "All Day" event (per BR-001), the time row on the Event Detail Page must display an "All Day" indicator and must NOT display any time value (no start time, no end time, no time range).

**BR-003: Time Row Display for Timed Events**
When an event is NOT an "All Day" event, the time row on the Event Detail Page must continue to display the event's start time, and end time if available, exactly as it does today. No change in behavior for timed events.

**BR-004: "All Day" Indicator Visual Style**
The "All Day" indicator must be rendered as a capsule/pill-shaped badge to visually distinguish it from a standard time text string. The indicator must contain the label "All Day".

**BR-005: Consistency with Existing All-Day Indicator**
The "All Day" capsule displayed on the Event Detail Page must be visually consistent with the existing "All Day" banner/capsule component already used elsewhere in the Events section of the app.

**BR-006: No Other Rows Affected**
Only the time row on the Event Detail Page is in scope. The date row, location row, event name, description, and action buttons must not change for any event type.

---

## 5. Acceptance Criteria

```gherkin
Feature: Event Detail Page — All Day Indicator

  Scenario: Viewing detail page of an All Day event
    Given the user is on the Events page
    And there exists an event designated as an "All Day" event
    When the user taps on that event to open its Event Detail Page
    Then the time row displays an "All Day" capsule/badge indicator
    And the time row does NOT display any time value (e.g., "12:00 AM", "12:00 AM - 11:59 PM")
    And the "All Day" capsule is visually styled as a pill/capsule shape
    And the "All Day" capsule contains the text "All Day"

  Scenario: Viewing detail page of a timed event
    Given the user is on the Events page
    And there exists an event that is NOT an "All Day" event
    When the user taps on that event to open its Event Detail Page
    Then the time row displays the event's start time
    And if the event has an end time, the time row also displays the end time
    And no "All Day" indicator is shown

  Scenario: Viewing detail page of a timed event with only a start time
    Given the user is on the Events page
    And there exists a timed event with a start time but no end time
    When the user taps on that event to open its Event Detail Page
    Then the time row displays only the event's start time
    And no "All Day" indicator is shown

  Scenario: All Day event detection uses the explicit flag, not time inference
    Given an event that is explicitly designated as "All Day" by the data source
    But whose stored time values do not exactly match midnight-to-end-of-day
    When the user views that event's detail page
    Then the time row still displays the "All Day" indicator
    And no time value is shown

  Scenario: Non-All-Day event with midnight start time is not treated as All Day
    Given an event that is NOT designated as "All Day"
    But whose start time happens to be midnight (12:00 AM)
    When the user views that event's detail page
    Then the time row displays the start time (e.g., "12:00 AM") as a standard timed event
    And no "All Day" indicator is shown

  Scenario: All Day indicator is visually consistent with existing All Day banner
    Given the user views an All Day event's detail page
    When the "All Day" indicator is rendered in the time row
    Then its capsule style must be consistent with the All Day capsule used elsewhere in the Events section
```

---

## 6. Non-Functional Requirements

### Usability
- **NFR-001**: The "All Day" capsule must be legible at the same font size and display environment as the surrounding event detail rows (normal lighting, standard and large accessibility text sizes).
- **NFR-002**: The indicator must be rendered inline within the existing time row area — it must not cause layout shifts or push other detail rows out of their normal positions.

### Consistency
- **NFR-003**: The visual language of the "All Day" capsule must conform to the existing design patterns used in the Events section of the app.
- **NFR-004**: Dark mode and light mode rendering must both be handled correctly, consistent with how other event detail elements behave.

### Performance
- **NFR-005**: The determination of whether an event is "All Day" must add no perceptible latency — it must be evaluated from data already present in the event model, with no additional network calls.

### Reliability
- **NFR-006**: If an event's all-day flag is absent or nil (rather than explicitly true or false), the system must default to treating the event as a timed event and display whatever time data is available.

---

## 7. Edge Cases & Special Scenarios

| Scenario | Expected Behavior |
|---|---|
| All-day flag is `true`, time values are midnight-to-end-of-day | Display "All Day" capsule, hide time text |
| All-day flag is `true`, time values do NOT match midnight-to-end-of-day | Display "All Day" capsule (flag takes precedence), hide time text |
| All-day flag is `false`, start time is midnight | Display time value "12:00 AM", do NOT show "All Day" capsule |
| All-day flag is `nil`/absent | Default to timed behavior; display whatever time data is available |
| All-day event has no location set | Time row shows "All Day" capsule; location row remains hidden as usual |
| All-day event has a description | Time row shows "All Day" capsule; description section renders normally below |
| User navigates to multiple all-day events in succession | Each detail page correctly shows "All Day" capsule for each |

---

## 8. Out of Scope

The following are explicitly NOT part of this requirement:

- **Event list/row view**: The event list rows (e.g., `EventRowView`) already display the date string — changes to how all-day events are presented in the list view are out of scope.
- **All Day banner in calendar view**: The `AllDayEventBannerView` shown in the calendar strip view is separate from the Event Detail Page time row — no changes to that component.
- **Date row behavior**: The date row on the Event Detail Page (showing day/month/year) must not change for any event type.
- **`dateString` computed property logic**: Changes to how `dateString` formats or detects all-day events in the shared protocol are out of scope — the fix targets only the Event Detail Page's time row display.
- **Backend/data source changes**: No changes to how events are stored, fetched, or transmitted are in scope. The fix relies on the existing `isAllDay` field already provided in event data.
- **New event creation or editing**: This requirement covers read-only display only.
- **Other event detail pages or screens** outside the Events module.
- **Accessibility announcements** (VoiceOver label customization) — these may be addressed in a separate accessibility pass.

---

## 9. Success Metrics

| Metric | Target |
|---|---|
| All-day events on the Event Detail Page show "All Day" capsule | 100% of all-day events |
| Timed events on the Event Detail Page show correct time value | 100% of timed events (no regression) |
| No layout breakage on Event Detail Page for either event type | 0 layout issues reported |
| Visual style of "All Day" capsule matches existing All Day capsule component | Verified by design review |

---

## 10. References

- **Related file**: Event Detail Page — `EventDetailView.swift` (time row in `BMDetailHeaderView`)
- **Related file**: Event data model — `BMEventCalendarEntry.swift` (contains `isAllDay: Bool?` field)
- **Related file**: Shared all-day detection logic — `BMCalendarEvent.swift` (`dateString` extension, detects all-day via time components)
- **Related component**: `AllDayEventBannerView.swift` — existing capsule-style "All Day" component used in the Events section; the detail page indicator must be consistent with this
- **Repository**: berkeley-mobile-ios
- **Issue**: ASDLC-554

### Open Questions

> **OQ-001**: When the `isAllDay` flag is `true` but the existing `dateString` logic (which uses time-component matching) would NOT produce "All Day" — which source of truth takes precedence for the detail page time row?  
> **Recommended answer**: The explicit `isAllDay` flag should take precedence over time-component inference. This ensures correct behavior even when time values are stored with slight variation. This should be confirmed by the product owner before implementation.

> **OQ-002**: Should the "All Day" indicator in the time row match the exact visual style of the `AllDayEventBannerView` (gray capsule with "All Day" label and event name), or should it be a simpler standalone "All Day" label within a capsule (without repeating the event name)?  
> **Recommended answer**: A simpler capsule with only the "All Day" label, since the event name is already prominently displayed above in the header. Confirm with design before implementation.
