# Testing Standards

## Discovery Method

A search for test-related paths was run against the repository root, excluding `Pods/`:
`find . -iname "*Tests*" -maxdepth 2 -not -path "./Pods/*"` returned no results. The Xcode project file (`berkeley-mobile.xcodeproj/project.pbxproj`) contains exactly two `PBXNativeTarget` entries with `productType`s of `com.apple.product-type.application` and `com.apple.product-type.app-extension` — no `com.apple.product-type.bundle.unit-test` or `com.apple.product-type.bundle.ui-testing` target was found. Only one shared scheme exists (`berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`).

## Testing Frameworks

Not found in codebase. No `XCTest` test target, no `import XCTest` usage, and no third-party testing framework (e.g. Quick/Nimble) was found in the `Podfile`, `Podfile.lock`, or the Swift Package Manager references in `project.pbxproj`.

## Test Organization

Not applicable — no test target exists in the repository as inspected.

## Unit / Integration / E2E Patterns

Not found in codebase.

## Fixtures / Mocks / Sample Data

LEVEL 1: The repository contains **in-source sample data used for SwiftUI previews and UI fallback content**, not for automated testing:
- `BMEventCalendarEntry.sampleEntry` (`berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift`) — a static sample event.
- `SafetyViewModel.getSampleSafetyLog()` (`berkeley-mobile/Safety/SafetyViewModel.swift`) — a static sample safety log.
- `GymOccupancyEntry.defaultRSFOccupancyPercentages` / `.defaultStadiumOccupancyPercentages` (`BerkeleyMobileWidget/GymOccupancyWidget.swift`) and the `#Preview(as: .systemSmall)` block in the same file, used by WidgetKit's preview/placeholder timeline.
- SwiftUI `#Preview` blocks embedding sample state (e.g. `BMSegmentedControlView.swift`'s `PreviewWrapper`).

Per the repository scope rules, this is "framework/platform capability demonstrated in fixtures" (SwiftUI/WidgetKit preview support) and sample/fallback UI content — it is not evidence of an automated test suite.

## Naming Conventions

Not applicable — no test files exist to derive a naming convention from.

## CI Test Execution

Not found in codebase. No `.github/workflows/` directory or other CI configuration file was found in the repository.

## Not found in codebase

- Unit tests
- UI tests
- Snapshot tests
- Mocking framework
- Code coverage tooling/configuration
