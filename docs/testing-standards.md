# Testing Standards

**Last updated:** 2026-07-31

## Current State

The project currently has **no automated test targets** in the Xcode project. There are no XCTest targets, no test plan files (`.xctestplan`), and no test files in the repository. This is an open-source community project where testing infrastructure has not been established.

This document defines the standards that **should** be followed when tests are added, and provides guidance for contributors looking to introduce testing.

## Recommended Testing Framework

- **Unit Tests:** XCTest (built into Xcode, no extra dependency)
- **UI Tests:** XCUITest (for critical flows if added)
- **Async testing:** Swift Concurrency + `XCTestExpectation` or `@MainActor` test methods

## Recommended Test Organization

When tests are added, the standard Xcode structure should be used:

```
berkeley-mobileTests/              # Unit test target
├── DataTests/
│   ├── DataManagerTests.swift
│   └── BMNetworkingManagerTests.swift
├── ViewModelTests/
│   ├── SafetyViewModelTests.swift
│   ├── DiningHallsViewModelTests.swift
│   └── EventsViewModelTests.swift
└── UtilsTests/
    ├── DateExtensionTests.swift
    └── DisplayPropertyWrapperTests.swift
berkeley-mobileUITests/            # UI test target (optional)
└── HomeFlowUITests.swift
```

## Test Naming Conventions (XCTest)

```swift
// File: SafetyViewModelTests.swift
// Class: SafetyViewModelTests: XCTestCase

func testFetchSafetyLogsSuccess() { ... }
func testFetchSafetyLogsReturnsEmptyOnNetworkFailure() { ... }
func testFilterByTodayReturnsOnlyTodayLogs() { ... }
```

Pattern: `test<MethodUnderTest><Scenario>` or `test<BehaviorBeingTested>`

## Test Structure (AAA Pattern)

```swift
func testDisplayPropertyWrapperTrimsWhitespace() {
    // Arrange
    @Display var name: String = "  Hello World  "

    // Act
    let result = name

    // Assert
    XCTAssertEqual(result, "Hello World")
}
```

## Mocking Strategy

### ViewModels

ViewModels depend on Firestore via `BMNetworkingManager` or direct `Firestore.firestore()` calls. To unit test them, inject a protocol-based mock:

1. Extract a protocol from `BMNetworkingManager` (e.g., `NetworkingManagerProtocol`)
2. Inject via initializer parameter (default to the real implementation)
3. In tests, pass a `MockNetworkingManager` that returns fixture data

```swift
// Protocol for testability
protocol NetworkingManagerProtocol {
    func fetchSafetyLogs() async throws -> [BMSafetyLog]
}

// ViewModel accepts the protocol
class SafetyViewModel: ObservableObject {
    private let networkingManager: NetworkingManagerProtocol
    init(networkingManager: NetworkingManagerProtocol = BMNetworkingManager.shared) {
        self.networkingManager = networkingManager
    }
}

// Mock in tests
struct MockNetworkingManager: NetworkingManagerProtocol {
    func fetchSafetyLogs() async throws -> [BMSafetyLog] {
        return [SafetyViewModel.getSampleSafetyLog()]
    }
}
```

### FactoryKit Mocks

For ViewModels registered in the FactoryKit `Container`, use `Container.shared.<factory>.register { MockViewModel() }` in `setUp()` and call `Container.shared.reset()` in `tearDown()`.

### DataSource (Legacy)

Legacy `DataSource` implementations call Firestore directly via static methods. These are harder to unit test without integration setup — prefer testing the data transformation logic in isolation where possible.

## Async Testing

```swift
func testFetchSafetyLogsAsync() async throws {
    // Arrange
    let sut = SafetyViewModel(networkingManager: MockNetworkingManager())

    // Wait for async init to complete
    try await Task.sleep(nanoseconds: 100_000_000)

    // Assert
    XCTAssertFalse(sut.safetyLogs.isEmpty)
}
```

For `@MainActor` ViewModels, mark the test method `@MainActor`:

```swift
@MainActor
func testDiningHallsViewModelInitialState() async {
    let sut = DiningHallsViewModel()
    XCTAssertTrue(sut.isFetching) // should be fetching immediately after init
}
```

## Coverage Targets (Aspirational)

Since there is no existing test suite, these are targets to work toward:

- **Overall Coverage:** ≥60% (realistic first milestone)
- **Utility extensions (`Utils/`):** ≥90% (pure functions, easy to test)
- **ViewModels:** ≥70%
- **DataSource fetch/parse logic:** ≥70%
- **UI Views:** Not targeted (SwiftUI previews serve as visual verification)

## Running Tests

```bash
# Build and test from command line (requires Xcode)
xcodebuild test \
  -workspace berkeley-mobile.xcworkspace \
  -scheme berkeley-mobile \
  -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest'
```

From within Xcode: `Cmd+U` runs all tests.

## Best Practices

- ✅ Use `XCTAssertEqual`, `XCTAssertNil`, `XCTAssertTrue` with specific matchers
- ✅ Test pure transformation/parsing logic independently of Firestore
- ✅ Use `async throws` test methods for async ViewModel testing
- ✅ Test error paths — mock `throws` behavior in mock services
- ✅ Use `#Preview` macros in SwiftUI views for visual regression checking
- ❌ Do not write tests that require a live Firebase connection — mock the data layer
- ❌ Do not test private implementation details — test behavior via public interface
- ❌ Do not use `Thread.sleep` in tests — use `async/await` or `XCTestExpectation`
