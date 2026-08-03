# Business Requirements: ASDLC-498 — Display "All Day" Indicator on Event Detail Page

**Status:** Draft
**Created:** 2026-08-03

---

## 1. Executive Summary

When a campus event is designated as an all-day event, the Event Detail Page currently misleads users by displaying a specific time value (e.g., "12:00 AM") in the time row. This requirement specifies that the time row must instead display a visually distinct "All Day" indicator — styled as a capsule/pill badge — whenever the event is marked as all-day, giving users accurate and unambiguous information about the event's schedule.

---

## 2. Problem Statement

**Current State:**
The Event Detail Page displays a time row with a clock icon and a time value for every event. When the event is designated as all-day, this time row shows "12:00 AM", which is a misleading artifact rather than a meaningful start time. No visual distinction exists to communicate that the event spans the entire day rather than starting at a specific hour.

**Desired State:**
When a user views the detail page of an all-day event, the time row must display a clearly styled "All Day" badge in place of any time value. The badge must be visually distinct from a regular time display so that users immediately understand the event covers the entire day with no specific start or end time.

**Business Impact:**
- Users are actively misled into believing all-day events start at midnight, which could cause confusion about attendance or scheduling.
- Trust in the app's accuracy erodes when displayed information contradicts reality.
- Students relying on Berkeley Mobile as their primary event discovery tool may miss or misinterpret campus-wide events.

**Urgency:**
The incorrect time display is an active accuracy bug affecting every all-day event viewed in detail. There is no workaround for end users. The fix is narrowly scoped and does not require backend or data changes.

---

## 3. Personas & User Stories

### Primary Persona: Student Event Browser

A UC Berkeley student who uses the app to discover and plan attendance at campus events (lectures, festivals, open days, etc.). They view event detail pages to confirm timing before attending.

**User Story:**
> As a student browsing campus events, I want the Event Detail Page to clearly show "All Day" for events that have no specific start time, so that I am not misled into thinking the event starts at midnight.

### Secondary Persona: Event Administrator (Indirect)

A campus department or organisation that publishes all-day events through the university's event system. They rely on the mobile app to accurately represent their events to students.

**User Story:**
> As an event administrator, I want all-day events I publish to be displayed accurately in the mobile app, so that students receive correct information without needing additional clarification.

---

## 4. Business Rules

**BR-001:** When an event is designated as all-day by the upstream event data source, the Event Detail Page time row must display an "All Day" indicator and must not display any time value.

**BR-002:** The "All Day" indicator must be rendered as a capsule/pill-shaped badge to visually distinguish it from the standard time display row (which shows a clock icon and a time string).

**BR-003:** The all-day status of an event must be determined exclusively by the authoritative all-day flag provided by the upstream data source. Time-based heuristics (e.g., checking whether a start timestamp equals midnight) must not be used as a substitute for this flag.

**BR-004:** When an event is not designated as all-day, the time row must continue to display the event's formatted start time exactly as it does today. The all-day change must not affect the display of timed events.

**BR-005:** The "All Day" badge must use the application's existing visual design system for colour and typography, with no raw or hardcoded colour or font values introduced.

**BR-006:** If the upstream all-day flag is absent or undefined for a given event, the system must treat the event as not all-day and fall back to the standard time display. No crash or blank state is acceptable.

---

## 5. Acceptance Criteria

```gherkin
Feature: All Day indicator on Event Detail Page

  Background:
    Given the user has opened the Berkeley Mobile app
    And the user is viewing the Events section

  Scenario: All-day event displays the "All Day" badge in the time row
    Given an event whose all-day flag is set to true by the data source
    When the user taps the event to open its detail page
    Then the time row displays an "All Day" capsule badge
    And the time row does not display any time value (e.g., "12:00 AM", "10:30 AM")
    And the clock icon is not shown alongside the badge

  Scenario: Timed event continues to display its start time unchanged
    Given an event whose all-day flag is set to false or is absent
    When the user taps the event to open its detail page
    Then the time row displays the event's formatted start time
    And the time row displays a clock icon alongside the time
    And no "All Day" badge is shown

  Scenario: All-day event with no end date specified
    Given an event whose all-day flag is set to true
    And the event has no end date or time recorded
    When the user taps the event to open its detail page
    Then the time row displays the "All Day" capsule badge
    And the app does not crash or show a blank time row

  Scenario: All-day event whose raw timestamps do not align to midnight
    Given an event whose all-day flag is explicitly set to true
    And the event's underlying start timestamp is not exactly midnight
    When the user taps the event to open its detail page
    Then the time row still displays the "All Day" capsule badge
    And does not fall back to displaying the raw timestamp as a time value

  Scenario: Event with absent all-day flag defaults to timed display
    Given an event for which no all-day flag is present in the data source
    When the user taps the event to open its detail page
    Then the time row displays the event's formatted start time
    And no "All Day" badge is shown

  Scenario: "All Day" badge appearance in dark mode
    Given the device display is set to dark mode
    And an event whose all-day flag is set to true
    When the user views the event detail page
    Then the "All Day" badge colours adapt correctly to the dark colour scheme
    And the badge text remains legible against its background

  Scenario: Navigating from the event list to the detail page for an all-day event
    Given an all-day event is displayed with an all-day indicator on the Events list
    When the user taps that event to open its detail page
    Then the detail page also shows the "All Day" badge in the time row
    And the display is consistent between the list and the detail page
```

---

## 6. Non-Functional Requirements

**Performance:**
- The change in time-row display must not introduce any perceptible delay when opening an event detail page. The transition must remain immediate to the user.

**Reliability:**
- The all-day badge must render correctly in all cases where the all-day flag is true, regardless of the presence or absence of date/time fields.
- The existing timed-event display must not regress under any circumstances.

**Accessibility:**
- The "All Day" badge must be readable by screen readers (VoiceOver). The label "All Day" must be announced to users navigating with assistive technology.
- The badge must meet minimum contrast requirements under both light and dark appearance modes.

**Consistency:**
- The visual treatment of "All Day" in the detail page must be coherent with the all-day treatment already present in the event list, so users experience a consistent language across the feature.

**Maintainability:**
- The all-day detection logic must remain tied to the single authoritative upstream flag. Future changes to all-day semantics must require updating only one decision point, not multiple heuristics scattered across views.

---

## 7. Edge Cases & Special Scenarios

| Scenario | Expected Behaviour |
|---|---|
| All-day flag is `true`, raw timestamp is midnight | "All Day" badge shown (flag takes precedence over timestamp) |
| All-day flag is `true`, raw timestamp is NOT midnight | "All Day" badge shown (flag takes precedence over timestamp) |
| All-day flag is `false`, timestamp is midnight | Standard time row with formatted time shown (flag takes precedence) |
| All-day flag is absent/null | Standard time row displayed; no badge; no crash |
| Event has no end date, all-day flag is `true` | "All Day" badge shown; absence of end date causes no crash or blank state |
| Device in dark mode, all-day event | Badge colours adapt using design system tokens; no hardcoded colours break |
| Very long event name on detail page | Time row badge layout is unaffected by content in other rows |

---

## 8. Out of Scope

- **Event list row appearance:** The all-day display on the event list (the banner/row that already appears for all-day events) is correct and must not be changed.
- **Backend or data source changes:** The all-day flag already exists in the upstream data. No changes to the data source, data model, or network layer are required.
- **Other event types (e.g., gym classes):** The all-day indicator change applies only to the Events feature. Any other feature that shares calendar event data structures must not be affected.
- **Timestamp heuristic changes:** The existing logic that derives a display string from event timestamps is not being altered. Only the time row rendering on the Event Detail Page changes.
- **Persistence of all-day flag across app sessions:** Whether the all-day flag survives local caching or offline storage is a separate concern and is not addressed here.
- **Adding accessibility hints or descriptions beyond readable label:** Advanced VoiceOver annotations (custom hints, traits) are a future enhancement.
- **Animated transitions:** No animation between the badge and the time row is required.

---

## 9. Success Metrics

| Metric | Target |
|---|---|
| All-day events no longer show a time value on the detail page | 100% of all-day events display the "All Day" badge |
| No regression on timed events | 100% of timed events continue to display their correct start time |
| Crash rate on Event Detail Page | No increase from baseline after the change ships |
| Consistent display between list and detail | Every all-day event shown in the list shows the "All Day" indicator when its detail page is opened |

---

## 10. References

- Related issue: GOP-65 (prior implementation of all-day indicator on event list row — provides design precedent for the capsule/pill badge pattern)
- Repository: berkeley-mobile-ios (Events feature)
- Upstream data source: campus events feed providing the authoritative all-day flag per event
