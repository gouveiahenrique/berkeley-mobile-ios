# Business Requirements: ASDLC-516
# [Events Page] Display "All Day" Indicator Instead of Time on Event Detail Page

**Issue Key**: ASDLC-516  
**Date**: 2026-08-28  
**Status**: Draft  
**Complexity**: S (Small)

---

## 1. Executive Summary

When users open the detail page of an all-day event in the Berkeley Mobile app, the time row currently displays a misleading time value (e.g., "12:00 AM") instead of communicating that the event spans the entire day. The time row must instead display a clearly styled "All Day" indicator — in a capsule/pill shape — so users are never misled about whether the event has a specific start or end time.

---

## 2. Problem Statement

**Current State**: The Event Detail Page always renders a time value in its time row, even for events that are designated as all-day. The displayed time ("12:00 AM") is technically the stored start timestamp but carries no meaningful information for an all-day event; it actively misleads users into thinking the event starts at midnight.

**Desired State**: When an event is all-day, the time row on the Event Detail Page must display an "All Day" capsule/pill-shaped label and must not display any time value.

**Business Impact**:
- Users currently receive incorrect, confusing information about event timing.
- Correcting this prevents users from misinterpreting all-day events (e.g., academic deadlines, holidays) as midnight-only events.
- Consistent visual treatment of all-day events across the app builds trust in the accuracy of event information.

**Urgency**: The mismatch between the data (an all-day event) and the display (a specific time) constitutes a factual error visible to all users viewing all-day events.

---

## 3. Personas & User Stories

### Persona 1: Berkeley Student (Primary User)
- **Role**: UC Berkeley student browsing campus events
- **Goal**: Quickly understand when an event occurs without having to interpret raw timestamps
- **Pain Point**: Sees "12:00 AM" on an all-day event detail page and cannot tell whether the event starts at midnight or is simply an all-day occurrence

**User Story**:
> As a Berkeley student viewing an event detail page,  
> I want all-day events to clearly show an "All Day" indicator in place of a time,  
> So that I am not confused about whether a specific start or end time applies.

### Persona 2: Berkeley Faculty or Staff (Secondary User)
- **Role**: UC Berkeley staff member checking academic calendar events such as enrollment deadlines or holidays
- **Goal**: Confirm that a given date's event applies to the full day
- **Pain Point**: Wastes time cross-checking a misleading time value against other sources

**User Story**:
> As a faculty or staff member viewing academic calendar events,  
> I want all-day events to display an "All Day" label,  
> So that I can immediately confirm the event is not time-restricted.

---

## 4. Business Rules

**BR-001**: An event must be treated as all-day when its all-day designation is active. The system already provides an explicit all-day flag per event; this flag is the authoritative signal. The display must honor this flag — it must not fall back to rendering a time value when the event is designated as all-day.

**BR-002**: When an event is all-day, the time row on the Event Detail Page must display an "All Day" indicator styled as a capsule/pill-shaped label. No time value (hour, minute, AM/PM) may appear in the time row.

**BR-003**: When an event is NOT all-day, the time row must continue to display the event's start time (and end time if available), exactly as it does today. No change in behavior is permitted for timed events.

**BR-004**: The "All Day" indicator must be visually distinct from a plain text label. A capsule/pill shape is required to differentiate it from surrounding text rows (date row, location row) and communicate that it is a category label, not a time value.

**BR-005**: The appearance of the "All Day" indicator must be consistent with the app's existing visual language for all-day events. A pre-existing "All Day" capsule component already exists in the app (used in the events list); the detail page indicator must be visually coherent with that treatment.

**BR-006**: The all-day status must be determined using the explicit all-day flag provided per event, not inferred solely from time-based heuristics. This prevents edge cases where a timed event starting at midnight is incorrectly treated as all-day.

**Open Question (OQ-001)**: The existing `dateString` computed property uses time-based heuristics (start at midnight, end at 11:59:59) to determine all-day status, while the event data model also carries an explicit `isAllDay` flag. It is unclear whether these two signals are always in sync or whether one is authoritative. The technical team must confirm which signal the detail page should use as the single source of truth for all-day determination.

---

## 5. Acceptance Criteria

```gherkin
Feature: All Day Indicator on Event Detail Page

  Background:
    Given the user has opened the Berkeley Mobile app
    And the user has navigated to the Events section

  # --- Happy Path: All-Day Event ---

  Scenario: Time row shows "All Day" capsule for an all-day event
    Given an event is designated as an all-day event
    When the user taps on the event to open the Event Detail Page
    Then the time row displays a capsule/pill-shaped "All Day" label
    And the time row does not display any time value (hours, minutes, AM/PM)

  Scenario: "All Day" capsule is visually distinct from surrounding text rows
    Given an event is designated as an all-day event
    When the user views the Event Detail Page
    Then the "All Day" label appears in a capsule or pill shape
    And the capsule shape is visually distinguishable from the plain text date row and location row

  Scenario: All-day event shows correct date in date row
    Given an event is designated as an all-day event
    When the user views the Event Detail Page
    Then the date row still displays the event's date (e.g., "Today", "Tomorrow", or the formatted date)
    And only the time row is replaced by the "All Day" indicator

  # --- Happy Path: Timed Event (No Regression) ---

  Scenario: Time row shows start time for a timed event with no end time
    Given an event has a specific start time and no end time
    And the event is not designated as all-day
    When the user opens the Event Detail Page
    Then the time row displays the event's start time
    And no "All Day" label is shown

  Scenario: Time row shows start and end time for a timed event with an end time
    Given an event has both a specific start time and a specific end time
    And the event is not designated as all-day
    When the user opens the Event Detail Page
    Then the time row displays the event's start time and end time (e.g., "9:00 AM - 5:00 PM")
    And no "All Day" label is shown

  # --- Edge Cases ---

  Scenario: All-day event with no location still shows "All Day" indicator
    Given an event is designated as an all-day event
    And the event has no location set
    When the user opens the Event Detail Page
    Then the time row displays the "All Day" capsule label
    And the location row is absent (no empty location row is shown)

  Scenario: All-day event with description and action buttons
    Given an event is designated as an all-day event
    And the event has a description and a "Learn More" link
    When the user opens the Event Detail Page
    Then the time row displays the "All Day" capsule label
    And the description section and action buttons render correctly below

  Scenario: All-day event with isAllDay flag true and midnight start time
    Given an event has an explicit all-day designation
    And its stored start time happens to be midnight (00:00)
    When the user opens the Event Detail Page
    Then the time row displays the "All Day" capsule label
    And the time "12:00 AM" is not displayed

  Scenario: Timed event with start time at midnight is NOT shown as all-day
    Given an event has a start time of midnight (00:00)
    And the event is NOT designated as all-day
    When the user opens the Event Detail Page
    Then the time row displays "12:00 AM" (or the appropriate time)
    And no "All Day" label is shown

  Scenario: All-day event accessible via calendar view navigation
    Given an all-day event appears on the calendar view
    When the user selects that event from the calendar view and opens the detail page
    Then the time row on the Event Detail Page displays the "All Day" capsule label
    And no time value is shown
```

---

## 6. Non-Functional Requirements

**Performance**: The all-day detection and rendering of the "All Day" capsule must not introduce any perceptible delay in loading the Event Detail Page. Loading time must remain consistent with the current experience for timed events.

**Accessibility**: The "All Day" capsule label must be accessible to screen readers. The label must be announced by the system accessibility features as "All Day" so that users relying on assistive technology receive the same information as sighted users.

**Visual Consistency**: The capsule/pill shape must follow the app's existing design conventions for this type of indicator, maintaining visual coherence with the "All Day" treatment already used elsewhere in the Events section of the app.

**Reliability**: The all-day indicator must appear correctly for every all-day event, regardless of the event's category (e.g., holiday, academic deadline, default), source (campus calendar vs. other), or whether the event has optional fields (location, description, register link, source link) populated or absent.

**Maintainability**: The determination of whether an event is all-day and the rendering of the "All Day" indicator must be expressed in a single, clear location so that future changes to all-day logic require modification in one place only.

---

## 7. Edge Cases & Special Scenarios

| Scenario | Expected Behavior |
|---|---|
| All-day event with `isAllDay` flag true, start time at midnight | Show "All Day" capsule; never show "12:00 AM" |
| Timed event with start time of midnight, no all-day flag | Show "12:00 AM"; never show "All Day" |
| All-day event with no end date stored | Show "All Day" capsule based on all-day flag, not on end time presence |
| All-day event where `isAllDay` flag value is missing/null (not explicitly set) | Treat as NOT all-day and display time normally; flag this as a data quality issue for the data provider to resolve |
| All-day event opened from calendar view vs. event list | Behavior must be identical regardless of navigation path |
| All-day event image fails to load | "All Day" indicator must still render correctly alongside the placeholder image |

---

## 8. Out of Scope

- **Event list row view**: This issue concerns only the Event Detail Page. No changes are required to how events appear in list or calendar views, even if those views have separate all-day handling.
- **All-day event creation or editing**: This feature covers display only. Users cannot create or edit events in the app.
- **Backend or data pipeline changes**: The all-day flag is already provided per event. No changes to upstream data sources are required.
- **Changing all-day detection logic for the event list or calendar views**: Any existing all-day behavior in non-detail views must remain unchanged.
- **Localization of the "All Day" label**: Internationalization of this label is out of scope unless explicitly requested.
- **Animations or transition effects**: No animated entrance or exit for the "All Day" capsule is required.
- **Adding an "All Day" toggle for users**: Users cannot change the all-day status of events in the app.

---

## 9. Success Metrics

| Metric | Target |
|---|---|
| All-day events on detail page display "All Day" capsule, not a time | 100% of all-day events |
| Timed events on detail page continue to display time correctly (no regression) | 100% of timed events |
| "All Day" capsule passes accessibility audit (readable by screen reader) | Pass |
| No increase in crash rate or load time on Event Detail Page after release | No measurable change |

---

## 10. References

- **Repository**: berkeley-mobile-ios
- **Related views in codebase**: Event Detail Page header view, existing all-day banner component used in the event list
- **Related issue types**: Events Page display bugs
- **Design reference**: Existing "All Day" capsule treatment in the Events list (AllDayEventBannerView) serves as the visual precedent for the indicator style on the detail page
