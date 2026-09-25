# Testing Standards

## Discovery Summary

- No test source files were found in the repository. A search for files matching `*Test*.swift` across the repository (excluding `Pods/`) returned no results.
- The Xcode scheme `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` defines a `TestAction` with an empty `<Testables>` element (lines 24-31), meaning no test target/bundle is currently wired into the scheme's test action.
- No dedicated unit-test or UI-test target (e.g. `berkeley-mobileTests`, `berkeley-mobileUITests`) was found among the `PBXNativeTarget` entries in `berkeley-mobile.xcodeproj/project.pbxproj`; only `berkeley-mobile` (app) and `BerkeleyMobileWidgetExtension` (widget extension) targets are defined.

## Testing Frameworks

Not found in codebase. No `XCTest`, `Quick`/`Nimble`, or `Swift Testing` (`import Testing`) imports were found in the inspected source areas, and no test target exists to house them.

## Test Organization, Fixtures, Mocks, Utilities

Not applicable — no test files were found in inspected repository areas to document organization, fixtures, mocks, or naming conventions for.

## Sample/Preview Data (Not Test Fixtures)

The repository defines static sample data used for SwiftUI previews and UI development, not automated tests:
- `BMEventCalendarEntry.sampleEntry` (`berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift:136-146`).
- `SafetyViewModel.getSampleSafetyLog()` (`berkeley-mobile/Safety/SafetyViewModel.swift:158-160`).
- `GymOccupancyEntry.defaultRSFOccupancyPercentages` / `defaultStadiumOccupancyPercentages`, used as widget placeholder/preview data (`BerkeleyMobileWidget/GymOccupancyWidget.swift:15-16,29-35`).

Framework/platform capability demonstrated in fixtures: SwiftUI's preview mechanism (`context.isPreview` in `GymOccupancyProvider.getSnapshot`, `BerkeleyMobileWidget/GymOccupancyWidget.swift:38-45`) is used to serve this static sample data instead of a live Firestore fetch during Xcode canvas previews. This is not automated test infrastructure.

## Manual QA Tooling

The repository implements an in-app debug tool (`berkeley-mobile/Debug/DebugView.swift`, `DebugViewModel.swift`) accessible via a shake gesture in DEBUG builds (`berkeley-mobile/TabBarController.swift:29-38`). This supports manual debugging/QA during development but is not an automated test suite.

## Recommendation Placeholder

Per this document's scope (documenting what exists, not proposing changes), no testing framework, pattern, or convention can be documented beyond: "Not found in codebase."
