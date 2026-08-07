# Business Requirements Specification
## ASDLC-513: [Events Page] Display "All Day" Indicator Instead of Time on Event Detail Page

### Problem Statement

When a Berkeley Mobile iOS event is marked as an All Day event (via the `isAllDay` flag in Firestore), the Event Detail Page displays a time value — typically "12:00 AM" — in the time row. This is misleading because all-day events have no specific start or end time. Users may incorrectly believe the event starts at midnight rather than spanning the entire day.

### Current Behavior

- The time row on the Event Detail Page shows "12:00 AM" for all-day events.
- The `dateString` computation in `BMCalendarEvent` detects all-day events using a brittle heuristic: start time must be exactly 00:00:00 and end time must be exactly 11:59:59. If the Firestore `isAllDay` flag is `true` but the times don't match this pattern, the wrong time is displayed.

### Expected Behavior

- When an event is marked as all-day (`isAllDay == true`), the time row on the Event Detail Page must display an **"All Day" capsule/pill badge** instead of a time value.
- The capsule badge should be visually distinct (styled consistently with the existing `AllDayEventBannerView` pattern used in the event list).
- For non-all-day events, the time row continues to display the formatted start–end time as before.

### Acceptance Criteria

1. **All-day flag is authoritative**: When `isAllDay` is `true` on an event, the detail page shows the "All Day" capsule regardless of the raw start/end time values stored.
2. **Fallback heuristic retained**: If `isAllDay` is `nil` or absent but times match the 00:00:00–11:59:59 pattern, the event is still treated as all-day (backward compatibility).
3. **Capsule styling**: The "All Day" label is rendered in a pill/capsule shape with the clock icon, consistent with the app's existing all-day indicator style.
4. **Non-all-day events unchanged**: Events without the all-day flag continue to display their start–end time string as before.
5. **No regression on `GymClass`**: `GymClass` and other `BMCalendarEvent` conformers that do not set `isAllDay` default to `nil` (treated as timed events) without any code changes required.

### Stakeholders

- **End Users**: Students and community members using Berkeley Mobile to view campus events.
- **Content Administrators**: Those who mark events as "All Day" in the Firestore backend.

### Out of Scope

- Changes to the event list row (`EventRowView`) — the row already surfaces the all-day indicator separately via `AllDayEventBannerView`.
- Backend/Firestore schema changes — `isAllDay` is already a supported field.
- Localization of the "All Day" string — out of scope for this iteration.
