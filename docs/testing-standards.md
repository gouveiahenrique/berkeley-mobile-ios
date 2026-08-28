# Testing Standards

## Testing Frameworks

Not found in codebase. No `import XCTest` or `import Testing` usage, and no dedicated test target were found in the inspected repository areas (a search for `*Tests*` paths, excluding `Pods/`, returned no results).

## Test Organization

Not applicable — no test files or test target exist in the repository.

Supporting evidence:
- `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` defines a `<TestAction>` with an empty `<Testables>` element, meaning the shared scheme has no test target attached to run.
- `find` over the repository (excluding `Pods/`) for paths containing "Tests" returned no matches.
- No `.github/workflows`, `Fastfile`, or other CI configuration was found that would invoke `xcodebuild test`.

## Unit / Integration / E2E Patterns

Not found in codebase.

## Fixtures, Mocks, and Utilities

No mocking framework or test-fixture directory was found. However, several production types define static/sample data that could serve as manual preview or debug data (not test fixtures):
- `BMEventCalendarEntry.sampleEntry` — a static sample event (`berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift:136-146`), used with SwiftUI `#Preview` providers.
- `SafetyViewModel.getSampleSafetyLog()` — a static sample `BMSafetyLog` (`berkeley-mobile/Safety/SafetyViewModel.swift:157-160`).
- `GymOccupancyEntry.defaultRSFOccupancyPercentages` / `defaultStadiumOccupancyPercentages` and the `#Preview` block in `BerkeleyMobileWidget/GymOccupancyWidget.swift:14-16,184-191`.

These are framework capabilities (SwiftUI `#Preview` / WidgetKit preview timelines) demonstrated in the app's own view files, not a test suite. Document as: "SwiftUI/WidgetKit preview support demonstrated in view files; not used as an automated test mechanism in this repository."

## Naming Conventions

Not applicable — no test files exist to derive a naming convention from.

## Manual Verification Aids

`berkeley-mobile/Debug/DebugView.swift` and `berkeley-mobile/Debug/DebugViewModel.swift` implement an in-app debug screen, reachable via a shake gesture guarded by `#if DEBUG` in `berkeley-mobile/TabBarController.swift:29-38`. This is a manual, developer-facing diagnostic view, not an automated test.
