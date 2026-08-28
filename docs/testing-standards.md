# Testing Standards

## Finding

No automated test suite was found in this repository.

Evidence:
- No file or directory matching `*Tests*` exists outside `Pods/` (checked via repository-wide search).
- `berkeley-mobile.xcodeproj/project.pbxproj` defines exactly two native targets — `berkeley-mobile` (`com.apple.product-type.application`) and `BerkeleyMobileWidgetExtension` (`com.apple.product-type.app-extension`) — neither of which is a `com.apple.product-type.bundle.unit-test` or `com.apple.product-type.bundle.ui-testing` target.
- No `XCTest` import or `TEST_HOST` build setting was found in `project.pbxproj`.
- The only checked-in Xcode scheme, `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`, has a `<TestAction>` with an empty `<Testables>` list:
  ```xml
  <TestAction buildConfiguration = "Debug" ...>
     <Testables>
     </Testables>
  </TestAction>
  ```
- Multiple `codegraph_explore` blast-radius results for core types (`DataManager`, `BMNetworkingManager`, `TabBarController`, `BMEventCalendarEntry`, etc.) each report "⚠️ no covering tests found."
- No CI configuration (e.g. `.github/workflows/`) that would invoke `xcodebuild test` was found.

## Consequence for This Document

Per the repository-scope and negative-evidence rules, the following statements are the accurate summary of current state:
- Unit testing framework: not found in codebase.
- Integration/UI testing framework: not found in codebase.
- Test organization, naming conventions, fixtures, and mocks: not applicable — no test code exists to derive conventions from.
- `docs/dod.md` reflects this: no automated test command is included in the Definition of Done, with the omission explained explicitly rather than silently skipped.

## Manual/Debug Verification Path (Level 1)

The repository does provide a manual, in-app debug affordance rather than automated tests:
- `berkeley-mobile/Debug/DebugView.swift` and `DebugViewModel.swift` implement a `#if DEBUG`-only screen.
- `berkeley-mobile/TabBarController.swift` presents this screen in response to a shake gesture (`motionEnded`, checking `motion == .motionShake`), only in `DEBUG` builds.

This is a manual developer-facing debug tool, not an automated test harness, and should not be conflated with unit/integration/e2e testing.
