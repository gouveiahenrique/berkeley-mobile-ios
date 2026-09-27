# Testing Standards

## Test Target Configuration

`berkeley-mobile.xcodeproj/project.pbxproj` declares exactly two `PBXNativeTarget` entries:
- `berkeley-mobile` (`productType = "com.apple.product-type.application"`)
- `BerkeleyMobileWidgetExtension` (`productType = "com.apple.product-type.app-extension"`)

No `PBXNativeTarget` with a test-bundle product type (`com.apple.product-type.bundle.unit-test` or `com.apple.product-type.bundle.ui-testing`) is present in `project.pbxproj`.

The project's one shared scheme, `berkeley-mobile.xcodeproj/xcshareddata/xcschemes/berkeley-mobile.xcscheme`, has a `<TestAction>` block with an empty `<Testables>` list:
```xml
<TestAction ...>
   <Testables>
   </Testables>
</TestAction>
```

A directory search (`find . -iname "*Test*"`, excluding `Pods/` and `.git/`) returned no matches anywhere in the repository.

## Conclusion

Based on the above, this repository does not currently declare a unit-test target, a UI-test target, or any test source files in the areas searched. No testing framework (e.g. XCTest usage, Quick/Nimble, etc.) was found in the repository outside of vendored code under `Pods/`.

- **Testing frameworks**: Not found in codebase.
- **Test organization**: Not applicable — no test target or test files exist to organize.
- **Unit/integration/e2e test patterns**: Not found in codebase.
- **Fixtures/mocks/test utilities**: Not found in codebase. (Sample/preview data exists for non-test purposes — e.g. `SafetyViewModel.getSampleSafetyLog()` in `berkeley-mobile/Safety/SafetyViewModel.swift` and the `#Preview` block in `BerkeleyMobileWidget/GymOccupancyWidget.swift` — but these are SwiftUI/WidgetKit preview helpers, not test fixtures, and are not invoked from any test target.)
- **Naming conventions for tests**: Not applicable.

## Observed Adjacent Patterns

While not tests, the repository does contain code paths intended for manual/interactive verification during development:
- `berkeley-mobile/Debug/DebugView.swift` and `DebugViewModel.swift` — a debug menu reachable via a shake gesture in `DEBUG` builds only (`#if DEBUG` in `berkeley-mobile/TabBarController.swift`'s `motionEnded`).
- SwiftUI `#Preview` blocks (e.g. `BerkeleyMobileWidget/GymOccupancyWidget.swift`) and sample-data static factory methods (e.g. `SafetyViewModel.getSampleSafetyLog()`) used for Xcode canvas previews rather than automated testing.

These are framework-supported development-time tools (Level 2: Xcode/SwiftUI provides `#Preview` and DEBUG-only compilation as platform capabilities), not a substitute for automated tests, and should not be interpreted as such.
