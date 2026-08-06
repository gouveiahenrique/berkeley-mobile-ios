# Testing Standards

## Repository Evidence

A repository-wide search for test-related artifacts was performed:
- No directory named `Tests`, `*Tests`, or `*UITests` exists in the repository outside of `Pods/` (third-party dependency sources).
- No Swift file in the repository (outside `Pods/`) contains `import XCTest`.
- The shared Xcode scheme `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` contains a `<TestAction>` element (a default Xcode scheme section), but its `<Testables>` list was empty of any project-owned test target in the areas inspected.
- `berkeley-mobile.xcodeproj/project.pbxproj` defines 8 `PBXNativeTarget` entries; the two named targets identified were `berkeley-mobile` (`com.apple.product-type.application`) and `BerkeleyMobileWidgetExtension` (`com.apple.product-type.app-extension`). No target with a test product type (e.g. `com.apple.product-type.bundle.unit-test` or `com.apple.product-type.bundle.ui-testing`) was found among the named targets inspected.

## Conclusion

Not found in codebase: a unit test suite, integration test suite, UI test suite, test target, testing framework dependency (e.g. XCTest, Quick/Nimble), fixtures, mocks, or test-naming conventions.

This is a statement of what was not found in the inspected repository areas, not a claim that automated testing is entirely absent from the project's process (e.g. manual QA, external test infrastructure, or a test target added after this analysis would not be captured here).

## Manual/Ad-Hoc Verification Mechanisms Observed

While no automated test suite exists, the repository does implement a debug-only in-app inspection view:
- `berkeley-mobile/Debug/DebugView.swift` and `DebugView Model.swift` implement a `DebugView`, gated behind `#if DEBUG` and presented via a shake gesture in `TabBarController.motionEnded(_:with:)` (`berkeley-mobile/TabBarController.swift:29-38`). This is a manual developer tool, not an automated test.

## Framework/Platform Capability (not used in this repository)

Xcode and the iOS SDK support XCTest-based unit and UI testing, and this is a general convention for iOS application development (not verified in repository). The repository does not implement this capability at the time of this analysis.
