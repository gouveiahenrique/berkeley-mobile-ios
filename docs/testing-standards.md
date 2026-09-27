# Testing Standards

## Test Targets

- LEVEL 1 — The Xcode project (`berkeley-mobile.xcodeproj/project.pbxproj`) defines exactly two `PBXNativeTarget` entries: `berkeley-mobile` (`com.apple.product-type.application`) and `BerkeleyMobileWidgetExtension` (`com.apple.product-type.app-extension`). No target with product type `com.apple.product-type.bundle.unit-test` or `com.apple.product-type.bundle.ui-testing` was found.
- LEVEL 1 — The shared scheme `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` contains a `<TestAction>` block, but its `<Testables>` element is empty (no `TestableReference` entries).
- Not found in codebase: any `*Tests` or `*UITests` directory, any file importing `XCTest`, or any `.xctestplan` file.

## Testing Frameworks

- Not found in codebase: XCTest, Quick/Nimble, or any other testing framework dependency. `Podfile` lists only `Firebase/*`, `FirebaseMessaging`, and `GoogleSignIn` pods — no test-related pods.

## Fixtures / Sample Data

- LEVEL 1 — Several types define static sample/preview data used for SwiftUI previews rather than automated tests, e.g.:
  - `BMEventCalendarEntry.sampleEntry` (`berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift`).
  - `SafetyViewModel.getSampleSafetyLog()` (`berkeley-mobile/Safety/SafetyViewModel.swift`).
  - `HomeView` includes a `#Preview { HomeView(mapViewController: MapViewController()) }` block (`berkeley-mobile/Home/HomeView.swift`).
- Per repository scope rules, this sample/preview data demonstrates SwiftUI's preview capability and provides fixture-style sample objects for manual/preview use; it is not evidence of an automated test suite.

## Summary

Not found in codebase: an automated unit, integration, or UI test suite. Testing conventions (naming, mocks, utilities) cannot be documented because no test code exists in the repository at the time of this analysis.
