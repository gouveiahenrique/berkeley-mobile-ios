# Testing Standards

## Testing Frameworks

No test files were found in the inspected repository areas. CodeGraph's blast-radius analysis annotated every examined symbol with "no covering tests found."

No `XCTestCase` subclasses, test targets, or test scheme configurations were discovered during exploration.

## Test Organization

Not found in codebase.

## Unit Tests

Not found in codebase.

## Integration Tests

Not found in codebase.

## UI Tests

Not found in codebase.

## Fixtures and Mocks

The codebase contains preview helpers used by SwiftUI `#Preview` macros:

- `SafetyViewModel.getSampleSafetyLog()` — returns a hardcoded `BMSafetyLog` instance (`berkeley-mobile/Safety/SafetyViewModel.swift:158`).
- `GymOccupancyEntry` static defaults (`GymOccupancyEntry.defaultRSFOccupancyPercentages`, `defaultStadiumOccupancyPercentages`) — used in `#Preview` blocks in `GymOccupancyWidget.swift`.
- Many SwiftUI views have `#Preview` blocks with inline sample data.

These are build-time preview helpers, not test fixtures used in an automated test suite.

## Naming Conventions

Not applicable — no test files found in codebase.

## Test Utilities

Not found in codebase.
