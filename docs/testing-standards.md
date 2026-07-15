# Testing Standards

## Test Targets

No test targets (`*Tests`, `*Spec`, `XCTestCase` subclasses, or test scheme configurations) were found in the inspected areas of the repository.

Specifically:
- No Swift files matching the pattern `*Tests.swift` or `*Spec.swift` were found under `berkeley-mobile/` or `BerkeleyMobileWidget/`.
- No Xcode test target directories were found at the repository root.
- The `Podfile` declares no testing-related pods (e.g., Quick, Nimble, OHHTTPStubs).

## Debug-Only Code

A debug build configuration path exists in the application code. `TabBarController.motionEnded(_:with:)` (`berkeley-mobile/TabBarController.swift:29`) presents a `DebugView` when the device is shaken, guarded by `#if DEBUG`. `DebugViewModel` and `DebugView` are registered and compiled only under the `DEBUG` preprocessor flag (`berkeley-mobile/BerkeleyMobile+Injection.swift`).

## SwiftUI Previews

SwiftUI `#Preview` macros are used in widget code. `GymOccupancyWidget.swift` contains a `#Preview` block with multiple timeline entries for development-time preview. These are not tests but indicate that preview-driven development is practiced for widget UI.

## Summary

A formal automated test suite was not found in the inspected repository areas. The observed quality mechanisms are limited to `#if DEBUG` debug tooling and SwiftUI previews.
