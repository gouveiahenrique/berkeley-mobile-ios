# Business Requirements: Display "All Day" Indicator on Event Detail Page

**Issue Key**: ASDLC-510  
**Date**: 2026-08-05  
**Status**: Draft  
**Complexity**: S (Small)

---

## 1. Executive Summary

When a calendar event is marked as an all-day event, the Event Detail Page incorrectly displays a time value (e.g., "12:00 AM") in the time row, which misleads users into believing a specific start time exists. This specification defines the requirement to replace that misleading time display with a clearly labeled "All Day" indicator, consistent with how all-day events are communicated elsewhere in the app.

---

## 2. Problem Statement

**Current State**: On the Event Detail Page, the time row always renders a time string derived from the event's date information. For all-day events, this produces a misleading "12:00 AM" display because the time component is technically midnight — not a meaningful start time.

**Desired State**: When an event is an all-day event, the time row on the Event Detail Page must display an "All Day" badge/capsule in place of any time value, clearly communicating that the event spans the entire day and has no specific start or end time.

**Business Impact**:
- Users currently receive incorrect information when viewing all-day events, eroding trust in the app's event data.
- Correcting this aligns the detail page with accurate event metadata and improves user comprehension.

**Urgency**: The current behavior actively misinforms users. Any all-day event visible in the app surfaces this bug, so it affects all users who tap into all-day event details.

---

## 3. Personas & User Stories

### Primary Persona: Berkeley Mobile App User

A UC Berkeley student, staff member, or community member using the Berkeley Mobile iOS app to browse and track campus events.

**User Story**:  
As an app user viewing an event's detail page, I want to clearly see whether an event is an all-day event so that I can plan my schedule accurately without being confused by a displayed time that does not apply.

**Pain Point**: The current "12:00 AM" display causes users to assume events start at midnight, leading to scheduling confusion.

---

## 4. Business Rules

**BR-001**: An event is considered an "all-day" event when its `isAllDay` flag is set to true OR when its time data indicates it spans the full day (start at midnight through 11:59 PM).

**BR-002**: When an event is determined to be an all-day event (per BR-001), the time row on the Event Detail Page must NOT display any time value (e.g., "12:00 AM", "12:00 AM - 11:59 PM").

**BR-003**: When an event is determined to be an all-day event (per BR-001), the time row must display an "All Day" indicator rendered as a capsule/pill-shaped badge.

**BR-004**: When an event is NOT an all-day event, the time row must continue to display the event's start time and end time (if available) exactly as it does today — no change to timed-event behavior.

**BR-005**: The "All Day" indicator must appear in the same position as the time row currently occupies on the Event Detail Page, maintaining visual consistency with the date and location rows.

**BR-006**: The responsibility for determining whether an event is all-day rests with the existing event data already provided by the backend — the app must read the `isAllDay` flag or equivalent time-based signal already present on the event object. The app must not independently re-derive all-day status from raw dates without consulting that flag.

> **Open Question OQ-001**: Which signal takes precedence for determining all-day status — the explicit `isAllDay` boolean field on the event object, or the time-range heuristic (midnight start / 11:59 PM end) used in the existing `dateString` computed property? These two mechanisms may disagree (e.g., `isAllDay = true` but times are not midnight/11:59 PM, or vice versa). The authoritative source must be confirmed with the backend/data team before implementation.

---

## 5. Acceptance Criteria

```gherkin
Feature: All Day Indicator on Event Detail Page

  Scenario: All-day event displays "All Day" badge instead of time
    Given a user is viewing the Event Detail Page for an event marked as all-day
    When the detail page renders the time row
    Then the time row must display an "All Day" capsule/pill badge
    And no time value (e.g., "12:00 AM") must appear in the time row

  Scenario: Timed event continues to display time normally
    Given a user is viewing the Event Detail Page for an event with a specific start time
    When the detail page renders the time row
    Then the time row must display the event's start time
    And if the event has an end time, the end time must also be displayed
    And no "All Day" badge must appear

  Scenario: Timed event with only a start time (no end time)
    Given a user is viewing the Event Detail Page for an event with a start time but no end time
    When the detail page renders the time row
    Then the time row must display only the start time
    And no "All Day" badge must appear

  Scenario: All-day event detail page is otherwise unchanged
    Given a user is viewing the Event Detail Page for an all-day event
    When the page fully renders
    Then the date row must continue to display the event date as before
    And the location row must continue to display the event location (if available) as before
    And the event name, description, and action buttons must be unaffected
```

---

## 6. Non-Functional Requirements

**NFR-001 — Visual Consistency**: The "All Day" badge must be visually consistent with the existing capsule/pill component already used in the app's event list views for all-day event indicators. Users must recognize it as the same concept across contexts.

**NFR-002 — Accessibility**: The "All Day" badge text must be readable by the platform's accessibility tools (e.g., screen readers) so that users relying on assistive technology receive the same information as sighted users.

**NFR-003 — Performance**: The all-day determination and badge rendering must add no perceptible delay to the Event Detail Page load time.

**NFR-004 — Localization**: The "All Day" label text must be defined in a way that supports future localization (translation), consistent with how other display strings in the app are managed.

---

## 7. Edge Cases & Special Scenarios

**EC-001 — Conflicting all-day signals**: If the `isAllDay` flag and the time-range heuristic disagree, the system must apply a single consistent rule. The authoritative rule must be determined before implementation (see OQ-001 above). Until resolved, this is a blocker.

**EC-002 — Missing end time on all-day event**: If an event is all-day but has no end time recorded, the "All Day" badge must still display correctly. No time value must appear.

**EC-003 — All-day event occurring today**: If the all-day event falls on today's date (the date row shows "Today"), the time row must still show the "All Day" badge — the "Today" label and the "All Day" badge must coexist correctly in their respective rows.

**EC-004 — All-day event occurring tomorrow**: Same as EC-003, with the date row showing "Tomorrow". The badge behavior is unchanged.

**EC-005 — All-day multi-day event**: If an event spans multiple calendar days and is all-day, the time row must display the "All Day" badge. The date row must continue to display the start date as before (multi-day date range display is out of scope for this issue).

---

## 8. Out of Scope

- Changes to how all-day events appear in the event list/calendar views (those views are handled separately).
- Changes to the date row display logic.
- Multi-day date range display in the date row.
- Changes to how events are added to the user's device calendar.
- Server-side or data pipeline changes to the `isAllDay` field.
- Any redesign of the Event Detail Page layout beyond the time row.
- Localization implementation for "All Day" (must be structured to support it, but the translation work itself is out of scope).

---

## 9. Success Metrics

- **SM-001**: 100% of all-day events shown on the Event Detail Page display the "All Day" badge with no time value visible.
- **SM-002**: 100% of timed events shown on the Event Detail Page continue to display time values exactly as before — no regression.
- **SM-003**: Zero user-facing instances of "12:00 AM" or equivalent midnight times appearing for all-day events post-release.
- **SM-004**: The "All Day" badge is visually identical in style (capsule/pill shape) to the existing all-day indicator used in other parts of the app.

---

## 10. References

- **Related component**: `AllDayEventBannerView` — an existing capsule-style "All Day" indicator component already present in the app's Events module, used in event list contexts. This component or its visual style should inform the badge design on the detail page.
- **Affected view**: Event Detail Page, specifically the time row within the event header card.
- **Event data model**: Event objects carry an explicit `isAllDay` boolean field AND a time-range-based all-day heuristic in the `dateString` computed property. These must be reconciled (see OQ-001).
- **GitHub Repository**: https://github.com/gouveiahenrique/berkeley-mobile-ios
