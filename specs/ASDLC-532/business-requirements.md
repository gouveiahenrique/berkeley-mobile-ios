# Business Requirements: ASDLC-532
## [Events Page] Display "All Day" Indicator Instead of Time on Event Detail Page

**Issue Key**: ASDLC-532  
**Date**: 2026-09-27  
**Complexity**: S (Small)

---

## 1. Executive Summary

When a user opens the detail page for an all-day event, the time row currently displays a misleading time value (e.g., "12:00 AM") instead of communicating that the event has no specific start or end time. This specification defines the requirement to replace the displayed time value with an "All Day" capsule/badge indicator on the Event Detail Page whenever an event is marked as an all-day event, eliminating user confusion.

---

## 2. Problem Statement

**Current State**:  
The Event Detail Page contains a time row that always renders a time value. When the event is an all-day event, the time row displays "12:00 AM" — a value that is technically an artifact of how all-day events are stored (with a midnight start time), not a meaningful time the user should see.

**Desired State**:  
When the event is an all-day event, the time row must display an "All Day" indicator — styled as a capsule/pill-shaped badge — instead of any time value. This clearly communicates that no specific start or end time applies to the event.

**Business Impact**:  
Users who open an all-day event detail page are given inaccurate information, which erodes trust in the Events feature and causes confusion about whether an event truly has a midnight start time or is a full-day event. Fixing this ensures the detail page is a reliable source of event information.

**Urgency**:  
The current behavior actively misleads users every time they view an all-day event detail, making this a correctness defect rather than a cosmetic improvement.

---

## 3. Personas & User Stories

### Primary Persona: Berkeley Mobile App User (Student / Staff / Faculty)

A person who uses the Berkeley Mobile app to browse and plan around campus events. They open the Event Detail Page to confirm event timing before deciding whether to attend.

**User Story**:  
As a Berkeley Mobile app user, when I open the detail page of an all-day event, I want to see a clear "All Day" label instead of a specific time, so that I immediately understand this event has no fixed start or end time.

### Secondary Persona: Event Organizer (Data Producer)

A person or system that creates events and designates them as all-day events. They expect that the "all-day" designation is faithfully communicated to app users without distortion.

**User Story**:  
As an event organizer who marks an event as all-day, I want the Event Detail Page to reflect the all-day designation accurately, so that attendees are not confused by a displayed time that does not apply.

---

## 4. Business Rules

**BR-001**: An event is classified as an all-day event when the event data carries an explicit all-day designation from the data source.

**BR-002**: When an event is classified as all-day (BR-001), the time row on the Event Detail Page must display an "All Day" indicator in place of any time value.

**BR-003**: When an event is NOT classified as all-day, the time row must continue to display the event's start time and, where available, the end time, unchanged from current behavior.

**BR-004**: The "All Day" indicator must be visually distinct from plain text — it must be rendered as a capsule/pill-shaped badge to signal that it represents a category of timing, not a clock reading.

**BR-005**: The "All Day" indicator must contain the text "All Day".

**BR-006**: The date row on the Event Detail Page is not affected by this change and must continue to display the event date as it currently does for all events.

**BR-007**: The classification of an event as all-day must be determined by a single, authoritative source of truth within the data. Any discrepancy between multiple all-day detection mechanisms in the system is an implementation concern to be resolved by the technical team; the business requirement is that the displayed result must accurately reflect the event's intended all-day status.

**BR-008**: The "All Day" indicator must meet accessibility standards: it must be perceivable by screen readers and convey the same meaning as the visual label.

---

## 5. Acceptance Criteria

```gherkin
Feature: All Day Indicator on Event Detail Page

  Background:
    Given the user is using the Berkeley Mobile app
    And the user navigates to the Events section

  Scenario: All-day event displays "All Day" badge on detail page
    Given an event is marked as an all-day event in the data source
    When the user taps the event to open its detail page
    Then the time row displays an "All Day" capsule/pill-shaped badge
    And the time row does not display any clock-based time value (e.g., "12:00 AM", "3:00 PM")
    And the date row continues to display the event date as normal

  Scenario: Non-all-day event continues to display start and end time
    Given an event is NOT marked as an all-day event
    And the event has a defined start time and end time
    When the user taps the event to open its detail page
    Then the time row displays the event's start time and end time
    And the time row does not display an "All Day" badge

  Scenario: Non-all-day event with only a start time displays start time only
    Given an event is NOT marked as an all-day event
    And the event has a defined start time but no end time
    When the user taps the event to open its detail page
    Then the time row displays only the event's start time
    And the time row does not display an "All Day" badge

  Scenario: "All Day" badge is readable by screen readers
    Given an event is marked as an all-day event
    When the user opens the event detail page with a screen reader active
    Then the screen reader announces the "All Day" status for the time row
    And the announcement conveys the same meaning as the visual badge

  Scenario: All-day event accessed from the Events list banner
    Given an all-day event is displayed as a banner in the Events list
    When the user taps the banner to open the event detail page
    Then the time row on the detail page displays the "All Day" badge
    And the date row displays the event date as normal

  Scenario: Event detail page for non-all-day event is not affected
    Given a mix of all-day and non-all-day events exists in the Events list
    When the user opens the detail page of a non-all-day event
    Then the time row shows the event's time (not an "All Day" badge)
    When the user navigates back and opens the detail page of an all-day event
    Then the time row shows the "All Day" badge (not a time value)
```

---

## 6. Non-Functional Requirements

**Accessibility**:  
- The "All Day" badge must be readable by system screen readers with a meaningful label (same as its visible text: "All Day").
- The badge must have sufficient color contrast against its background to be perceivable by users with visual impairments, in compliance with standard mobile accessibility guidelines.

**Consistency**:  
- The visual style of the "All Day" badge must feel native to the existing Events feature design language. The capsule/pill shape is specified as the target style.

**Performance**:  
- The change must not introduce any perceptible delay in loading or rendering the Event Detail Page. The all-day determination must be made from already-available event data without requiring additional network requests.

**Reliability**:  
- The all-day classification must produce a deterministic result for any given event. An event must never oscillate between showing a time and showing the badge across multiple views of the same event detail page.

---

## 7. Edge Cases & Special Scenarios

**EC-001 — All-day flag present, but time components are also set**:  
If an event carries an explicit all-day designation AND has time components that look like a regular timed event, the explicit all-day designation takes precedence. The "All Day" badge must be shown.

**EC-002 — All-day flag absent, but time components suggest an all-day event (midnight start)**:  
Open question: If no explicit all-day flag is present but the event starts at midnight and ends near end-of-day, should the event be treated as all-day for display purposes? The technical team must clarify the authoritative all-day signal and resolve this as part of implementation (see BR-007). The business requirement is that the result accurately reflects user intent.

**EC-003 — All-day event with no end time**:  
If an all-day event has a start but no end time, the "All Day" badge must still be displayed. The badge replaces the entire time display; no partial time is shown.

**EC-004 — Event data missing all-day designation entirely**:  
If an event record contains no all-day designation (the field is absent or null), the event must be treated as a timed event and display whatever time information is available. The "All Day" badge must not appear for events with missing designations.

**EC-005 — Badge legibility in dark mode**:  
The "All Day" badge must render legibly in both light and dark appearance modes.

---

## 8. Out of Scope

- Changes to the Events list view (the all-day banner row in the list is already implemented and is not part of this change).
- Changes to how all-day events are created, edited, or stored in the data source.
- Modification of time display logic for non-all-day events.
- Adding or removing the time row itself — the row continues to exist for all events; only its content changes for all-day events.
- Changes to any other screen or feature beyond the Event Detail Page time row.
- Internationalisation or translation of the "All Day" label (out of scope unless existing app localisation patterns already require it).
- Backend or data source changes to how events are flagged as all-day.

---

## 9. Success Metrics

| Metric | Target |
|---|---|
| All-day events show "All Day" badge on detail page | 100% of all-day events |
| Non-all-day events show correct time on detail page | 100% of non-all-day events |
| No time value (e.g., "12:00 AM") visible for all-day events | 0 occurrences |
| Badge is announced correctly by screen reader | Pass on standard accessibility audit |
| No regression in detail page load time | No measurable increase |

---

## 10. References

- **Repository**: berkeley-mobile-ios (github.com/gouveiahenrique/berkeley-mobile-ios)
- **Related feature**: Events list view (all-day banner — `AllDayEventBannerView`), which already correctly identifies and visually distinguishes all-day events in the list; the Event Detail Page must achieve the same clarity.
- **Reported behaviour**: Issue description — ASDLC-532
