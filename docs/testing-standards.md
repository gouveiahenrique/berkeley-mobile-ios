# Testing Standards

## Test Coverage

No XCTest target, no XCTest spec files, and no test scheme were found in inspected repository areas. The Xcode scheme file at `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme` does not reference a test bundle. The CodeGraph blast-radius analysis reported "no covering tests found" for every symbol inspected across the codebase.

Testing infrastructure: **not found in codebase.**

## Preview-Based Development

The repository uses SwiftUI `#Preview` macros extensively for interactive component development. Examples observed:

- `BMActionButton.swift` — `#Preview { BMActionButton(title: "Book a Study Room") { ... } }`
- `TodayView.swift` — `#Preview { TodayView() }`
- `SafetyView.swift` — `#Preview { SafetyView() }`
- `ResourcesView.swift` — `#Preview { ResourcesView() }`
- `MapUserLocationButton.swift` — `#Preview { MapUserLocationButton {} }`
- `GymOccupancyWidget.swift` — `#Preview(as: .systemSmall) { GymOccupancyWidget() } timeline: { ... }`

These previews provide sample/fixture data; they are not automated tests.

## Sample Data Patterns

Several view models and model types define static sample instances used in previews:

- `BMEventCalendarEntry.sampleEntry` — static sample event in `BMEventCalendarEntry.swift`
- `SafetyViewModel.getSampleSafetyLog()` — returns a hard-coded `BMSafetyLog` instance
- `GymOccupancyEntry.defaultRSFOccupancyPercentages` / `defaultStadiumOccupancyPercentages` — default values for widget placeholder

These are fixture-level sample objects for use in `#Preview` contexts; they do not constitute a test suite.

## Mocking and Dependency Injection

FactoryKit's `Container` is the dependency injection mechanism. FactoryKit supports registration overrides per scope, which can be used in test targets for mock injection. No test-specific container registrations or mock objects were found in inspected repository areas.
