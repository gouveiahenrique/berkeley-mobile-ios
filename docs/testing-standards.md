# Testing Standards

## Test Coverage

No test files were found in the inspected repository areas. The CodeGraph blast-radius annotations consistently indicate "no covering tests found" for all production symbols analyzed.

No `*Tests/` or `*Spec/` directories were identified in the repository outside the `Pods/` directory. The Xcode project file (`berkeley-mobile.xcodeproj`) was not read to enumerate all targets, so the existence of a test target configured in Xcode cannot be confirmed or denied from the inspected evidence.

## Testing Frameworks

Not found in codebase.

## Test Organization

Not found in codebase.

## Unit / Integration / UI Test Patterns

Not found in codebase.

## Test Fixtures and Mocks

The `SafetyViewModel` contains a `getSampleSafetyLog()` static helper method returning a hardcoded `BMSafetyLog` instance, used in SwiftUI `#Preview` blocks (`SafetyViewModel.swift:157-161`). This is present in production code and is not in a separate test-only file.

SwiftUI `#Preview` macros are used throughout the codebase for visual development previews (observed in `TodayView.swift`, `SafetyView.swift`, `GuidesView.swift`, `MapUserLocationButton.swift`, `SafetyMapMarker.swift`, etc.). These are not automated tests.

## Summary

Automated test infrastructure was not found in the inspected repository areas. All `#Preview` usage and sample data helpers serve UI preview purposes only.
