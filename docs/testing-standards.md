# Testing Standards

## Test Infrastructure Status

- The Xcode project's `PBXNativeTarget` section (`berkeley-mobile.xcodeproj/project.pbxproj`) defines exactly two targets: `berkeley-mobile` (`com.apple.product-type.application`) and `BerkeleyMobileWidgetExtension` (`com.apple.product-type.app-extension`). No target of `productType` `com.apple.product-type.bundle.unit-test` or `com.apple.product-type.bundle.ui-testing` was found.
- The shared scheme `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` contains a `<TestAction>` with an empty `<Testables>` block, confirming no test bundle is currently wired into the scheme's test action.
- No files or directories matching `*Test*`/`*Tests*` were found outside of `Pods/` in this repository.
- No `import XCTest` statements were found in `berkeley-mobile/` source files.

**Not found in codebase: an automated test suite (unit, integration, or UI) for this repository.**

## Manual/Debug-Time Verification Facilities

While no automated tests exist, the repository implements developer-facing debug tooling that functions as a manual verification aid:

- `berkeley-mobile/Debug/DebugView.swift` and `DebugViewModel.swift` implement a debug-only SwiftUI screen, registered in dependency injection only under `#if DEBUG` (`berkeley-mobile/BerkeleyMobile+Injection.swift:17-21`).
- `berkeley-mobile/TabBarController.swift:29-38` implements a shake-gesture (`motionEnded`, `.motionShake`) handler that presents `DebugView` only in `#if DEBUG` builds.

## Recommendation Scope

Per this documentation's scope (`document what exists`, not `recommend what should exist`), no testing conventions, fixture patterns, mocking approach, or naming conventions can be documented, since none were found in the repository.

## Not Found in Codebase

- Unit test target or test files.
- UI test target or test files.
- Test fixtures or mock data files.
- A test runner configuration (e.g. `xcodebuild test` invocation) in any script within this repository.
- A code coverage configuration.
