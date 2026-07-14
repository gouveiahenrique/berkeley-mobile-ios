# Testing Standards

## Testing Frameworks

No XCTest, XCTestCase, or third-party test framework files were found in the repository outside of the `Pods/` directory.

The CodeGraph tool annotated all inspected call sites with `⚠️ no covering tests found`. A search of the repository for files containing `XCTest` or `XCTestCase` returned only files inside `Pods/FirebaseAuth/`.

## Test Organization

Not found in codebase. No test target, test directory, or test scheme configuration was discovered in the inspected repository areas.

## Unit Tests

Not found in codebase.

## Integration Tests

Not found in codebase.

## UI Tests / End-to-End Tests

Not found in codebase.

## Fixtures and Mock Data

### Debug builds

`TabBarController.motionEnded(_:with:)` presents a `DebugView` when the device is shaken in `#DEBUG` builds. The `DebugViewModel` is instantiated via the FactoryKit container and is conditionally compiled:

```swift
#if DEBUG
var debugViewModel: Factory<DebugViewModel> {
    self { DebugViewModel(feedbackFormPresenter: self.feedbackFormPresenter()) }
}
#endif
```

### Sample data methods

`SafetyViewModel` contains a static `getSampleSafetyLog()` method that returns a hardcoded `BMSafetyLog`. This is referenced within `SafetyViewModel.swift` itself and appears to be used for SwiftUI preview support, not for production data.

### SwiftUI Previews

The codebase uses `#Preview` macros for component development. Examples observed:
- `BMFilterButton.swift` — `BMFilterButtonPreviewView` with `@State`
- `BMActionButton.swift` — preview with a tap handler
- `BMCachedAsyncImageView.swift` — preview with a remote image URL
- `BMContentUnavailableView.swift` — preview with static text
- `GymOccupancyWidget.swift` — multi-timeline preview with hardcoded occupancy percentages

These preview declarations are not test coverage.

## Observed Test-Adjacent Patterns

The migration system in `AppDelegate+Migration.swift` uses version comparison logic (`Version` struct) that would benefit from unit tests — the code comment notes `"This function should not be trimmed of old migrations"`, implying the accumulation of migration cases over time.

`AtomicDictionary` uses a POSIX read-write lock (`pthread_rwlock_t`) for thread safety. No concurrency tests were found in the inspected areas.
