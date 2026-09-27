# Testing Standards

## Current State

A repository-wide search for test infrastructure found:

- No files importing `XCTest` anywhere in the tracked source (`berkeley-mobile/`, `BerkeleyMobileWidget/`).
- No `*Tests` / `*UITests` directories or Xcode test targets.
- No test target listed in `berkeley-mobile.xcodeproj/project.pbxproj`'s native targets.
- The shared scheme `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` declares a `<TestAction>`, but its `<Testables>` element is empty — no test bundle is wired to `xcodebuild test`.
- No fixtures, mocks, or test utility files were found.
- No CI configuration (e.g. `.github/workflows/`) was found that would run a test suite.

**Conclusion: this repository currently has no automated test suite. Not found in codebase.**

## Testing Frameworks

Not found in codebase — no `XCTest`, `Quick`/`Nimble`, `swift-testing`, or snapshot-testing dependency is declared in `Podfile` or `Package.resolved`.

## Test Organization

Not applicable — no test files exist to organize.

## Unit / Integration / E2E Patterns

Not found in codebase.

## Fixtures, Mocks, Utilities

No dedicated fixture/mock files exist. However, several production types define **inline sample-data helpers** used for SwiftUI Previews rather than automated tests, e.g.:

- `SafetyViewModel.getSampleSafetyLog()` (`berkeley-mobile/Safety/SafetyViewModel.swift`) — returns a hardcoded `BMSafetyLog` instance.
- `OpenTimesCardSwiftUIView`'s private `ClosedItem`/`OpenItem` structs conforming to `HasOpenTimes` with `createSampleWeeklyHours()` (`berkeley-mobile/Common/DetailView/OpenTimesCardSwiftUIView.swift`) — synthetic data for `#Preview` blocks.

These exist to drive Xcode's `#Preview` macro for manual visual inspection during development, not for automated verification.

## Naming Conventions

Not applicable (no test files exist to establish a naming convention).

## Debug-Only Manual Verification Tooling

In lieu of automated tests, the codebase includes a `#if DEBUG`-gated in-app debug surface for manual verification during development:

- `berkeley-mobile/Debug/DebugView.swift` / `DebugViewModel.swift` — a SwiftUI debug screen, reachable at runtime only in Debug builds via a device-shake gesture (`TabBarController.motionEnded`, `berkeley-mobile/TabBarController.swift`).

## Recommendation Context (evidence only, not a directive)

Since no test target/scheme wiring exists, there is currently no discovered command to run tests (e.g. no working `xcodebuild test -scheme berkeley-mobile` target, since `<Testables>` is empty). See `docs/dod.md` for the exact build/lint commands that *are* discoverable in this repository.
