# Business Requirements: Add a home screen widget for upcoming campus events

**Issue**: ASDLC-574
**Date**: 2026-11-18
**Complexity**: M/L (new widget, three sizes, stretch Lock Screen families, deep link)

## 1. Executive Summary
Students will be able to see what is happening on campus today, or next, directly from their iPhone home screen without opening Berkeley Mobile. The widget shows the same campus events that appear in the app's Events screen (opened from the calendar button on the Today page) in small, medium and large sizes, and tapping an event opens that event in the app.

## 2. Problem Statement
- **Current state**: Campus events are visible only inside the app's Events screen. Students must open the app, go to Today, and tap the calendar button. The only existing widget shows gym occupancy.
- **Desired state**: A glanceable events widget on the home screen (and optionally Lock Screen) that always shows the relevant upcoming events and drops events that have ended.
- **Business impact**: Higher visibility and engagement for campus events and more frequent app touchpoints for students.
- **Personas**: Primary: Berkeley students (and staff/visitors) who use the app. Secondary: campus event organizers (higher visibility), the app maintainers (ASUC OCTO).

## 3. Responsibility Boundaries (system capabilities)
- Event data is provided by the same backend source as the in-app Events screen. The widget must show it as received (name, start/end time, all-day flag, location, image, links); no new data source is created.
- Each event may lack any field (name, start time, end time, location, image, all-day flag). Optional fields must be handled gracefully; nothing is guaranteed present.
- Day groupings come from the backend; the widget decides which day is "today".
- Authentication and data access follow what the existing widget and app already use; no changes to access rules are required.
- Calendar integration (add to / delete from device calendar) is owned by the app only and is not offered in the widget.

## 4. Business Rules
- **BR-001**: The widget uses the same events data as the Events screen. Any event visible there for today or later is eligible; the widget never shows events the app would not show.
- **BR-002**: Small widget shows exactly one event: the next upcoming event. It displays name, start time (or "All day" for all-day events) and location.
- **BR-003**: Medium widget shows up to 3 of today's remaining events in chronological order (minimum target 2 when available). When no events remain today, it shows tomorrow's events under a "Tomorrow" label.
- **BR-004**: Large widget shows today's agenda, grouped by start time, in chronological order, as many as fit.
- **BR-005**: An event whose end time has passed is removed from the widget at that moment, without the user opening the app. Events with no end time are considered over at the end of their start day if all-day, or one hour after their start time if timed.
- **BR-006**: "Next upcoming event" is the event currently in progress with the earliest start; if none is in progress, the event with the nearest future start. All-day events for today are ordered before timed events.
- **BR-007**: Events without a name are not shown. Events without a start time are treated as all-day on the day of their snapshot.
- **BR-008**: Missing location is omitted from the display (no placeholder text such as "null").
- **BR-009**: Event data is refreshed several times per day (at least 3 times in 24 hours) so new or changed events appear without opening the app.
- **BR-010**: Tapping an event opens the app on the detail view of that specific event in the Events screen. Tapping the empty-state/no-event area opens the Events screen.
- **BR-011**: Version 1 includes no add-to-calendar capability and no calendar permission usage in the widget.
- **BR-012**: Event images are optional in v1: small sizes show no image; if images are shown in larger sizes, a missing or failed image must not prevent the event from being displayed.
- **BR-013 (stretch)**: Lock Screen rectangular and inline widgets show the next event (name and start time; the rectangular also shows location). They are delivered only if the core sizes are complete.
- **BR-014**: The widget appears in the widget gallery as "Campus Events" with a short description, alongside the existing gym widget, and supports Light and Dark appearance.

## 5. Acceptance Criteria
```gherkin
Feature: Campus events widget

  Scenario: Small widget shows next event
    Given today has events "Career Fair" at 2:00 PM at "Sproul Plaza" and "Concert" at 6:00 PM
    And the current time is 1:00 PM
    When the user views the small widget
    Then it shows "Career Fair", "2:00 PM" and "Sproul Plaza"
    And it shows no other event

  Scenario: All-day event in small widget
    Given the next event is an all-day event "Cal Day"
    When the user views the small widget
    Then the start time is shown as "All day"

  Scenario: Medium widget shows today's next events
    Given today has 4 remaining events
    When the user views the medium widget
    Then the first 3 remaining events are listed in time order

  Scenario: Medium widget switches to tomorrow
    Given all of today's events have ended and tomorrow has events
    When the user views the medium widget
    Then a "Tomorrow" label is shown with tomorrow's events

  Scenario: Large widget shows grouped agenda
    Given today has events at 9:00 AM (two events) and 1:00 PM
    When the user views the large widget
    Then events are grouped under 9:00 AM and 1:00 PM in chronological order

  Scenario: Finished event drops off automatically
    Given an event ends at 3:00 PM and is displayed at 2:55 PM
    When the time reaches 3:00 PM
    Then the widget no longer shows that event and shows the next one instead
    And the user did not open the app

  Scenario: Deep link to event detail
    Given the widget shows "Career Fair"
    When the user taps it
    Then the app opens on the detail of "Career Fair" within the Events screen

  Scenario: Missing location
    Given an event has no location
    When it is displayed in any size
    Then no location text or placeholder is shown and layout remains intact

  Scenario: No events at all
    Given no events exist today or tomorrow
    When the user views the widget in any size
    Then it shows "No upcoming events"
    And tapping it opens the Events screen

  Scenario: Data cannot be loaded
    Given the device is offline and no earlier data is available
    When the widget refreshes
    Then it shows "No upcoming events" and does not crash
  
  Scenario: Offline with previously loaded data
    Given events were loaded earlier today and the device is now offline
    When the widget refreshes
    Then it continues to show the last loaded events, excluding ended ones

  Scenario: Event with no end time
    Given a timed event starts at 2:00 PM with no end time
    When the time reaches 3:00 PM
    Then the event is no longer shown

  Scenario: Widget gallery
    When the user opens the widget gallery
    Then "Campus Events" is offered in small, medium and large sizes

  Scenario: Lock Screen (stretch)
    Given the user adds the rectangular Lock Screen widget
    Then it shows the next event name, start time and location
    And the inline version shows name and start time on one line
```

## 6. Non-Functional Requirements
- **Performance**: Widget content renders immediately from prepared data; data refresh must complete within the time the system allows for widget updates; images, if used, must not delay display of text.
- **Security/Privacy**: Only public campus event data is shown; no personal data is collected or stored; no calendar access requested.
- **Reliability**: Failure to fetch must never produce a blank or broken widget; last good data is retained.
- **Accessibility**: Text must support Dynamic Type within widget limits and be readable by VoiceOver (event name, time, location read in order); sufficient contrast in light and dark modes.
- **Maintainability**: Event data definitions must be shareable between the app and widget so both show identical data; existing Events screen behavior must not change.
- **Observability**: Fetch failures are logged consistently with existing event data logging.
- **Scalability**: Must handle days with many events (50+) by truncating to what fits.

## 7. Edge Cases & Special Scenarios
- Multi-day events: shown on each day they occupy according to the backend's daily groupings.
- Overlapping events: sorted by start time, then by name.
- Two events at identical start time: both shown, ordered by name; grouped together in large size.
- Very long names or locations: truncated with ellipsis, never overflowing.
- Day rollover at midnight: "today" updates; widget shows the new day's events.
- Time zone: times are shown in the device's local time.
- Events in the past only (older days): never shown.
- Duplicate events in the data: shown once if name and start time match.
- Deep link to an event no longer present in the app's data: opens the Events screen.

## 8. Out of Scope
- Adding to/deleting from the device calendar (possible future interactive button on iOS 17+).
- Event filtering, search or user configuration of the widget.
- Push notifications or Live Activities.
- Changes to the Events screen design or backend data.
- Other widget families (e.g., extra-large, StandBy customization) beyond those listed; Lock Screen families are stretch.
- Academic calendar events unless they are part of the same data shown in the Events screen.

## 9. Success Metrics
- Widget is installable in all three home screen sizes with correct content in 100% of acceptance scenarios.
- Finished events disappear within 1 minute of end time in testing.
- Zero crashes/blank states from failed fetches in QA.
- Post-release: widget installs and widget-originated app opens tracked; target of widget-driven opens increasing Events screen visits (baseline set at first release).

## 10. Open Questions / Assumptions
- Assumption: Fallback duration of 1 hour for timed events without an end time (BR-005); confirm with product.
- Assumption: Exact refresh cadence is "at least 3 times daily" (BR-009); tech lead may choose precise schedule.
- Open: Whether images appear in the large size is left to design; v1 required behavior is only that text content never depends on images.
- Open: Whether stretch Lock Screen families ship in v1 depends on capacity.

## 11. References
- Issue ASDLC-574 description
- Existing Events screen (Today page calendar button) and existing gym occupancy widget as precedent
- Repository: https://github.com/gouveiahenrique/berkeley-mobile-ios.git
