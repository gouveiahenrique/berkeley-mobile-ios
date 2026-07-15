# Testing Standards

## Test Coverage

No test files were found in the inspected repository areas. The CodeGraph blast-radius analysis consistently reports "⚠️ no covering tests found" for all inspected symbols, including all view controllers, view models, data sources, and utility types.

A Pods-internal test utility (`Pods/FirebaseCoreInternal/.../HeartbeatLoggingTestUtils.swift`) was found, but this is a third-party testing utility inside the CocoaPods dependency cache, not a project test.

## Test Targets

No XCTest or XCUITest targets were observed in the repository root or the `berkeley-mobile.xcodeproj`. No `*Tests` directories, `*Spec.swift` files, or `XCTestCase` subclasses were found in the project source.

## SwiftUI Previews

The codebase uses `#Preview` macros and `PreviewProvider` patterns extensively. These are not tests but provide in-editor visual checks for SwiftUI views. Examples observed:

- `BMActionButton.swift`: `#Preview { BMActionButton(title: "Book a Study Room") }`
- `SafetyView.swift`: `#Preview { SafetyView() }`
- `ResourcesView.swift`: `#Preview { ResourcesView() }`
- `GymOccupancyWidget.swift`: `#Preview(as: .systemSmall) { GymOccupancyWidget() } timeline: { ... }`
- `CalendarSectionView.swift`: preview using `Container.shared.calendarViewModel.preview { ... }` for FactoryKit mock injection

The `Container.preview` FactoryKit API is used in previews to substitute view model implementations, as seen in `CalendarSectionView.swift` and `CalendarView.swift`.

## Summary

No formal automated test suite (unit tests, integration tests, or UI tests) was found in this repository.
