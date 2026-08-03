# Business Requirements: Display "All Day" Indicator on Event Detail Page

**Issue Key**: ASDLC-499
**Date**: 2026-08-03
**Status**: Draft

---

## 1. Executive Summary

When an event is designated as an All Day event, the Event Detail Page incorrectly displays a time value (e.g., "12:00 AM") in the time row rather than communicating that the event spans the entire day. This misleads users into believing a specific start time exists when none applies. The fix requires replacing the time display with a visually distinct "All Day" indicator — styled as a capsule/pill-shaped label — on the Event Detail Page for all-day events.

---

## 2. Problem Statement

**Current State**: The time row on the Event Detail Page always renders a time value derived from the event's start date. For all-day events, this results in "12:00 AM" being displayed, which is a meaningless and misleading artifact of how all-day events are stored, not a real scheduled time.

**Desired State**: When an event is an all-day event, the time row must display an "All Day" capsule/pill-shaped label instead of any time value, clearly communicating that the event has no specific start or end time.

**Business Impact**:
- Students and staff using the Berkeley Mobile app to discover campus events are given inaccurate information about all-day events.
- Displaying "12:00 AM" implies a midnight start time, which can cause confusion and erode trust in the app's event information.
- Correcting this display ensures users can confidently plan around and attend all-day events.

**Urgency**: Low-severity UX defect. The misinformation is actively present in the production app for every all-day event a user views. Fixing it improves data accuracy and user trust at low implementation cost.

---

## 3. Personas & User Stories

### Primary Persona: Berkeley App User (Student / Staff / Faculty)

A member of the UC Berkeley community who browses the Berkeley Mobile app to discover and plan around campus events.

**Needs**: Accurate, at-a-glance event timing information.
**Pain Point**: Sees "12:00 AM" on all-day events and does not know whether the event actually starts at midnight or if the time is a placeholder.
**Goal**: Quickly determine whether an event has a specific time or spans the whole day.

---

**User Story 1**:
> As a Berkeley app user viewing the detail page of an all-day event, I want to see a clear "All Day" indicator instead of a time value, so that I immediately understand the event has no specific start or end time.

**User Story 2**:
> As a Berkeley app user viewing the detail page of a timed event, I want the time row to continue displaying the start (and end) time as before, so that my experience for regular events is unchanged.

---

## 4. Business Rules

**BR-001**: An event is classified as "All Day" when it carries the all-day designation as provided by the backend data source. The client must not independently infer or compute all-day status from time components.

> **Open Question**: The data model includes both an explicit `isAllDay` flag and a time-component convention (start at 00:00:00, end at 23:59:59) for identifying all-day events. It is unclear which signal the client must treat as authoritative — the explicit flag or the time-component convention. This must be clarified before implementation to avoid inconsistency.

**BR-002**: On the Event Detail Page, when an event is classified as All Day (per BR-001), the time row must display an "All Day" indicator and must not display any time value.

**BR-003**: The "All Day" indicator must be visually distinct from plain text — it must be rendered as a capsule/pill-shaped label to differentiate it from normal time text.

**BR-004**: On the Event Detail Page, when an event is NOT classified as All Day, the time row must continue to display the event's start time (and end time, if available) exactly as it does today. No change to the timed-event display is permitted.

**BR-005**: The time row must always be present on the Event Detail Page regardless of whether the event is All Day or timed. The row must never be hidden or removed.

**BR-006**: The "All Day" label text displayed in the capsule must be exactly the string "All Day" (title case, two words). No abbreviations or alternative phrasings are permitted.

---

## 5. Acceptance Criteria

```gherkin
Feature: All Day Indicator on Event Detail Page

  Scenario: All Day event displays "All Day" capsule in the time row
    Given a user opens the Event Detail Page for an event designated as All Day
    When the page renders
    Then the time row displays an "All Day" capsule/pill-shaped label
    And the time row does not display any time value (e.g., "12:00 AM", "11:59 PM")

  Scenario: All Day capsule label text is correct
    Given a user opens the Event Detail Page for an event designated as All Day
    When the time row is displayed
    Then the capsule label contains exactly the text "All Day"

  Scenario: All Day capsule is visually distinct from plain text
    Given a user opens the Event Detail Page for an event designated as All Day
    When the time row is displayed
    Then the "All Day" indicator is rendered as a capsule/pill-shaped element
    And it is visually distinguishable from regular text rows (e.g., date row, location row)

  Scenario: Timed event continues to display start and end time
    Given a user opens the Event Detail Page for an event that is NOT designated as All Day
    And the event has a defined start time and end time
    When the page renders
    Then the time row displays the event's start time
    And the time row displays the event's end time
    And no "All Day" capsule is shown

  Scenario: Timed event with start time only displays start time
    Given a user opens the Event Detail Page for an event that is NOT designated as All Day
    And the event has a defined start time but no end time
    When the page renders
    Then the time row displays the event's start time only
    And no "All Day" capsule is shown

  Scenario: Time row is always present for all events
    Given a user opens the Event Detail Page for any event
    When the page renders
    Then the time row is visible
    And it is never hidden or removed regardless of all-day status
```

---

## 6. Non-Functional Requirements

**Performance**: The all-day check and conditional rendering must not introduce any perceptible delay. The Event Detail Page load time must remain unchanged.

**Accessibility**: The "All Day" capsule must be accessible to screen readers. The label "All Day" must be announced by assistive technology when a user navigates to the time row. The capsule must meet minimum contrast requirements against the card background.

**Visual Consistency**: The capsule/pill style of the "All Day" indicator must be consistent with existing capsule-style elements already used in the app (e.g., the all-day banner on the events list). The visual language must feel native and cohesive.

**Maintainability**: The all-day detection logic must be centralized in a single location. Any future change to how all-day status is determined must require a change in only one place, not scattered across multiple views.

**Platform**: This requirement applies to the iOS mobile application only.

---

## 7. Edge Cases & Special Scenarios

**Edge Case 1 — All-day flag absent or nil**: If the all-day designation for an event is absent or indeterminate (e.g., the flag is null/not set), the event must be treated as a timed event and display its time value. It must not show "All Day" by default.

**Edge Case 2 — All-day event with no end date**: If an event is designated as All Day but has no end date recorded, the time row must still show the "All Day" capsule. The absence of an end date must not prevent the indicator from displaying.

**Edge Case 3 — Time row with "All Day" text in the combined date string**: The existing data model produces a combined "date / time" string where all-day events already contain "All Day" as the time component (e.g., "Today / All Day"). The time row must correctly extract and display this as the capsule indicator, not as a plain text string.

**Edge Case 4 — Very long event names or dates**: The presence of the "All Day" capsule in the time row must not cause layout overflow or truncation of the clock icon or the label itself. The capsule must display completely within the row's bounds.

---

## 8. Out of Scope

- Changes to the event list view (EventRowView) or how all-day events appear in list rows — only the Event Detail Page time row is in scope.
- Changes to the all-day banner that appears in the calendar or list view (AllDayEventBannerView) — that component is unaffected.
- Modifying how all-day status is determined by the backend or how it is stored in the data model.
- Changing the date row on the Event Detail Page — only the time row is modified.
- Adding an "All Day" toggle or editing capability for events from within the app.
- Any change to how timed (non-all-day) events display their time — existing behavior must be preserved exactly.
- Localization or translation of the "All Day" label — internationalization is a separate initiative.

---

## 9. Success Metrics

1. **Zero time values on all-day events**: After the change, 100% of all-day events on the Event Detail Page display the "All Day" capsule and zero time values.
2. **Zero regression on timed events**: 100% of non-all-day events on the Event Detail Page continue to display their correct time value.
3. **Visual design match**: The rendered capsule matches the pill/capsule styling described in the issue and is consistent with existing capsule elements in the app.
4. **Accessibility compliance**: The "All Day" label is announced correctly by VoiceOver on iOS.

---

## 10. References

- **Issue**: ASDLC-499 — [Events Page] Display (All Day) Indicator Instead of Time on Event Detail Page
- **Repository**: https://github.com/gouveiahenrique/berkeley-mobile-ios
- **Related Files** (for context only — not prescriptive for implementation):
  - Event Detail Page: `berkeley-mobile/Events/EventDetailView.swift`
  - Event data model and all-day detection logic: `berkeley-mobile/Data/ItemProtocols/BMCalendarEvent.swift`
  - Event entry model with `isAllDay` flag: `berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift`
  - Existing all-day capsule component (used in list view): `berkeley-mobile/Events/AllDayEventBannerView.swift`
