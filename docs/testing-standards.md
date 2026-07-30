# Testing Standards

## Test Infrastructure

No test targets, XCTest files, or test directories were found in the inspected repository. The `.codegraph` index surfaces no test-covering entries for any production symbol — every symbol inspected carries the annotation "no covering tests found."

There is no `Package.swift`, no `*Tests` folder, and no test scheme configuration found in the repository structure.

## SwiftUI Previews

The codebase makes extensive use of `#Preview` macros and `PreviewProvider`-style declarations as a development-time rendering mechanism. These are not automated tests.

Examples observed:
- `TodayView.swift` — `#Preview { TodayView() }`
- `SafetyView.swift` — `#Preview { SafetyView() }`
- `ResourcesView.swift` — `#Preview { ResourcesView() }`
- `SafetyLogDetailView.swift` — two `#Preview` blocks with inline sample data
- `GymOccupancyWidget.swift` — `#Preview(as: .systemSmall)` with hardcoded timeline entries
- `CalendarSectionView.swift` — preview using `Container.shared.calendarViewModel.preview { ... }` to inject test data via FactoryKit

## Sample Data

`SafetyViewModel` provides a static `getSampleSafetyLog()` method that returns a hardcoded `BMSafetyLog` instance for use in previews. No other static fixture factories were found in production code.

## Debug Build Support

A `#if DEBUG`-gated `DebugView` is available and accessible via shake gesture in `TabBarController.motionEnded`. A `DebugViewModel` is registered in the FactoryKit container only in `DEBUG` builds:

```swift
#if DEBUG
var debugViewModel: Factory<DebugViewModel> {
    self { DebugViewModel(feedbackFormPresenter: self.feedbackFormPresenter()) }
}
#endif
```

## Automated Testing

Not found in codebase.
