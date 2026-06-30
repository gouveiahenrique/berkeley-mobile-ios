# Testing Standards

## Observed State

No test target directory was found in the repository. The CodeGraph blast-radius annotations on all inspected symbols consistently report: `⚠️ no covering tests found`. A dedicated test scheme or `*Tests` directory was not found in the inspected repository areas.

## Test Tooling

No testing framework configuration (XCTest, Quick/Nimble, or other) was found in the inspected source. The `Podfile` does not declare any test-specific pods.

## Preview Usage

SwiftUI `#Preview` blocks are present in several view files, used for Xcode canvas previews during development. These are not automated tests. Examples observed:

- `GymOccupancyWidget.swift` — preview with sample `GymOccupancyEntry` values
- `SafetyLogDetailView.swift` — preview using `SafetyViewModel.getSampleSafetyLog()`
- `CalendarView.swift` — preview wiring `CalendarViewModel` through `Container.shared.calendarViewModel.preview { viewModel }`

The FactoryKit `Container` supports a `.preview { ... }` override mechanism used in these preview blocks, indicating an intent to support testable injection.

## Sample / Fixture Data

Sample data methods were found:

- `SafetyViewModel.getSampleSafetyLog()` — returns a sample `BMSafetyLog` for use in previews
- `BMEventCalendarEntry.sampleEntry` — static sample event used in previews

These are not test fixtures in an automated sense; they are used exclusively in `#Preview` blocks.

## Testing Standards

Automated test standards (naming conventions, test organization, mock patterns, coverage requirements) are not found in the inspected codebase.
