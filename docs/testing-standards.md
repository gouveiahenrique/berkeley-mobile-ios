# Testing Standards

## Testing Framework

No test targets, test files, or XCTest imports were found in the inspected repository areas. The repository does not contain a `*Tests/` directory or any files with `XCTest`, `XCTestCase`, or `@testable` imports.

The CodeGraph analysis confirms all symbols are flagged with "no covering tests found."

## Test Organization

Not found in codebase.

## Unit Tests

Not found in codebase.

## Integration Tests

Not found in codebase.

## UI Tests

Not found in codebase.

## Mocks and Fixtures

No dedicated mock or fixture types were found in the inspected repository areas.

The repository does include static sample data properties on model types used for SwiftUI previews:

- `BMEventCalendarEntry.sampleEntry` (`berkeley-mobile/Events/EventDataSource/BMEventCalendarEntry.swift`) — a static `BMEventCalendarEntry` instance.
- `SafetyViewModel.getSampleSafetyLog()` (`berkeley-mobile/Safety/SafetyViewModel.swift`) — returns a static `BMSafetyLog`.
- `GymOccupancyEntry` default static values (`BerkeleyMobileWidget/GymOccupancyWidget.swift`) — used in `#Preview` blocks.

These are used exclusively in `#Preview` macros and are not part of a test suite.

## Naming Conventions

No test naming conventions are applicable; no test files were found.
