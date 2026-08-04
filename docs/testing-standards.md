# Testing Standards

**Last updated:** 2026-08-04

## Current State

Berkeley Mobile iOS has **no automated test suite** in the repository. There are no XCTest targets, no unit test files, and no UI test files. The `.xcodeproj` contains no test target definitions.

This document establishes standards for adding tests going forward.

---

## Testing Framework

- **Unit / Integration Tests:** XCTest (built into Xcode; no additional dependency required)
- **UI Tests:** XCUITest (built into Xcode)
- **Mocking:** Manual protocol-based fakes (preferred) or `@testable import` with subclassing

---

## Recommended Test Organization

When adding a test target, follow this structure:

```
berkeley-mobileTests/                # Unit test target
├── Data/
│   ├── BMErrorTests.swift
│   └── DataManagerTests.swift
├── Features/
│   ├── Safety/
│   │   ├── SafetyViewModelTests.swift
│   │   └── BMSafetyLogTests.swift
│   ├── Dining/
│   │   └── DiningHallsViewModelTests.swift
│   └── ...
├── Utils/
│   ├── DateExtensionTests.swift
│   └── WeeklyHoursTests.swift
└── Common/
    └── BMAlertTests.swift

berkeley-mobileUITests/              # UI test target (optional)
└── OnboardingUITests.swift
```

---

## Test Naming Conventions

### File names

`TypeNameTests.swift` — mirrors the file under test (e.g., `SafetyViewModelTests.swift` for `SafetyViewModel.swift`).

### Test method names

Use `test_<scenario>_<expectedOutcome>()` format:

```swift
// XCTest
func test_updateFilterState_withNoFilters_returnsAllLogs() { ... }
func test_updateFilterState_withTodayFilter_returnsOnlyTodayLogs() { ... }
func test_fetchSafetyLogs_onNetworkError_setsAlert() { ... }
```

### Test class names

```swift
final class SafetyViewModelTests: XCTestCase { ... }
```

---

## Test Structure (AAA Pattern)

```swift
func test_getSafetyLogState_withRobbery_returnsRobberyState() {
    // Arrange
    let log = BMSafetyLog(crime: "Robbery", date: Date(), detail: "", 
                           latitude: 0, location: "", longitude: 0)

    // Act
    let state = log.getSafetyLogState

    // Assert
    XCTAssertEqual(state, .robbery)
}
```

---

## What to Test

### High Priority (test first)

- **Model logic:** `BMSafetyLog.getSafetyLogState`, `HasOpenClosedStatus.updateIsOpenStatus`, `WeeklyHours` parsing
- **Utility extensions:** `Date+Extension`, `String+Extension`, `Collection+Extension`
- **ViewModel filter/sort logic:** `SafetyViewModel.updateFilterState`, sort functions in `SortingFunctions.swift`
- **Error types:** `BMError.errorDescription` localization strings
- **Protocol conformances:** `CanFavorite`, `HasOpenClosedStatus` default implementations

### Medium Priority

- **ViewModel state transitions:** Loading → loaded → error; filter selection side-effects
- **DataManager:** Fetch caching, `fetchIfNecessary` interval logic

### Lower Priority / Skip

- Firestore network calls (mock at the protocol boundary instead)
- SwiftUI view rendering (prefer manual testing in simulator/device)
- Firebase Analytics calls (side effects)

---

## Mocking Strategy

Since `BMNetworkingManager` and Firestore are concrete singletons, extract protocol boundaries when writing testable ViewModels:

```swift
// Define a protocol for the networking layer
protocol SafetyDataFetching {
    func fetchSafetyLogs() async throws -> [BMSafetyLog]
}

// Production implementation
extension BMNetworkingManager: SafetyDataFetching {}

// Test double
final class MockSafetyDataFetcher: SafetyDataFetching {
    var stubbedLogs: [BMSafetyLog] = []
    var shouldThrow = false

    func fetchSafetyLogs() async throws -> [BMSafetyLog] {
        if shouldThrow { throw URLError(.notConnectedToInternet) }
        return stubbedLogs
    }
}
```

Inject the dependency via the Factory container's `test` scope or via constructor injection in tests.

---

## Coverage Targets

No coverage tooling is currently configured. When adding tests, aim for:

| Area | Target |
|------|--------|
| Model / value type logic | ≥90% |
| Utility extensions | ≥85% |
| ViewModel business logic | ≥70% |
| DataManager caching | ≥70% |

---

## Running Tests

Once a test target exists:

```bash
# Run all unit tests from command line (requires Xcode command line tools)
xcodebuild test \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16,OS=18.0'
```

From Xcode: `Cmd + U` or Product → Test.

---

## Simulator Testing (Manual)

Since no automated tests exist, feature testing is performed manually in the iOS Simulator or on a physical device. When verifying a change:

1. Build and run on an iPhone simulator (iOS 18+)
2. Exercise the changed feature's golden path
3. Check the Xcode console for any `os.Logger` errors or Firebase errors
4. Verify the widget extension builds without errors (`BerkeleyMobileWidgetExtension` scheme)

---

## CI/CD Integration

No CI pipeline is configured in the repository. If added in the future, the recommended command is:

```bash
xcodebuild test \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16,OS=18.0' \
  -resultBundlePath TestResults.xcresult
```
