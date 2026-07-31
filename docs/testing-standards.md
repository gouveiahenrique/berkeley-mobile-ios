# Testing Standards

**Last updated:** 2026-07-31

## Current State

Berkeley Mobile iOS has **no automated test suite** at this time. The Xcode scheme's `<TestAction>` block has an empty `<Testables>` list, and no `XCTestCase` subclasses exist in the repository. There is no separate test target in the Xcode project.

All verification is currently done manually by running the app in the iOS Simulator or on-device.

## Recommended Testing Approach

When adding tests to this project, follow the conventions below.

### Testing Framework

- **Unit Tests:** XCTest (built into Xcode) — `import XCTest`
- **UI Tests:** XCUITest (built into Xcode) — separate target, run against the simulator
- **No third-party testing libraries** are currently configured

### Test Target Setup

Create an Xcode unit test target named `berkeley-mobileTests` and a UI test target named `berkeley-mobileUITests`. Add them to the existing scheme's `<Testables>` list.

### Test Organization

```
berkeley-mobileTests/
├── Data/
│   ├── BMErrorTests.swift         # Error enum and LocalizedError descriptions
│   ├── DataManagerTests.swift     # Fetch interval and caching logic
│   └── ItemProtocols/             # Protocol conformance tests
├── ViewModels/
│   ├── SafetyViewModelTests.swift # Filter logic (time/crime filter state)
│   ├── EventsViewModelTests.swift # Calendar entry state
│   └── DiningHallsViewModelTests.swift
└── Utils/
    ├── DateExtensionTests.swift    # Date+Extension helpers
    └── WeeklyHoursTests.swift      # Open/closed time calculations
```

### Test Naming Conventions

Follow `test_<methodUnderTest>_<scenario>_<expectedOutcome>` or plain descriptive names:

```swift
// File: SafetyViewModelTests.swift
func test_updateFilterState_withNoFilters_returnAllLogs() { ... }
func test_updateFilterState_withTodayFilter_returnsOnlyTodayLogs() { ... }
func test_getSafetyLogState_withKnownCrime_returnsCorrectFilterState() { ... }
```

### Test Structure (AAA Pattern)

```swift
func test_updateFilterState_withNoFilters_returnAllLogs() {
    // Arrange
    let viewModel = SafetyViewModel()
    let logs = [BMSafetyLog.mock(), BMSafetyLog.mock()]
    viewModel.safetyLogs = logs
    viewModel.selectedSafetyLogFilterStates = []

    // Act
    // (filter update is triggered by didSet on selectedSafetyLogFilterStates)

    // Assert
    XCTAssertEqual(viewModel.filteredSafetyLogs.count, logs.count)
}
```

### Mocking Strategy

This project uses constructor-injected dependencies via the Factory DI container, which makes unit testing straightforward:

```swift
// Override the container for tests
Container.shared.safetyViewModel.register { MockSafetyViewModel() }

// Or inject directly in initializers
let viewModel = DiningHallsViewModel(db: MockFirestore())
```

- **Unit tests:** mock all Firestore calls — do not make real network requests in unit tests.
- Use `static func getSampleSafetyLog()` helper methods (already present on some models) as factories for test data.
- For `@Observable` classes, test public state changes directly — no need to observe publishers in XCTest.

### What to Test First

Priority areas when introducing tests:

1. **Filter/sort logic** in ViewModels (`SafetyViewModel.updateFilterState`, `DiningHallsViewModel` meal filtering)
2. **Date/time utilities** (`Date+Extension`, `WeeklyHours`, `DayOfWeek`)
3. **Model decoding** — confirm `CodingKeys` mappings survive Firestore field name changes
4. **BMError localized descriptions** — ensure user-facing strings are correct

### Running Tests

```bash
# From command line (requires Xcode and simulator)
xcodebuild test \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16'
```

Or use Cmd+U in Xcode.

### Coverage Targets (aspirational)

| Layer | Target |
|-------|--------|
| ViewModel business logic | ≥ 80% |
| Utility / extension methods | ≥ 90% |
| Data model decoding | ≥ 70% |
| UI Views | Not measured (SwiftUI previews serve as smoke tests) |

## SwiftUI Previews

In lieu of automated UI tests, all SwiftUI views should have `#Preview` blocks that exercise common states (loading, empty, populated, error). This is the primary way UI correctness is verified today.

```swift
#Preview {
    SafetyView()
}

#Preview("Empty state") {
    GuidesView()
        // inject a ViewModel with empty guides
}
```
