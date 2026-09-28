# Business Specification: Display "All Day" Indicator on Event Detail Page

**Ticket**: ASDLC-548  
**Feature Area**: Events — Event Detail Page  
**Platform**: iOS (SwiftUI)

---

## 1. Problem Statement

When a user taps on an All Day event in the Events list and navigates to the Event Detail page, the time row in the header card displays a misleading time value (e.g., `12:00 AM`) instead of communicating that the event spans the entire day. This is inaccurate and confusing because All Day events have no specific start or end time.

### Current Behavior

- The Event Detail header card (`BMDetailHeaderView`) displays a clock icon followed by a time string (e.g., `12:00 AM`) in the time row for All Day events.
- The time string is derived from splitting `event.dateString` on `" / "` and taking the last component.
- When the `dateString` heuristic detects an all-day event by time components (midnight start / 11:59:59 PM end), it appends `"All Day"` as plain text — but this detection is not always reliable and the result is rendered as plain text, not a visual indicator.
- The `isAllDay: Bool?` field on `BMEventCalendarEntry` (populated directly from Firestore) is **not consulted** by the time row in the detail view.

### Expected Behavior

- When `event.isAllDay == true`, the time row should display an **"All Day" capsule/badge** (pill-shaped label) in place of the time text.
- The capsule should be visually consistent with the existing `AllDayEventBannerView` used in the Events list.
- When `event.isAllDay` is `false` or `nil`, the existing time display behavior is unchanged.

---

## 2. Business Goals

- **Accuracy**: Prevent users from being misled by a meaningless time value for All Day events.
- **Clarity**: Use a visually distinct indicator (capsule badge) to communicate the all-day nature at a glance, consistent with the list-level treatment already in place.
- **Consistency**: Align the detail page with the list page, which already differentiates All Day events with `AllDayEventBannerView`.

---

## 3. Scope

### In Scope

- Modify the `timeView` property in `BMDetailHeaderView` (`berkeley-mobile/Events/EventDetailView.swift`, lines 154–158) to check `event.isAllDay == true` and conditionally render an "All Day" capsule label instead of the `EventDetailRow` with a time string.

### Out of Scope

- Changes to the Events list view (`EventsView.swift`) — the `AllDayEventBannerView` already handles All Day display there.
- Changes to `BMCalendarEvent.dateString` or its heuristic time-based all-day detection — this is not the authoritative source for the fix.
- Backend/Firestore schema changes — `isAllDay` is already present in the `BerkeleyEvent` Codable struct and is already mapped into `BMEventCalendarEntry`.
- The "Add to Calendar" (`EKEvent`) flow — `isAllDay` is not currently mapped to `EKEvent.isAllDay`, and that is a separate improvement.

---

## 4. Functional Requirements

### FR-1: All Day Capsule Indicator

- **When**: `event.isAllDay == true`
- **Then**: The time row in `BMDetailHeaderView` MUST render an "All Day" capsule/pill badge in place of the time text.
- **The capsule MUST**:
  - Use a pill/capsule shape (consistent with `AllDayEventBannerView`).
  - Display the text `"All Day"`.
  - Be styled to visually distinguish it from plain body text (e.g., background fill, rounded corners).
  - Be aligned with the clock icon in the same row (the icon may optionally be omitted or retained at implementer's discretion, but must not visually conflict with the badge).

### FR-2: No Change for Timed Events

- **When**: `event.isAllDay == false` or `event.isAllDay == nil`
- **Then**: The time row MUST continue to display the time string exactly as it currently does (via `EventDetailRow` with the `"clock"` system image and time text).

### FR-3: No Change to Date Row

- The date row (`dateView`, showing the formatted date string) is unaffected by this change.

---

## 5. Design Guidance

The existing `AllDayEventBannerView` (used in the Events list, `berkeley-mobile/Events/AllDayEventBannerView.swift`) is a `Capsule` filled with `.gray.opacity(0.5)`. The time-row capsule in the detail view should follow the same visual language at an appropriate size for inline use within the header card.

**Suggested implementation approach** (inline with the existing `timeView` logic):

```swift
@ViewBuilder
private var timeView: some View {
    if event.isAllDay == true {
        // "All Day" capsule badge — mirrors AllDayEventBannerView style
        HStack {
            Image(systemName: "clock")
                .font(.system(size: 16))
            Text("All Day")
                .font(Font(BMFont.regular(12)))
                .padding(.horizontal, 8)
                .padding(.vertical, 2)
                .background(Capsule().fill(.gray.opacity(0.5)))
        }
    } else if let timePart = event.dateString.components(separatedBy: " / ").last {
        EventDetailRow(systemImageName: "clock", text: timePart)
    }
}
```

The exact styling (padding, opacity, font size) may be adjusted for visual coherence with the surrounding card layout, but the capsule shape and "All Day" label are required.

---

## 6. Relevant Code Locations

| Artifact | File | Detail |
|---|---|---|
| Event Detail view + time row | `berkeley-mobile/Events/EventDetailView.swift:154–158` | `timeView` in `BMDetailHeaderView` — the change target |
| All Day banner (list reference) | `berkeley-mobile/Events/AllDayEventBannerView.swift` | Capsule style to match |
| Event model — `isAllDay` field | `berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift:61` | Source of truth for all-day flag |
| Events list — existing all-day branch | `berkeley-mobile/Events/EventsView.swift:25–27` | Pattern to follow: `if event.isAllDay == true` |
| `dateString` heuristic | `berkeley-mobile/Data/ItemProtocols/BMCalendarEvent.swift:52–55` | Unreliable for this fix; prefer `isAllDay` directly |
| Firestore mapping | `berkeley-mobile/Events/EventDataSource/EventsViewModel.swift:67` | `isAllDay: $0.isAllDay` — already wired |

---

## 7. Acceptance Criteria

| # | Criterion | How to Verify |
|---|---|---|
| AC-1 | An All Day event's detail page shows a capsule badge labeled "All Day" in the time row | Launch app → tap an All Day event → confirm badge appears |
| AC-2 | The time row no longer shows "12:00 AM" or any other time string for All Day events | Same as AC-1 — no time string visible |
| AC-3 | A non-All Day event's detail page continues to display the formatted time range (e.g., `2:00 PM - 4:00 PM`) | Tap a timed event → confirm time range unchanged |
| AC-4 | The capsule badge is visually pill-shaped (rounded ends) and contains the text "All Day" | Visual inspection |
| AC-5 | Build succeeds with zero errors | Run `pod install && xcodebuild -workspace berkeley-mobile.xcworkspace -scheme berkeley-mobile -destination 'generic/platform=iOS Simulator' build` |

---

## 8. Dependencies & Risks

- **No new dependencies**: The fix uses only existing SwiftUI primitives (`Capsule`, `Text`, `HStack`) and the existing `isAllDay` field.
- **Data risk (low)**: If `isAllDay` is `nil` in Firestore for a genuine All Day event, the fix will fall through to the time string. This is pre-existing data-quality behavior, not introduced by this change.
- **Heuristic fallback**: The `dateString` all-day heuristic (`BMCalendarEvent.swift:52–55`) remains in place for `EventRowView` (non-all-day-banner list rows). This spec does not touch that code path.
