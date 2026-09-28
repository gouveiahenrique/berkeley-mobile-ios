# Testing Standards

## Automated Test Targets

Not found in codebase. Specifically:
- No `XCTest` import was found anywhere in the repository (`grep -rl "import XCTest"` over all Swift files returned no matches).
- No directory or file matching `*Tests*`/`*UITests*` was found in the repository.
- The shared Xcode scheme `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` has a `TestAction` with an empty `<Testables>` element, confirming no test target is wired into the scheme.
- No unit test target or UI test target is declared in `berkeley-mobile.xcodeproj/project.pbxproj`'s `PBXNativeTarget` section (only `berkeley-mobile` and `BerkeleyMobileWidgetExtension` targets exist).

This means: the repository does not implement unit tests, integration tests, or UI tests via XCTest/XCUITest in the inspected areas.

## SwiftUI Preview-Based Manual Verification

The repository implements 47 `#Preview` blocks (counted via `grep -rn "#Preview"` across `berkeley-mobile/`) across SwiftUI views (e.g. `berkeley-mobile/Safety/SafetyView.swift`, `berkeley-mobile/Events/EventsView.swift`, `berkeley-mobile/Today/TodayView.swift`, `berkeley-mobile/Safety/SafetyLogDetailView.swift`). These are Xcode canvas previews for manual visual verification during development, not automated tests — framework capability (SwiftUI `#Preview` macro) used for interactive preview, not test assertions.

## Sample/Fixture Data for Previews

The repository defines static sample-data factories/constants used to populate `#Preview` blocks and (per file comments) UI states, for example:
- `BMEventCalendarEntry.sampleEntry` (`berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift:136`) — a static, hardcoded `BMEventCalendarEntry` instance.
- `SafetyViewModel.getSampleSafetyLog()` (`berkeley-mobile/Safety/SafetyViewModel.swift:158`), defined in an `extension SafetyViewModel` under a `// MARK: - Sample Data` comment.

These are framework-capability usages (SwiftUI preview fixtures) demonstrated in production source files, not test fixtures in a dedicated test target — no `Tests/`, `Fixtures/`, or `Mocks/` directory was found in the repository.

## Manual/Device Testing Artifacts

- The shared scheme's `LaunchAction` sets `allowLocationSimulation = "YES"` with a `LocationScenarioReference` of `"San Francisco, CA, USA"`, indicating manual simulator-based location testing is part of the developer workflow (framework capability configured in the scheme, not an automated test).

## Not Applicable / Unknown

- Testing frameworks (XCTest, Quick/Nimble, etc.): not found in codebase.
- Mocking libraries: not found in codebase.
- CI-driven test execution: no CI configuration (e.g. `.github/workflows`) was found in the inspected repository areas.
</content>
