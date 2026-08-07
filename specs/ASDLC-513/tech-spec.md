# Technical Specification — ASDLC-513
## [Events Page] Display "All Day" Indicator Instead of Time on Event Detail Page

**Platform**: [MOBILE] — iOS (Swift / SwiftUI)  
**Date**: 2026-08-07  
**Status**: Final Draft  
**Author**: Tech Lead Agent (B3/Berkeley Mobile)

---

## 1. Problem

### 1.1 Current Behaviour

The Event Detail Page (`EventDetailView` → `BMDetailHeaderView`) contains a `timeView` computed property that is supposed to branch on `event.isAllDay`. At the time of the business report, this branch was **absent** — the property unconditionally formatted the raw `dateString` time component, which for all-day events stored as `startDate = 00:00:00` resolves to "12:00 AM" via `DateFormatter`.

### 1.2 Actual Current State (discovered via CodeGraph)

A partial fix already exists in `berkeley-mobile/Events/EventDetailView.swift` (lines 155–168):

```swift
@ViewBuilder
private var timeView: some View {
    if event.isAllDay == true {
        HStack(spacing: 6) {
            Image(systemName: "clock")
                .font(.system(size: 16))
            Text("All Day")
                .font(Font(BMFont.bold(12)))
                .padding(.horizontal, 10)
                .padding(.vertical, 4)
                .background(Capsule().fill(Color.gray.opacity(0.25)))
        }
    } else if let timePart = event.dateString.components(separatedBy: " / ").last {
        EventDetailRow(systemImageName: "clock", text: timePart)
    }
}
```

However, two defects remain:

1. **Styling inconsistency**: `AllDayEventBannerView` (the canonical all-day indicator used in the event list row) uses `Capsule().fill(.gray.opacity(0.5))` with `BMFont.bold(15)`. The detail page timeView uses `Color.gray.opacity(0.25)` with `BMFont.bold(12)` — a visually lighter, smaller variant that does not match the established design pattern.

2. **Preview not exercising the all-day path**: `BMEventCalendarEntry.sampleEntry` does not set `isAllDay: true`, so the Xcode preview for `EventDetailView` always renders the timed path. Developers cannot visually verify the all-day branch without live data.

### 1.3 Root Cause Analysis

| Layer | File | Issue |
|---|---|---|
| View | `EventDetailView.swift` | `timeView` all-day branch uses weaker styling than the established capsule pattern |
| Model | `BMCalendarEvent.swift` | `dateString` protocol extension correctly prefers `isAllDay` flag; no changes needed |
| Data | `EventsViewModel.swift` | `isAllDay` is already mapped from Firestore via `BerkeleyEventsDaySnapshot`; no changes needed |
| Preview | `BMEventCalendarEntry.swift` | `sampleEntry` does not set `isAllDay: true`; adds a preview fixture |

### 1.4 Data Flow (current, unchanged)

Firestore → EventsDataService (BerkeleyEventsDaySnapshot, isAllDay: Bool?) → EventsViewModel (BMEventCalendarEntry) → EventDetailView / BMDetailHeaderView → timeView checks event.isAllDay == true → renders "All Day" capsule badge OR formatted time string.

---

## 2. Architectural Decisions

### 2.1 Where to own the "all-day" capsule visual

**Option A — Inline in `BMDetailHeaderView.timeView` (SELECTED)**  
Keep the capsule rendered entirely within the `timeView` computed property of `BMDetailHeaderView`. Align the styling with `AllDayEventBannerView` by using the same fill opacity.

- Minimal blast radius — single view property changes
- No new file, no new public API
- Consistent with how `locationView` and `dateView` are handled in the same struct

**Option B — Extract a shared `AllDayBadgeView`**  
Create a new reusable `AllDayBadgeView` in `berkeley-mobile/Common/`.

- Over-engineering for a one-site change; `AllDayEventBannerView` is a full-width banner including event name while the detail row needs a compact inline badge — different structures.

**Option C — Re-use `AllDayEventBannerView` directly**  
`AllDayEventBannerView` is full-width, includes `event.name`, and injects `eventsViewModel` — wrong layout for the clock row context.

**Decision**: Option A. Align the inline capsule styling in `timeView` to match the visual weight of `AllDayEventBannerView` without extracting a shared component.

### 2.2 Styling token alignment

`AllDayEventBannerView` renders `Capsule().fill(.gray.opacity(0.5))`. The fill opacity in `timeView` should be raised from `0.25` to `0.5` to match visual weight. Font size stays at 12 pt (matching surrounding context).

### 2.3 `dateString` fallback heuristic

`BMCalendarEvent.dateString` already implements: `isAllDayEvent = isAllDay == true || (start == 00:00:00 && end == 11:59:59)`. No change required — satisfies business requirement AC-2.

### 2.4 Preview fixture strategy

Add `sampleAllDayEntry` to the `BMEventCalendarEntry` extension and a second `#Preview` block to `EventDetailView.swift`.

---

## 3. Architecture & Implementation

### 3.1 File change inventory

| File | Change type | Description |
|---|---|---|
| `berkeley-mobile/Events/EventDetailView.swift` | Edit | Raise capsule fill opacity in `timeView` from 0.25 → 0.5; add all-day preview |
| `berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift` | Edit | Add `sampleAllDayEntry` static fixture |

No other files require modification.

### 3.2 Detailed change: `EventDetailView.swift` — `timeView`

**File**: `berkeley-mobile/Events/EventDetailView.swift`  
**Location**: `BMDetailHeaderView`, `timeView` computed property (lines 153–168)

Change `Color.gray.opacity(0.25)` → `Color.gray.opacity(0.5)`:

```swift
@ViewBuilder
private var timeView: some View {
    if event.isAllDay == true {
        HStack(spacing: 6) {
            Image(systemName: "clock")
                .font(.system(size: 16))
            Text("All Day")
                .font(Font(BMFont.bold(12)))
                .padding(.horizontal, 10)
                .padding(.vertical, 4)
                .background(Capsule().fill(Color.gray.opacity(0.5)))   // raised from 0.25
        }
    } else if let timePart = event.dateString.components(separatedBy: " / ").last {
        EventDetailRow(systemImageName: "clock", text: timePart)
    }
}
```

Also add a second preview block at the bottom of the file:

```swift
#Preview("All Day Event") {
    EventDetailView(event: BMEventCalendarEntry.sampleAllDayEntry)
}
```

### 3.3 Detailed change: `BMEventCalendarEntry.swift` — `sampleAllDayEntry`

**File**: `berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift`  
**Location**: `extension BMEventCalendarEntry` — after `sampleEntry`

```swift
static let sampleAllDayEntry = BMEventCalendarEntry(
    name: "Cal Day Open House",
    date: Date().getStartOfDay(),
    end: nil,
    descriptionText: "An all-day open campus event for prospective students and their families.",
    location: "Sproul Plaza",
    registerLink: nil,
    imageURL: nil,
    sourceLink: "https://events.berkeley.edu",
    type: "Default",
    isAllDay: true
)
```

### 3.4 State machine — `timeView` rendering

- `isAllDay == true` → HStack with clock icon + "All Day" Capsule (opacity 0.5)
- `isAllDay == false` or `nil` → EventDetailRow with clock icon + time string from `dateString`
- No timePart available → EmptyView (ViewBuilder)

Note: When `isAllDay == nil` but the model heuristic detects 00:00/11:59, `dateString` returns "… / All Day" — the `else` branch surfaces "All Day" as plain text via `EventDetailRow`. This edge case is handled at the model layer (pre-existing, out of scope at view layer).

### 3.5 No changes required in

- `BMCalendarEvent.swift` — `dateString` and `isAllDay` protocol default already correct
- `EventsViewModel.swift` — `isAllDay` already mapped from Firestore
- `AllDayEventBannerView.swift` — unchanged, used only in event list rows
- `EventRowView.swift` — out of scope per business spec
- Any Firestore schema or backend

---

## 4. Testing, Security & Definition of Done

### 4.1 Testing approach

The repository has no existing automated test target (confirmed by `testing-standards.md`). Testing is limited to:

**Xcode Preview verification**: The `#Preview("All Day Event")` block must render the capsule badge. The existing `#Preview` must continue rendering the timed path.

**Manual simulator checklist**:

| Scenario | Expected result |
|---|---|
| Event with `isAllDay == true` | Clock icon + "All Day" capsule (opacity 0.5) |
| Event with `isAllDay == false` | Formatted time string in EventDetailRow |
| Event with `isAllDay == nil`, times = 00:00–11:59 | "All Day" plain text via EventDetailRow (model fallback) |
| Event with `isAllDay == nil`, normal times | Formatted time string |
| Dark mode, all-day event | Capsule visually legible |
| Light mode, all-day event | Capsule visually legible |
| Event list row AllDayEventBannerView | Unchanged, no regression |

**Regression**: `GymClass` and other `BMCalendarEvent` conformers default `isAllDay` to `nil` (protocol default); they are unaffected.

### 4.2 Security checklist

This is a pure UI display fix with no networking, persistence, authentication, or PII concerns.

| Control | Status |
|---|---|
| No PII in logs | No logging added |
| JWT/OAuth2 | N/A — no auth change |
| Firestore field access | N/A — `isAllDay` already read |
| LGPD | N/A — no personal data |
| Input validation | N/A — `Bool?` safe type, no user input |
| Audit trail | N/A — no state-changing operation |

### 4.3 Definition of Done

- `timeView` in `BMDetailHeaderView` uses `Color.gray.opacity(0.5)` for the all-day capsule fill
- `BMEventCalendarEntry.sampleAllDayEntry` static fixture added with `isAllDay: true`
- `#Preview("All Day Event")` block added to `EventDetailView.swift`
- Manual testing checklist passes on simulator (iOS 17+)
- Dark mode and light mode visually verified via Xcode Previews
- No change to `EventRowView`, `AllDayEventBannerView`, `BMCalendarEvent`, or `EventsViewModel`
- PR description references ASDLC-513 and includes before/after screenshots

### 4.4 Out of Scope

- Changes to the event list row (`EventRowView`) or `AllDayEventBannerView`
- Backend / Firestore schema changes
- Localization of the "All Day" string
- Automated unit or UI test suite (no test target exists)
- Handling `isAllDay == nil` + heuristic edge case at the view layer (already correct at model layer)

---

## 5. Summary

This is a **two-file, one-line-change + fixture addition** task. The primary logic (`isAllDay` flag, `dateString` fallback) is already correctly implemented in the model layer. The required changes are:

1. Raise `Color.gray.opacity(0.25)` → `Color.gray.opacity(0.5)` in `BMDetailHeaderView.timeView` to match the visual weight of `AllDayEventBannerView`.
2. Add `sampleAllDayEntry` preview fixture so developers can verify the all-day branch in Xcode Previews without live Firestore data.
