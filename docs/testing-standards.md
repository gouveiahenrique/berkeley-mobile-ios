# Testing Standards

## Observed Test Coverage

A search of the repository for XCTest files, test targets, and test directories found no test files in the main application source (`berkeley-mobile/`) or widget extension (`BerkeleyMobileWidget/`).

The only testing-related Swift files found in the repository are inside the `Pods/` directory — specifically `Pods/FirebaseCoreInternal` and `Pods/PromisesObjC`, which are third-party Pod files unrelated to the app's own test suite.

CodeGraph annotations on every symbol inspected during analysis carry the warning: `⚠️ no covering tests found`.

**No application-level test targets, XCTest files, test fixtures, or test utilities were found in the inspected repository areas.**

---

## Preview Usage

Xcode Previews (`#Preview { ... }`) are present in SwiftUI source files. Observed examples:

- `SafetyView.swift` — `#Preview { SafetyView() }`
- `TodayView.swift` — `#Preview { TodayView() }`
- `ResourcesView.swift` — `#Preview { ResourcesView() }`
- `GymOccupancyWidget.swift` — snapshot previews with default occupancy data
- `OpenTimesCardSwiftUIView.swift` — previews with `ClosedItem` and `OpenItem` fixtures
- `MapUserLocationButton.swift` — `#Preview { MapUserLocationButton {} }`

These are development-time previews, not automated tests.

---

## Sample Data

Several view models and models define static sample data for preview and development purposes:

- `SafetyViewModel.getSampleSafetyLog()` — a static `BMSafetyLog` instance.
- `BMEventCalendarEntry.sampleEntry` — a static event entry.
- `GymOccupancyEntry.defaultRSFOccupancyPercentages` / `defaultStadiumOccupancyPercentages` — static default values used in widget placeholder and snapshot.

These are defined alongside production code and used in `#Preview` blocks; they are not test fixtures in a test target.

---

## Summary

No automated test suite was found in the observed repository areas. Testing infrastructure, test targets, unit tests, integration tests, UI tests, and test utilities are not present in the inspected codebase.
