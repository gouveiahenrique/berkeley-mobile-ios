# Testing Standards

## Test Coverage

No test target was found in the inspected repository structure. A search for files matching `*Test*`, `*Spec*`, or `*Mock*` within the `berkeley-mobile/` source tree returned no results. The CodeGraph blast-radius analysis consistently reports "no covering tests found" for every symbol in the codebase.

The repository does not contain an XCTest target, UI test target, or snapshot test configuration in the observed files.

## Testing Frameworks

No testing frameworks (XCTest, Quick/Nimble, or others) were found declared in the `Podfile` or in the inspected Swift Package dependencies.

## Test Fixtures and Previews

The codebase uses SwiftUI `#Preview` macros and inline static helper methods for development-time inspection, not for automated testing. Examples observed:

- `SafetyViewModel.getSampleSafetyLog()` — returns a hard-coded `BMSafetyLog` instance used in Xcode Previews.
- `OpenTimesCardSwiftUIView` preview file defines `ClosedItem` and `OpenItem` structs implementing `HasOpenTimes` with sample hours data for preview rendering.
- `CalendarSectionView` preview manually constructs `CalendarViewModel` and calls `setEntries(_:)` with sample data.
- `GymOccupancyEntry` provides `defaultRSFOccupancyPercentages` and `defaultStadiumOccupancyPercentages` static constants used in `GymOccupancyWidget` previews.

These constructs are development aids, not a testing infrastructure. Their presence indicates a pattern for rendering component states during development.

## Debug-Only Instrumentation

A `DebugView` (`berkeley-mobile/Debug/DebugView.swift`) is conditionally compiled (`#if DEBUG`) and presented via shake gesture. It displays app version/build information and allows force-presenting the feedback form. This is a manual developer tool, not an automated test mechanism.

## Observation

No automated testing infrastructure was found in the inspected repository areas. All coverage annotations from CodeGraph indicate zero test coverage across the codebase.
