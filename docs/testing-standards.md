# Testing Standards

**Last updated:** 2026-07-31

## Current State

The project currently has **no automated test targets**. The Xcode scheme's `<TestAction>` block has an empty `<Testables>` section, and no `*Tests` or `*Spec` directories exist in the repository. All verification is done through manual testing on simulator and device.

---

## Recommended Testing Setup

The following standards define how tests should be written when the project adds a test target.

### Testing Frameworks

- **Unit Tests:** XCTest (bundled with Xcode — no additional dependencies needed)
- **UI Tests:** XCUITest (Xcode built-in)
- **Async Testing:** Swift's built-in `async/await` support in XCTest (`func testExample() async throws`)

---

## Adding a Test Target

1. In Xcode: File → New → Target → Unit Testing Bundle
2. Name the target `berkeley-mobileTests`
3. Add to the existing `berkeley-mobile` scheme's Test action

---

## Test Organization

```
berkeley-mobileTests/
├── DataLayer/
│   ├── DataManagerTests.swift      # Caching, fetch dispatch logic
│   ├── BMErrorTests.swift          # Error localization
│   └── BMEventManagerTests.swift   # Calendar event CRUD
├── ViewModels/
│   ├── GymOccupancyViewModelTests.swift
│   ├── DiningHallsViewModelTests.swift
│   └── SafetyViewModelTests.swift
├── Utils/
│   ├── DateExtensionTests.swift
│   ├── StringExtensionTests.swift
│   └── WeeklyHoursTests.swift
└── Mocks/
    └── MockFirestore.swift          # Protocol-based Firestore mock
```

---

## Test Naming Conventions

Use the pattern `test_<subject>_<condition>_<expectedOutcome>`:

```swift
// File: GymOccupancyViewModelTests.swift
func test_getOccupancyColor_belowMediumLowerBound_returnsGreen()
func test_getOccupancyColor_betweenMediumBounds_returnsOrange()
func test_getOccupancyColor_aboveMediumHighBound_returnsRed()
func test_fetchOccupancyPercentages_whenFirestoreThrows_returnsZero()
```

---

## Test Structure (AAA Pattern)

```swift
func test_getOccupancyColor_belowMediumLowerBound_returnsGreen() {
    // Arrange
    let percentage = 50.0

    // Act
    let color = GymOccupancyViewModel.getOccupancyColor(percentage: percentage)

    // Assert
    XCTAssertEqual(color, .green)
}
```

---

## What to Test

### High-value targets (pure logic, no UI, no network)

- `GymOccupancyViewModel.getOccupancyColor(percentage:)` — threshold boundary logic
- `Date+Extension.swift` — date/time parsing and formatting
- `String+Extension.swift` — string utilities
- `WeeklyHours` — open/close time parsing
- `Version` comparison in `AppDelegate+Migration.swift`
- `BMError.errorDescription` — localization coverage
- `Display` property wrapper — whitespace/character stripping

### Medium-value targets (require mocking)

- `DataManager` caching logic — mock `DataSource` protocol
- `BMEventManager` — mock `EKEventStore` via a protocol wrapper
- ViewModels that process Firestore data — inject a mock `Firestore` or pass pre-parsed model arrays

---

## Mocking Strategy

### Unit Tests

Firestore cannot be instantiated in tests without a real Firebase app. Use protocol-based mocking:

```swift
protocol FirestoreProvider {
    func collection(_ path: String) -> CollectionReference
}

// In tests
struct MockFirestoreProvider: FirestoreProvider { ... }

// In production ViewModels — inject via constructor or Factory
class DiningHallsViewModel {
    private let db: FirestoreProvider
    init(db: FirestoreProvider = Firestore.firestore()) { ... }
}
```

For simpler cases, test only the pure transformation and sorting logic by calling parsing functions directly with mock dictionaries.

### UI / Integration Tests

- Use the iOS Simulator with a Firebase Emulator Suite for Firestore (optional)
- Alternatively, add a `#if DEBUG` injection point in `BerkeleyMobile+Injection.swift` to swap in mock ViewModels

---

## Async Test Pattern

```swift
func test_fetchOccupancyPercentages_returnsExpectedKeys() async throws {
    let viewModel = GymOccupancyViewModel()
    // Replace with a mock that returns deterministic data
    let result = await viewModel.fetchOccupancyPercentages()
    XCTAssertNotNil(result[.rsf])
    XCTAssertNotNil(result[.stadium])
}
```

---

## Running Tests

```bash
# Build and test from the command line (requires Xcode tools)
xcodebuild test \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest'
```

Or use **⌘+U** in Xcode.

---

## Coverage Targets (aspirational)

| Layer | Target |
|-------|--------|
| Pure utility functions (`Utils/`) | ≥90% |
| ViewModel transformation logic | ≥80% |
| Data model parsing | ≥80% |
| UI Views | Not measured (SwiftUI previews serve this role) |

---

## Best Practices

- ✅ Tests must be fast — mock all network/Firestore calls
- ✅ Tests must be deterministic — no `Date()` without dependency injection
- ✅ One XCTAssert per test concept (multiple asserts only when testing the same unit)
- ✅ Test boundary conditions on numeric thresholds (e.g., occupancy color transitions at 70, 90)
- ❌ Don't test Firebase SDK internals
- ❌ Don't snapshot-test SwiftUI views — use `#Preview` macros instead
- ❌ Don't write tests that require a live network connection
