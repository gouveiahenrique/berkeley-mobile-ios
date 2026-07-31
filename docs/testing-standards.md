# Testing Standards

**Last updated:** 2026-07-31

## Current State

**There are no tests in this repository.** The Xcode scheme's `<TestAction>` block has an empty `<Testables>` list, and no test target or test files exist. This is a known gap.

When tests are added, follow the standards below.

---

## Recommended Testing Stack

| Type | Framework | Notes |
|------|-----------|-------|
| Unit tests | XCTest | Built into Xcode, no additional dependency |
| UI tests | XCUITest | Built into Xcode |
| Snapshot tests | swift-snapshot-testing (Point-Free) | Optional, for stable SwiftUI components |

---

## Test Target Setup

Add a new **Unit Test Bundle** target in Xcode:
- Target name: `berkeley-mobileTests`
- Test files live in a `berkeley-mobileTests/` directory at the repo root (sibling to `berkeley-mobile/`)
- Add a **UI Test Bundle** (`berkeley-mobileUITests/`) separately if UI testing is introduced

---

## Test Organization

```
berkeley-mobileTests/
├── Data/
│   ├── DataManagerTests.swift
│   └── BMErrorTests.swift
├── ViewModels/
│   ├── SafetyViewModelTests.swift
│   ├── DiningHallsViewModelTests.swift
│   └── EventsViewModelTests.swift
└── Utils/
    ├── DateExtensionTests.swift
    └── WeeklyHoursTests.swift
```

---

## Test Naming Convention

Use descriptive method names in the form `test_<condition>_<expectedOutcome>`:

```swift
// XCTest (Swift)
func test_fetchSafetyLogs_returnsEmptyArrayOnNetworkError() { ... }
func test_updateFilterState_filtersCorrectlyByTimeRange() { ... }
func test_display_propertyWrapper_trimsWhitespace() { ... }
```

---

## Test Structure (AAA Pattern)

```swift
func test_display_propertyWrapper_removesWhitespace() {
    // Arrange
    let raw = "  Hello  "

    // Act
    var wrapper = Display(wrappedValue: raw)

    // Assert
    XCTAssertEqual(wrapper.wrappedValue, "Hello")
}
```

---

## Mocking Strategy

### ViewModel unit tests

- Inject a mock `Firestore`-conforming object or mock the data service layer.
- FactoryKit supports test overrides via `Container.shared.<factoryName>.register { MockViewModel() }` — use this in `setUp()` and reset in `tearDown()`.

```swift
override func setUp() {
    Container.shared.safetyViewModel.register { MockSafetyViewModel() }
}
override func tearDown() {
    Container.shared.safetyViewModel.reset()
}
```

### DataSource (legacy) unit tests

- Subclass or mock the static `fetchItems` by swapping the Firestore `db` reference.
- Prefer testing the `parse*` helper methods in isolation since they are pure functions of `[String: Any]` dictionaries.

### Async tests

Use `async/await` in test methods directly (XCTest supports this since Xcode 13):

```swift
func test_fetchSafetyLogs_returnsLogs() async throws {
    let viewModel = SafetyViewModel()
    // wait for initial Task to complete
    try await Task.sleep(nanoseconds: 100_000_000)
    XCTAssertFalse(viewModel.safetyLogs.isEmpty)
}
```

---

## What to Test

### High priority (test first)

- **Pure logic in Utils:** `Date+Extension`, `WeeklyHours`, `DayOfWeek`, `Display` property wrapper, sorting functions.
- **ViewModel filter logic:** `SafetyViewModel.updateFilterState`, dining/fitness open-closed status transitions.
- **Model parsing:** Legacy `parseLibrary`, `parseGym` static helpers (dictionary → model).
- **BMError localised descriptions.**

### Lower priority

- **Views:** SwiftUI view rendering is hard to unit test; prefer manual testing or snapshot tests.
- **Firestore fetch calls:** Require network / emulator; treat as integration tests.

---

## Coverage Targets

No automated coverage gate is enforced today. When a test suite is established:

| Area | Target |
|------|--------|
| Utils / extensions | ≥ 90% |
| ViewModel filter/logic methods | ≥ 80% |
| Model parsing helpers | ≥ 85% |
| Overall | ≥ 60% (bootstrapping phase) |

Run coverage from Xcode: **Product → Test** with the **Code Coverage** checkbox enabled in the scheme editor.

---

## CI/CD Integration

No CI is configured in this repository. If GitHub Actions is added, the recommended step:

```yaml
- name: Build and test
  run: |
    xcodebuild test \
      -workspace berkeley-mobile.xcworkspace \
      -scheme berkeley-mobile \
      -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest' \
      CODE_SIGNING_ALLOWED=NO
```

---

## Best Practices

- Tests must pass with no device connected (simulator only, `CODE_SIGNING_ALLOWED=NO`).
- Do not hit the production Firestore instance in tests — mock or use the Firebase Emulator Suite.
- Each test must be independent; no shared mutable state between tests.
- Prefer `XCTAssertEqual` / `XCTAssertTrue` over generic `XCTAssert` for better failure messages.
- Avoid `sleep` / `DispatchQueue.asyncAfter` in tests — use `XCTestExpectation` or `async/await`.
